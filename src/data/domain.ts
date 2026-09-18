export type DeviceStatus = 'online' | 'offline' | 'warning' | 'maintenance' | 'pairing' | 'error' | 'decommissioned';
export type DeviceCategory = 'access' | 'climate' | 'industrial' | 'vehicle' | 'sensor' | 'network';

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  protocol: 'Bluetooth' | 'Wi-Fi' | 'MQTT' | 'IR' | 'Zigbee' | 'LoRaWAN';
  status: DeviceStatus;
  site: string;
  building: string;
  floor: string;
  battery?: number;
  signal: number;
  lastSeen: string;
  firmware: string;
  capabilities: string[];
}

export interface SafetyRule {
  id: string;
  name: string;
  scope: 'door' | 'vehicle' | 'industrial';
  condition: string;
  action: string;
  enabled: boolean;
  triggered: number;
  lastTriggered?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ProtocolAdapter {
  id: string;
  name: string;
  type: 'Bluetooth' | 'Wi-Fi' | 'MQTT' | 'IR' | 'Zigbee';
  devices: number;
  latency: number;
  uptime: number;
  encryption: string;
  status: 'active' | 'degraded' | 'offline';
}

export interface Gateway {
  id: string;
  name: string;
  site: string;
  ip: string;
  mode: 'online' | 'offline' | 'degraded';
  devices: number;
  cpu: number;
  memory: number;
  firmware: string;
  lastSync: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  result: 'success' | 'denied' | 'error';
  category: 'auth' | 'device' | 'safety' | 'admin' | 'network';
}

export interface SecuritySession {
  id: string;
  user: string;
  email: string;
  role: string;
  method: 'OAuth 2.0' | 'OIDC' | 'OTP' | 'Password';
  ip: string;
  location: string;
  started: string;
  lastActive: string;
  mfa: boolean;
  status: 'active' | 'expired' | 'revoked';
}

export interface CountryConfig {
  code: string;
  name: string;
  timezone: string;
  utcOffset: string;
  locale: string;
  sites: number;
  devices: number;
  compliance: 'verified' | 'pending' | 'n/a';
  flag: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  holder: string;
  issued: string;
  expires: string;
  category: string;
  verified: boolean;
  url: string;
}

export const stats = {
  totalDevices: 12847,
  onlineDevices: 11902,
  safetyRules: 342,
  activeGateways: 86,
  countries: 41,
  openAlerts: 7,
  uptimeDays: 184,
  avgLatency: 38,
};

export const devices: Device[] = [
  { id: 'DEV-04821', name: 'North Vault Door', category: 'access', protocol: 'MQTT', status: 'online', site: 'Frankfurt HQ', building: 'Tower A', floor: 'B2', battery: 92, signal: 88, lastSeen: '2s ago', firmware: '4.2.1', capabilities: ['Lock/Unlock', 'Audit Trail', 'Tamper Alert'] },
  { id: 'DEV-04822', name: 'Cleanroom HVAC Unit 3', category: 'climate', protocol: 'Wi-Fi', status: 'warning', site: 'Taipei Fab', building: 'FAB-2', floor: 'L1', signal: 71, lastSeen: '14s ago', firmware: '3.8.0', capabilities: ['Temp Control', 'Humidity', 'Filter Status'] },
  { id: 'DEV-04823', name: 'Press Line 7 Interlock', category: 'industrial', protocol: 'Zigbee', status: 'online', site: 'Stuttgart Plant', building: 'Hall 4', floor: 'GF', battery: 64, signal: 95, lastSeen: '1s ago', firmware: '5.1.2', capabilities: ['E-Stop', 'Light Curtain', 'Speed Limit'] },
  { id: 'DEV-04824', name: 'Fleet Van KR-2291', category: 'vehicle', protocol: 'Bluetooth', status: 'offline', site: 'Seoul Depot', building: 'Garage 1', floor: 'GF', battery: 0, signal: 0, lastSeen: '6h ago', firmware: '2.4.0', capabilities: ['Immobilizer', 'Geo-Fence', 'Ignition Lock'] },
  { id: 'DEV-04825', name: 'Rooftop Air Sensor', category: 'sensor', protocol: 'LoRaWAN', status: 'online', site: 'Frankfurt HQ', building: 'Tower B', floor: 'R', battery: 78, signal: 62, lastSeen: '8s ago', firmware: '1.9.3', capabilities: ['CO2', 'PM2.5', 'Temp'] },
  { id: 'DEV-04826', name: 'East Gate Barrier', category: 'access', protocol: 'MQTT', status: 'maintenance', site: 'Dubai Logistics', building: 'Perimeter', floor: 'GF', signal: 80, lastSeen: '3m ago', firmware: '4.0.0', capabilities: ['Barrier Control', 'Plate Reader', 'Manual Override'] },
  { id: 'DEV-04827', name: 'Core Switch RACK-12', category: 'network', protocol: 'Wi-Fi', status: 'online', site: 'Singapore DC', building: 'DC-1', floor: 'L3', signal: 100, lastSeen: '1s ago', firmware: '6.2.0', capabilities: ['VLAN', 'QoS', 'Port Isolation'] },
  { id: 'DEV-04828', name: 'Robot Arm RA-04', category: 'industrial', protocol: 'MQTT', status: 'warning', site: 'Osaka Factory', building: 'Line 2', floor: 'GF', signal: 84, lastSeen: '22s ago', firmware: '5.0.4', capabilities: ['Force Limit', 'Speed Zone', 'Collision Detect'] },
  { id: 'DEV-04829', name: 'Server Room Door', category: 'access', protocol: 'Zigbee', status: 'online', site: 'Singapore DC', building: 'DC-1', floor: 'L2', battery: 88, signal: 91, lastSeen: '4s ago', firmware: '4.2.1', capabilities: ['Lock/Unlock', 'Badge Log', 'Duress Code'] },
  { id: 'DEV-04830', name: 'Cold Storage Monitor', category: 'climate', protocol: 'Wi-Fi', status: 'online', site: 'Rotterdam Port', building: 'Warehouse C', floor: 'GF', signal: 76, lastSeen: '11s ago', firmware: '3.8.0', capabilities: ['Temp', 'Door Open', 'Power Loss'] },
];

export const safetyRules: SafetyRule[] = [
  { id: 'SAFE-001', name: 'Door Force-Lock on Tamper', scope: 'door', condition: 'Tamper sensor triggered', action: 'Lock all access points + alert security', enabled: true, triggered: 3, lastTriggered: '2d ago', severity: 'critical' },
  { id: 'SAFE-002', name: 'Vehicle Immobilize Outside Geo-Fence', scope: 'vehicle', condition: 'GPS outside permitted radius', action: 'Disable ignition + notify fleet ops', enabled: true, triggered: 12, lastTriggered: '5h ago', severity: 'high' },
  { id: 'SAFE-003', name: 'Press E-Stop on Light Curtain Break', scope: 'industrial', condition: 'Light curtain beam broken', action: 'Halt press line + lock controls', enabled: true, triggered: 0, severity: 'critical' },
  { id: 'SAFE-004', name: 'Robot Speed Limit in Human Zone', scope: 'industrial', condition: 'Human presence sensor active', action: 'Reduce arm speed to 0.25 m/s', enabled: true, triggered: 47, lastTriggered: '1h ago', severity: 'high' },
  { id: 'SAFE-005', name: 'Cold Storage Temp Floor', scope: 'industrial', condition: 'Temp above -18°C for >5 min', action: 'Alert + auto-cool boost', enabled: true, triggered: 2, lastTriggered: '3d ago', severity: 'medium' },
  { id: 'SAFE-006', name: 'Duress Code Silent Alarm', scope: 'door', condition: 'Duress PIN entered', action: 'Unlock + silent dispatch to monitoring', enabled: true, triggered: 0, severity: 'critical' },
  { id: 'SAFE-007', name: 'Ignition Lock After Hours', scope: 'vehicle', condition: 'Start outside shift window', action: 'Require supervisor OTP', enabled: false, triggered: 8, lastTriggered: '1w ago', severity: 'low' },
  { id: 'SAFE-008', name: 'HVAC Emergency Shutdown', scope: 'industrial', condition: 'Smoke detector active in zone', action: 'Cut HVAC power + unlock exits', enabled: true, triggered: 0, severity: 'critical' },
];

export const protocols: ProtocolAdapter[] = [
  { id: 'PROTO-BLE', name: 'Bluetooth LE Adapter', type: 'Bluetooth', devices: 1842, latency: 22, uptime: 99.97, encryption: 'AES-CCM', status: 'active' },
  { id: 'PROTO-WIFI', name: 'Wi-Fi 6 Adapter', type: 'Wi-Fi', devices: 4210, latency: 14, uptime: 99.92, encryption: 'WPA3-Enterprise', status: 'active' },
  { id: 'PROTO-MQTT', name: 'MQTT Broker Cluster', type: 'MQTT', devices: 3987, latency: 38, uptime: 99.99, encryption: 'TLS 1.3', status: 'active' },
  { id: 'PROTO-IR', name: 'Infrared Bridge', type: 'IR', devices: 612, latency: 45, uptime: 99.81, encryption: 'Pairing Key', status: 'degraded' },
  { id: 'PROTO-ZIG', name: 'Zigbee 3.0 Mesh', type: 'Zigbee', devices: 2196, latency: 31, uptime: 99.95, encryption: 'AES-128', status: 'active' },
];

export const gateways: Gateway[] = [
  { id: 'GW-FRA-01', name: 'Frankfurt Edge Controller', site: 'Frankfurt HQ', ip: '10.20.1.4', mode: 'online', devices: 412, cpu: 34, memory: 58, firmware: '8.1.0', lastSync: '12s ago' },
  { id: 'GW-SIN-01', name: 'Singapore Edge Controller', site: 'Singapore DC', ip: '10.30.2.4', mode: 'online', devices: 388, cpu: 41, memory: 62, firmware: '8.1.0', lastSync: '8s ago' },
  { id: 'GW-TPE-01', name: 'Taipei Edge Controller', site: 'Taipei Fab', ip: '10.40.1.9', mode: 'degraded', devices: 256, cpu: 78, memory: 84, firmware: '8.0.4', lastSync: '4m ago' },
  { id: 'GW-STG-01', name: 'Stuttgart Edge Controller', site: 'Stuttgart Plant', ip: '10.50.1.2', mode: 'online', devices: 331, cpu: 28, memory: 49, firmware: '8.1.0', lastSync: '15s ago' },
  { id: 'GW-DXB-01', name: 'Dubai Edge Controller', site: 'Dubai Logistics', ip: '10.60.1.7', mode: 'offline', devices: 0, cpu: 0, memory: 0, firmware: '7.9.2', lastSync: '2h ago' },
  { id: 'GW-SEL-01', name: 'Seoul Edge Controller', site: 'Seoul Depot', ip: '10.70.1.3', mode: 'online', devices: 174, cpu: 52, memory: 67, firmware: '8.1.0', lastSync: '6s ago' },
];

export const auditEvents: AuditEvent[] = [
  { id: 'AUD-99201', timestamp: '2026-08-26 14:32:11', actor: 'a.muller@ksv.io', action: 'UNLOCK', target: 'North Vault Door', ip: '10.20.1.55', result: 'success', category: 'device' },
  { id: 'AUD-99200', timestamp: '2026-08-26 14:28:44', actor: 'system', action: 'SAFETY_RULE_TRIGGERED', target: 'Robot Speed Limit in Human Zone', ip: '10.40.1.9', result: 'success', category: 'safety' },
  { id: 'AUD-99199', timestamp: '2026-08-26 14:15:02', actor: 'unknown', action: 'LOGIN_ATTEMPT', target: 'admin@ksv.io', ip: '203.0.113.77', result: 'denied', category: 'auth' },
  { id: 'AUD-99198', timestamp: '2026-08-26 14:02:19', actor: 'j.park@ksv.io', action: 'FIRMWARE_UPDATE', target: 'Robot Arm RA-04', ip: '10.70.1.3', result: 'success', category: 'admin' },
  { id: 'AUD-99197', timestamp: '2026-08-26 13:48:55', actor: 'system', action: 'GATEWAY_RECONNECT', target: 'Taipei Edge Controller', ip: '10.40.1.9', result: 'success', category: 'network' },
  { id: 'AUD-99196', timestamp: '2026-08-26 13:30:12', actor: 'c.silva@ksv.io', action: 'POLICY_CHANGE', target: 'Building Tower A access policy', ip: '10.20.1.55', result: 'success', category: 'admin' },
  { id: 'AUD-99195', timestamp: '2026-08-26 13:12:40', actor: 'unknown', action: 'OTP_RECOVERY', target: 'k.tanaka@ksv.io', ip: '198.51.100.4', result: 'denied', category: 'auth' },
  { id: 'AUD-99194', timestamp: '2026-08-26 12:55:33', actor: 'system', action: 'DEVICE_OFFLINE', target: 'Fleet Van KR-2291', ip: '10.70.1.3', result: 'success', category: 'device' },
];

export const sessions: SecuritySession[] = [
  { id: 'SES-501', user: 'Anna Müller', email: 'a.muller@ksv.io', role: 'Site Admin', method: 'OAuth 2.0', ip: '10.20.1.55', location: 'Frankfurt, DE', started: '2026-08-26 08:14', lastActive: '2m ago', mfa: true, status: 'active' },
  { id: 'SES-502', user: 'Ji-ho Park', email: 'j.park@ksv.io', role: 'Safety Engineer', method: 'OIDC', ip: '10.70.1.22', location: 'Seoul, KR', started: '2026-08-26 06:02', lastActive: '11m ago', mfa: true, status: 'active' },
  { id: 'SES-503', user: 'Carlos Silva', email: 'c.silva@ksv.io', role: 'Org Owner', method: 'OAuth 2.0', ip: '10.20.1.60', location: 'Frankfurt, DE', started: '2026-08-26 07:30', lastActive: '1h ago', mfa: true, status: 'active' },
  { id: 'SES-504', user: 'Kenji Tanaka', email: 'k.tanaka@ksv.io', role: 'Operator', method: 'Password', ip: '10.40.1.31', location: 'Osaka, JP', started: '2026-08-25 22:10', lastActive: '14h ago', mfa: false, status: 'expired' },
  { id: 'SES-505', user: 'Mei Lin', email: 'm.lin@ksv.io', role: 'Network Admin', method: 'OIDC', ip: '10.30.2.18', location: 'Singapore, SG', started: '2026-08-26 05:45', lastActive: '4m ago', mfa: true, status: 'active' },
];


export const countries: CountryConfig[] = [
  { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin', utcOffset: '+02:00', locale: 'de-DE', sites: 4, devices: 1340, compliance: 'verified', flag: 'DE' },
  { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore', utcOffset: '+08:00', locale: 'en-SG', sites: 2, devices: 2110, compliance: 'verified', flag: 'SG' },
  { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo', utcOffset: '+09:00', locale: 'ja-JP', sites: 3, devices: 1640, compliance: 'verified', flag: 'JP' },
  { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul', utcOffset: '+09:00', locale: 'ko-KR', sites: 2, devices: 980, compliance: 'verified', flag: 'KR' },
  { code: 'AE', name: 'United Arab Emirates', timezone: 'Asia/Dubai', utcOffset: '+04:00', locale: 'ar-AE', sites: 2, devices: 740, compliance: 'pending', flag: 'AE' },
  { code: 'NL', name: 'Netherlands', timezone: 'Europe/Amsterdam', utcOffset: '+02:00', locale: 'nl-NL', sites: 1, devices: 520, compliance: 'verified', flag: 'NL' },
  { code: 'US', name: 'United States', timezone: 'America/New_York', utcOffset: '-04:00', locale: 'en-US', sites: 6, devices: 2890, compliance: 'verified', flag: 'US' },
  { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo', utcOffset: '-03:00', locale: 'pt-BR', sites: 2, devices: 410, compliance: 'pending', flag: 'BR' },
];

export const certificates: Certificate[] = [
  { id: 'CERT-01', title: 'Coding Foundations', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-07-31', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-4WMNT8MZ/image/png' },
  { id: 'CERT-02', title: 'Sololearn Certificate #2', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-FQXPSLUW/image/png' },
  { id: 'CERT-03', title: 'Introduction to SQL', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-09', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-T1WYSOHU/image/png' },
  { id: 'CERT-04', title: 'Tech for Everyone', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-12', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-I6OFSBAU/image/png' },
  { id: 'CERT-05', title: 'Sololearn Certificate #5', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-IXX7OEVL/image/png' },
  { id: 'CERT-06', title: 'Python Developer', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-02', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-AYYCWFZD/image/png' },
  { id: 'CERT-07', title: 'Sololearn Certificate #7', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-3LIHOX01/image/png' },
  { id: 'CERT-08', title: 'Sololearn Certificate #8', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-HAW7ZIH5/image/png' },
  { id: 'CERT-09', title: 'Sololearn Certificate #9', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-U8DL49ZZ/image/png' },
  { id: 'CERT-10', title: 'Think Creatively with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-27', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-SI2WZX43/image/png' },
  { id: 'CERT-11', title: 'Data Literacy with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-28', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-SUOWGF8T/image/png' },
  { id: 'CERT-12', title: 'Ethical AI Foundations', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-28', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-I4TIACOI/image/png' },
  { id: 'CERT-13', title: 'Introduction to LLMs', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-28', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-GT2PAJTL/image/png' },
  { id: 'CERT-14', title: 'AI-Powered A/B Testing', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-28', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-CCYNOT2R/image/png' },
  { id: 'CERT-15', title: 'Write with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-29', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-ZYSDAZM8/image/png' },
  { id: 'CERT-16', title: 'Prompt Engineering', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-29', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-7ABADG4R/image/png' },
  { id: 'CERT-17', title: 'Critical Thinking in the Age of AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-04-30', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-DBRL4YLD/image/png' },
  { id: 'CERT-18', title: 'Social Media Marketing with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-033EXHKA/image/png' },
  { id: 'CERT-19', title: 'Brainstorm with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-UYFGANZQ/image/png' },
  { id: 'CERT-20', title: 'Machine Learning for Beginners', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-2M47YBCR/image/png' },
  { id: 'CERT-21', title: 'SEO with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-WKCFVLYI/image/png' },
  { id: 'CERT-22', title: 'Agentic Workflows', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-CRBRNFSO/image/png' },
  { id: 'CERT-23', title: 'Bias Detection and Mitigation in AI Systems', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-SUEHSLUF/image/png' },
  { id: 'CERT-24', title: 'AI-Powered Product & UX', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-SI4N5SIB/image/png' },
  { id: 'CERT-25', title: 'Growth Mindset in the Age of AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-01', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-ZTIH8SKI/image/png' },
  { id: 'CERT-26', title: 'Introduction to JavaScript', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-06', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-OFASKCAF/image/png' },
  { id: 'CERT-27', title: 'Project Planning with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-02', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-SCJHQBG0/image/png' },
  { id: 'CERT-28', title: 'Visualize Your Data', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-02', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-JAJVCQCJ/image/png' },
  { id: 'CERT-29', title: 'Research with AI', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-02', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-DJ9YJOG5/image/png' },
  { id: 'CERT-30', title: 'Vibe Coding', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-09', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-FYISPG0F/image/png' },
  { id: 'CERT-31', title: 'Angular', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-08', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-AXMQ8X3Q/image/png' },
  { id: 'CERT-32', title: 'JavaScript Intermediate', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-12', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-OU33MLMF/image/png' },
  { id: 'CERT-33', title: 'Front-end for Beginners', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-18', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-K47BIVEI/image/png' },
  { id: 'CERT-34', title: 'Introduction to Python', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-27', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-AREK9EJE/image/png' },
  { id: 'CERT-35', title: 'Introduction to C#', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-05-31', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-6ZXHTBFA/image/png' },
  { id: 'CERT-36', title: 'Sololearn Certificate #36', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-ZDBUNAIR/image/png' },
  { id: 'CERT-37', title: 'Introduction to Java', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-11', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-2SCXNBZ6/image/png' },
  { id: 'CERT-38', title: 'C# Intermediate', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-04', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-CAZPORAO/image/png' },
  { id: 'CERT-39', title: 'TypeScript for Beginners: Code in the AI Era', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-11', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-S072WEWW/image/png' },
  { id: 'CERT-40', title: 'Introduction to C', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-13', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-OP1HINXS/image/png' },
  { id: 'CERT-41', title: 'Python Intermediate', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-13', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-GPX6LLCC/image/png' },
  { id: 'CERT-42', title: 'Java Intermediate', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-15', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-8VRSVYY8/image/png' },
  { id: 'CERT-43', title: 'C++ Intermediate', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-16', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-IGJZ5ICG/image/png' },
  { id: 'CERT-44', title: 'C Intermediate', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-16', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-NIHNI6RW/image/png' },
  { id: 'CERT-45', title: 'SQL Intermediate', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: '2026-08-16', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-PKZFLGAF/image/png' },
  { id: 'CERT-46', title: 'Sololearn Certificate #46', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-BXKK8SSV/image/png' },
  { id: 'CERT-47', title: 'Sololearn Certificate #47', issuer: 'Sololearn', holder: 'Khoem Soksivutha', issued: 'N/A', expires: 'N/A', category: 'Development', verified: true, url: 'https://api2.sololearn.com/v2/certificates/CC-L8HOE7QV/image/png' },
];

export const trafficData = [42, 58, 51, 67, 74, 62, 88, 95, 79, 84, 91, 73, 68, 82, 96, 88, 72, 65, 78, 90, 84, 76, 69, 58];
export const alertTrend = [3, 5, 2, 8, 4, 6, 3, 7, 5, 2, 4, 1, 3, 6, 2, 4, 5, 3, 2, 4, 7, 3, 2, 1];

export const capabilityRegistry = [
  { name: 'Lock/Unlock', devices: 2140, category: 'access' },
  { name: 'Temp Control', devices: 1820, category: 'climate' },
  { name: 'E-Stop', devices: 640, category: 'industrial' },
  { name: 'Geo-Fence', devices: 410, category: 'vehicle' },
  { name: 'Motion Detect', devices: 3220, category: 'sensor' },
  { name: 'OTA Update', devices: 11480, category: 'network' },
  { name: 'Badge Reader', devices: 980, category: 'access' },
  { name: 'Force Limit', devices: 520, category: 'industrial' },
];

/**
 * KSV Universal Domain Classification
 * Separates industry/domain classification from DeviceCategory.
 */
