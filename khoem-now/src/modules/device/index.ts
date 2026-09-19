/**
 * KSV — Device Module
 * Location: src/modules/device/index.ts
 */

export { deviceRoutes } from './routes/device.routes';
export { default as deviceRouter } from './routes/device.routes';

export { deviceController } from './controllers/device.controller';
export { DeviceController } from './controllers/device.controller';

export { deviceService } from './services/device.service';
export { DeviceService } from './services/device.service';

export { deviceRepository } from './repositories/device.repository';
export { DeviceRepository } from './repositories/device.repository';

export { Device } from './models/device.model';
export type {
  IDevice,
  DeviceStatus,
  DeviceCategory,
} from './models/device.model';

export type {
  RegisterDeviceDto,
  UpdateDeviceDto,
  DeviceResponseDto,
  DeviceListQueryDto,
} from './dto/device.dto';
