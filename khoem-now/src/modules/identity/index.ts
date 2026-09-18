/**
 * KSV — Identity Module
 * Location: src/modules/identity/index.ts
 * 
 * Export ទាំងអស់ពី Module នេះ
 */

// Routes
export { identityRoutes } from './routes/identity.routes';
export { default as identityRouter } from './routes/identity.routes';

// Controller
export { identityController } from './controllers/identity.controller';
export { IdentityController } from './controllers/identity.controller';

// Service
export { identityService } from './services/identity.service';
export { IdentityService } from './services/identity.service';

// Repository
export { identityRepository } from './repositories/identity.repository';
export { IdentityRepository } from './repositories/identity.repository';

// Model
export { Identity } from './models/identity.model';
export type { IIdentity } from './models/identity.model';

// DTO
export type {
  CreateIdentityDto,
  UpdateIdentityDto,
  LoginDto,
  IdentityResponseDto,
  LoginResponseDto,
} from './dto/identity.dto';
