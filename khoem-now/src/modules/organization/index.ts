/**
 * KSV — Organization Module
 * Location: src/modules/organization/index.ts
 */

export { organizationRoutes } from './routes/organization.routes';
export { default as organizationRouter } from './routes/organization.routes';

export { organizationController } from './controllers/organization.controller';
export { OrganizationController } from './controllers/organization.controller';

export { organizationService } from './services/organization.service';
export { OrganizationService } from './services/organization.service';

export { organizationRepository } from './repositories/organization.repository';
export { OrganizationRepository } from './repositories/organization.repository';

export { Organization } from './models/organization.model';
export type { IOrganization, OrgRole } from './models/organization.model';

export type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  OrganizationResponseDto,
  MemberResponseDto,
} from './dto/organization.dto';
