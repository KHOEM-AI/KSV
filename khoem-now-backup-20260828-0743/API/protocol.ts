// =============================================================
// KSV — Protocol API
// Domain: Universal Protocol Abstraction Layer
// Device Type → Manufacturer → Protocol → Auth → AuthZ → Command
// =============================================================

import type { DeviceProtocol } from './device';

export type AdapterStatus = 'active' | 'inactive' | 'error' | 'updating';
export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error' | 'paused';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface ProtocolAdapter {
  adapterId: string;
  protocol: DeviceProtocol;
  name: string;
  version: string;
  status: AdapterStatus;
  supportedManufacturers: string[];
  supportedDeviceTypes: string[];
  isSecureChannel: boolean;
  requiresGateway: boolean;
  maxDevicesPerAdapter: number;
  currentDeviceCount: number;
  createdAt: string;
}

export interface ProtocolConnection {
  connectionId: string;
  deviceId: string;
  adapterId: string;
  protocol: DeviceProtocol;
  state: ConnectionState;
  connectedAt?: string;
  lastActivityAt?: string;
  signalStrength?: number;
  latencyMs?: number;
  gatewayId?: string;
  localAddress?: string;
  remoteAddress?: string;
  encryptionEnabled: boolean;
  authenticationMethod: string;
}

export interface ManufacturerProfile {
  manufacturerId: string;
  name: string;
  protocols: DeviceProtocol[];
  apiBaseUrl?: string;
  authType: 'oauth2' | 'api_key' | 'certificate' | 'none';
  requiresCloudAccount: boolean;
  sdkVersion?: string;
  notes?: string;
}

export interface ProtocolCommand {
  protocol: DeviceProtocol;
  deviceAddress: string;
  rawPayload: unknown;
  timeout: number;
  retryCount: number;
  requiresAck: boolean;
}

export interface ProtocolResponse {
  protocol: DeviceProtocol;
  deviceAddress: string;
  rawPayload: unknown;
  receivedAt: string;
  latencyMs: number;
  isAcknowledged: boolean;
}

// ---------------------------------------------------------------
// Bluetooth Specific
// ---------------------------------------------------------------

export interface BluetoothConfig {
  deviceAddress: string;           // MAC address
  serviceUUID: string;
  characteristicUUID: string;
  useLE: boolean;                  // BLE vs Classic
  paringRequired: boolean;
  encryptionRequired: boolean;
}

// ---------------------------------------------------------------
// Wi-Fi / HTTP API Specific
// ---------------------------------------------------------------

export interface WiFiConfig {
  deviceIp: string;
  port: number;
  useTLS: boolean;
  apiBasePath?: string;
  authType: 'bearer' | 'api_key' | 'basic' | 'none';
  // Credentials stored in SECURITY/key-management — never here
}

// ---------------------------------------------------------------
// MQTT Specific
// ---------------------------------------------------------------

export interface MQTTConfig {
  brokerUrl: string;
  port: number;
  useTLS: boolean;
  clientId: string;
  commandTopic: string;
  statusTopic: string;
  qosLevel: 0 | 1 | 2;
  retainMessages: boolean;
}

// ---------------------------------------------------------------
// Infrared Specific
// ---------------------------------------------------------------

export interface InfraredConfig {
  gatewayId: string;             // Must use a gateway with IR blaster
  frequency: number;
  protocol: 'nec' | 'sony' | 'rc5' | 'rc6' | 'raw';
  deviceCode?: string;
  commandCodes: Record<string, string>;
}

// ---------------------------------------------------------------
// Modbus / Industrial Specific
// ---------------------------------------------------------------

export interface ModbusConfig {
  deviceAddress: number;
  port: number;
  mode: 'rtu' | 'tcp';
  baudRate?: number;
  registers: Array<{
    name: string;
    address: number;
    type: 'coil' | 'discrete_input' | 'holding_register' | 'input_register';
    dataType: 'bool' | 'uint16' | 'int16' | 'float32';
    unit?: string;
    scaleFactor?: number;
  }>;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface ListAdaptersResponse {
  adapters: ProtocolAdapter[];
}

export interface GetConnectionsRequest {
  deviceId?: string;
  protocol?: DeviceProtocol;
  state?: ConnectionState;
  gatewayId?: string;
}

export interface GetConnectionsResponse {
  connections: ProtocolConnection[];
  total: number;
}

export interface TestConnectionRequest {
  deviceId: string;
  protocol: DeviceProtocol;
  timeoutMs?: number;
}

export interface TestConnectionResponse {
  success: boolean;
  latencyMs?: number;
  connectionId?: string;
  errorMessage?: string;
}

export interface ListManufacturersResponse {
  manufacturers: ManufacturerProfile[];
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const PROTOCOL_ROUTES = {
  // Adapters
  LIST_ADAPTERS:           'GET  /api/v1/protocols/adapters',
  GET_ADAPTER:             'GET  /api/v1/protocols/adapters/:adapterId',

  // Connections
  LIST_CONNECTIONS:        'GET  /api/v1/protocols/connections',
  GET_CONNECTION:          'GET  /api/v1/protocols/connections/:connectionId',
  TEST_CONNECTION:         'POST /api/v1/protocols/connections/test',
  DISCONNECT:              'POST /api/v1/protocols/connections/:connectionId/disconnect',
  RECONNECT:               'POST /api/v1/protocols/connections/:connectionId/reconnect',

  // Manufacturers
  LIST_MANUFACTURERS:      'GET  /api/v1/protocols/manufacturers',
  GET_MANUFACTURER:        'GET  /api/v1/protocols/manufacturers/:manufacturerId',

  // Protocol-specific configs
  GET_PROTOCOL_CONFIG:     'GET  /api/v1/protocols/:protocol/config/:deviceId',
  UPDATE_PROTOCOL_CONFIG:  'PUT  /api/v1/protocols/:protocol/config/:deviceId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface ProtocolAPIHandlers {
  listAdapters(): Promise<ListAdaptersResponse>;
  getAdapter(adapterId: string): Promise<ProtocolAdapter>;
  listConnections(accountId: string, req: GetConnectionsRequest): Promise<GetConnectionsResponse>;
  getConnection(connectionId: string, accountId: string): Promise<ProtocolConnection>;
  testConnection(accountId: string, req: TestConnectionRequest): Promise<TestConnectionResponse>;
  disconnect(connectionId: string, accountId: string): Promise<{ success: boolean }>;
  reconnect(connectionId: string, accountId: string): Promise<{ success: boolean; connectionId: string }>;
  listManufacturers(): Promise<ListManufacturersResponse>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const PROTOCOL_SECURITY_RULES = {
  /** All protocol communication must be encrypted where the protocol supports it. */
  ENCRYPTION_PREFERRED: true,

  /**
   * Protocol adapter credentials (API keys, certs) are stored in
   * SECURITY/key-management — never in this API layer.
   */
  CREDENTIALS_IN_KEY_MANAGEMENT: true,

  /**
   * Industrial protocols (Modbus, BACnet) require higher permission levels
   * due to safety-critical nature.
   */
  INDUSTRIAL_PROTOCOLS_HIGHER_PERMISSION: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type ProtocolAuditEvent =
  | 'protocol.connection.established'
  | 'protocol.connection.failed'
  | 'protocol.connection.disconnected'
  | 'protocol.connection.test'
  | 'protocol.adapter.status_changed'
  | 'protocol.config.updated';
