/**
 * KSV — Protocol Sub-module
 */

export { protocolRoutes } from './routes/protocol.routes';
export { default as protocolRouter } from './routes/protocol.routes';

export { protocolController } from './controllers/protocol.controller';
export { ProtocolController } from './controllers/protocol.controller';

export { protocolService } from './services/protocol.service';
export { ProtocolService } from './services/protocol.service';

export { protocolRepository } from './repositories/protocol.repository';
export { ProtocolRepository } from './repositories/protocol.repository';

export { Protocol } from './models/protocol.model';
export type { IProtocol } from './models/protocol.model';

export type {
  CreateProtocolDto,
  UpdateProtocolDto,
  ProtocolResponseDto,
} from './dto/protocol.dto';
