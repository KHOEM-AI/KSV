/**
 * KSV — Organization Repository
 * Location: src/modules/organization/repositories/organization.repository.ts
 */

import { Organization, type IOrganization } from '../models/organization.model';

export class OrganizationRepository {
  async findByOrgId(orgId: string): Promise<IOrganization | null> {
    return Organization.findOne({ orgId });
  }

  async findBySlug(slug: string): Promise<IOrganization | null> {
    return Organization.findOne({ slug });
  }

  async findByUserId(userId: string): Promise<IOrganization[]> {
    return Organization.find({ 'members.userId': userId }).sort({
      createdAt: -1,
    });
  }

  async create(data: Partial<IOrganization>): Promise<IOrganization> {
    return Organization.create(data);
  }

  async update(
    orgId: string,
    data: Partial<IOrganization>
  ): Promise<IOrganization | null> {
    return Organization.findOneAndUpdate(
      { orgId },
      { $set: data },
      { new: true }
    );
  }

  async delete(orgId: string): Promise<boolean> {
    const result = await Organization.deleteOne({ orgId });
    return result.deletedCount === 1;
  }

  async addMember(
    orgId: string,
    member: { userId: string; role: string }
  ): Promise<IOrganization | null> {
    return Organization.findOneAndUpdate(
      { orgId },
      { $push: { members: { ...member, joinedAt: new Date() } } },
      { new: true }
    );
  }

  async removeMember(
    orgId: string,
    userId: string
  ): Promise<IOrganization | null> {
    return Organization.findOneAndUpdate(
      { orgId },
      { $pull: { members: { userId } } },
      { new: true }
    );
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    role: string
  ): Promise<IOrganization | null> {
    return Organization.findOneAndUpdate(
      { orgId, 'members.userId': userId },
      { $set: { 'members.$.role': role } },
      { new: true }
    );
  }
}

export const organizationRepository = new OrganizationRepository();
