/**
 * KSV — Organization Service
 * Location: src/modules/organization/services/organization.service.ts
 */

import crypto from 'node:crypto';
import { organizationRepository } from '../repositories/organization.repository';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  OrganizationResponseDto,
  MemberResponseDto,
} from '../dto/organization.dto';

export class OrganizationService {
  private toResponse(org: any): OrganizationResponseDto {
    return {
      orgId: org.orgId,
      name: org.name,
      slug: org.slug,
      ownerUserId: org.ownerUserId,
      memberCount: org.members?.length ?? 0,
      status: org.status,
      plan: org.plan,
      createdAt: org.createdAt.toISOString(),
    };
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(
    ownerUserId: string,
    dto: CreateOrganizationDto
  ): Promise<OrganizationResponseDto> {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await organizationRepository.findBySlug(slug);
    if (existing) throw new Error('Organization slug already taken');

    const orgId = `ORG-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const org = await organizationRepository.create({
      orgId,
      name: dto.name,
      slug,
      ownerUserId,
      plan: dto.plan || 'free',
      members: [
        { userId: ownerUserId, role: 'owner', joinedAt: new Date() },
      ],
    });

    return this.toResponse(org);
  }

  async listForUser(userId: string): Promise<OrganizationResponseDto[]> {
    const orgs = await organizationRepository.findByUserId(userId);
    return orgs.map((o) => this.toResponse(o));
  }

  async getById(orgId: string): Promise<OrganizationResponseDto> {
    const org = await organizationRepository.findByOrgId(orgId);
    if (!org) throw new Error('Organization not found');
    return this.toResponse(org);
  }

  async update(
    orgId: string,
    dto: UpdateOrganizationDto
  ): Promise<OrganizationResponseDto> {
    const org = await organizationRepository.update(orgId, dto as any);
    if (!org) throw new Error('Organization not found');
    return this.toResponse(org);
  }

  async delete(orgId: string): Promise<void> {
    const ok = await organizationRepository.delete(orgId);
    if (!ok) throw new Error('Organization not found');
  }

  async addMember(
    orgId: string,
    dto: AddMemberDto
  ): Promise<MemberResponseDto[]> {
    const org = await organizationRepository.addMember(orgId, {
      userId: dto.userId,
      role: dto.role,
    });
    if (!org) throw new Error('Organization not found');
    return org.members.map((m) => ({
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  async removeMember(orgId: string, userId: string): Promise<void> {
    const org = await organizationRepository.removeMember(orgId, userId);
    if (!org) throw new Error('Organization or member not found');
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    dto: UpdateMemberRoleDto
  ): Promise<MemberResponseDto[]> {
    const org = await organizationRepository.updateMemberRole(
      orgId,
      userId,
      dto.role
    );
    if (!org) throw new Error('Organization or member not found');
    return org.members.map((m) => ({
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }
}

export const organizationService = new OrganizationService();
