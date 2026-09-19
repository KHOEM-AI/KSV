/**
 * KSV — Organization DTO
 * Location: src/modules/organization/dto/organization.dto.ts
 */

import type { OrgRole } from '../models/organization.model';

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface UpdateOrganizationDto {
  name?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface AddMemberDto {
  userId: string;
  role: OrgRole;
}

export interface UpdateMemberRoleDto {
  role: OrgRole;
}

export interface OrganizationResponseDto {
  orgId: string;
  name: string;
  slug: string;
  ownerUserId: string;
  memberCount: number;
  status: string;
  plan: string;
  createdAt: string;
}

export interface MemberResponseDto {
  userId: string;
  role: OrgRole;
  joinedAt: string;
}
