// Pure mapping used by seed-extra-devices.ts (no database), so it can be tested with `npm run test:seed`.

// khoem-now / Safety Engine device types: appliance, vehicle, hvac, robot ... Everything else keeps its catalog name.
const DB_TYPE: Record<string, string> = {
  cooker: 'appliance',
  heater: 'appliance',
  dishwasher: 'appliance',
  washer: 'appliance',
  car: 'vehicle',
  motorcycle: 'vehicle',
  ac: 'hvac',
};

// Heavy machines move or cut: treat them as mobile robots for the Safety Engine, everything else as consumer devices.
const MOBILE = new Set(['robot', 'motor']);

export interface DeviceInput {
  id: string;
  name: string;
  type: string;
}

export interface DeviceRecord {
  name: string;
  deviceCode: string;
  type: string;
  status: 'offline';
  criticality: 'robot_mobile' | 'consumer';
}

export const dbTypeFor = (catalogType: string): string => DB_TYPE[catalogType] ?? catalogType;

export function deviceRecordFor(d: DeviceInput): DeviceRecord {
  return {
    name: d.name,
    deviceCode: d.id,
    type: dbTypeFor(d.type),
    status: 'offline',
    criticality: MOBILE.has(d.type) ? 'robot_mobile' : 'consumer',
  };
}
