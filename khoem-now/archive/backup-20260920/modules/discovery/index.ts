/**
 * KSV — Discovery Module
 * Location: src/modules/discovery/index.ts
 */

export { discoveryRoutes } from './routes/discovery.routes';
export { default as discoveryRouter } from './routes/discovery.routes';

export { discoveryController } from './controllers/discovery.controller';
export { DiscoveryController } from './controllers/discovery.controller';

export { discoveryService } from './services/discovery.service';
export { DiscoveryService } from './services/discovery.service';

export { discoveryRepository } from './repositories/discovery.repository';
export { DiscoveryRepository } from './repositories/discovery.repository';

export { Discovery } from './models/discovery.model';
export type {
  IDiscovery,
  DiscoveryStatus,
} from './models/discovery.model';

export type {
  AnnounceDiscoveryDto,
  IgnoreDiscoveryDto,
  BlockDiscoveryDto,
  DiscoveryResponseDto,
  DiscoveryListQueryDto,
} from './dto/discovery.dto';
