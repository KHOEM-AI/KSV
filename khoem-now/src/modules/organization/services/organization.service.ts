/**
 * KSV — Organization Service
 * Location: src/modules/organization/services/organization.service.ts
 */

import crypto from 'node:crypto';
import { organizationRepository } from '../repositories/organization.repository';
import type { OrgRole } from '../models/organization.model';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  OrganizationResponseDto,
  MemberResponseDto,
} from '../dto/organization.dto';

const MANAGE_ROLES: OrgRole[] = ['Owner', 'OrgAdmin'];
const OWNER_ONLY: OrgRole[] = ['Owner'];

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

  // ផ្ទៀងផ្ទាត់ថា caller ជា member ពិតប្រាកដ (ពី database មិនមែនពី client)
  private async requireMember(
    orgId: string,
    callerId: string,
    allowed?: OrgRole[]
  ) {
    const org = await organizationRepository.findByOrgId(orgId);
    const member = org?.members.find((m) => m.userId === callerId);
    if (!org || !member) throw new Error('Organization not found');
    if (allowed && !allowed.includes(member.role)) throw new Error('Forbidden');
    return org;
  }

  // OrgAdmin មិនអាចប្តូរ ឬដក Owner បាន — មានតែ Owner ប៉ុណ្ណោះ
  private assertCanTouchOwner(
    org: any,
    callerId: string,
    targetUserId: string
  ) {
    const caller = org.members.find((m: any) => m.userId === callerId);
    const target = org.members.find((m: any) => m.userId === targetUserId);
    if (target?.role === 'Owner' && caller?.role !== 'Owner') {
      throw new Error('Forbidden');
    }
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
        { userId: ownerUserId, role: 'Owner', joinedAt: new Date() },
      ],
    });

    return this.toResponse(org);
  }

  async listForUser(userId: string): Promise<OrganizationResponseDto[]> {
    const orgs = await organizationRepository.findByUserId(userId);
    return orgs.map((o) => this.toResponse(o));
  }

  async getById(
    orgId: string,
    callerId: string
  ): Promise<OrganizationResponseDto> {
    const org = await this.requireMember(orgId, callerId);
    return this.toResponse(org);
  }

  async update(
    orgId: string,
    callerId: string,
    dto: UpdateOrganizationDto
  ): Promise<OrganizationResponseDto> {
    await this.requireMember(orgId, callerId, MANAGE_ROLES);
    const allowed: UpdateOrganizationDto = {};
    if (dto.name !== undefined) allowed.name = dto.name;
    if (dto.plan !== undefined) allowed.plan = dto.plan;
    const org = await organizationRepository.update(orgId, allowed as any);
    if (!org) throw new Error('Organization not found');
    return this.toResponse(org);
  }

  async delete(orgId: string, callerId: string): Promise<void> {
    await this.requireMember(orgId, callerId, OWNER_ONLY);
    const ok = await organizationRepository.delete(orgId);
    if (!ok) throw new Error('Organization not found');
  }

  async addMember(
    orgId: string,
    callerId: string,
    dto: AddMemberDto
  ): Promise<MemberResponseDto[]> {
    await this.requireMember(orgId, callerId, MANAGE_ROLES);
    if (dto.role === 'Owner') throw new Error('Forbidden');
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

  async removeMember(
    orgId: string,
    callerId: string,
    userId: string
  ): Promise<void> {
    const current = await this.requireMember(orgId, callerId, MANAGE_ROLES);
    this.assertCanTouchOwner(current, callerId, userId);
    const org = await organizationRepository.removeMember(orgId, userId);
    if (!org) throw new Error('Organization or member not found');
  }

  async updateMemberRole(
    orgId: string,
    callerId: string,
    userId: string,
    dto: UpdateMemberRoleDto
  ): Promise<MemberResponseDto[]> {
    const current = await this.requireMember(orgId, callerId, MANAGE_ROLES);
    if (dto.role === 'Owner') throw new Error('Forbidden');
    this.assertCanTouchOwner(current, callerId, userId);
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
