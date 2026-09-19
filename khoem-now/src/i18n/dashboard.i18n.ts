// KSV Dashboard i18n PATCH — matches the real key namespace used in
// src/i18n/translations.ts (dashboard.stat.*, dashboard.traffic.*, ...).
// This is NOT a standalone dictionary to import — it is meant to be
// merged into the existing `en`, `km`, `zh` blocks inside translations.ts
// (see merge-dashboard-i18n.cjs).
//
// Device names, rule names, and city names are left out on purpose —
// those are data, not UI copy, and should not be translated.

export const DASHBOARD_PATCH = {
  en: {
    'dashboard.stat.connectedDevices': 'Connected Devices',
    'dashboard.stat.activeSafetyRules': 'Active Safety Rules',
    'dashboard.stat.edgeGateways': 'Edge Gateways',
    'dashboard.stat.online': 'online',
    'dashboard.stat.countriesDeployed': 'Countries Deployed',

    'dashboard.traffic.title': 'Platform Traffic',
    'dashboard.traffic.subtitle': 'Command messages per minute — last 24 hours',
    'dashboard.traffic.live': 'Live',
    'dashboard.traffic.peakThroughput': 'Peak throughput',
    'dashboard.traffic.cmdPerMin': '{count} cmd/min',
    'dashboard.traffic.avgLatency': 'Avg latency',
    'dashboard.traffic.ms': '{count} ms',
    'dashboard.traffic.uptime': 'Uptime',
    'dashboard.traffic.days': '{count} days',

    'dashboard.health.title': 'Device Health',
    'dashboard.health.subtitle': 'Global fleet status',
    'dashboard.health.online': 'Online',
    'dashboard.health.warning': 'Warning',
    'dashboard.health.offline': 'Offline',

    'dashboard.alerts.title': 'Alert Activity',
    'dashboard.alerts.subtitle': 'Safety + security triggers',
    'dashboard.alerts.openAlerts': 'Open alerts',
    'dashboard.alerts.critical': '{count} critical',

    'dashboard.sites.title': 'Site Load',
    'dashboard.sites.subtitle': 'Devices per site and gateway utilization',
    'dashboard.sites.viewAll': 'View all',
    'dashboard.sites.devicesAndLoad': '{count} devices · {load}%',

    'dashboard.recentDevices.title': 'Recent Devices',

    'dashboard.safetyRules.title': 'Safety Rules',
    'dashboard.safetyRules.triggered': '{scope} · triggered {count}×',

    'dashboard.protocols.title': 'Protocol Health',
    'dashboard.protocols.devicesAndLatency': '{count} devices · {latency}ms',

    'dashboard.gateway.title': 'Edge Gateway Fleet',
    'dashboard.gateway.subtitle': 'Local controllers with offline-mode capability',
    'dashboard.gateway.onlineBadge': '{online}/{total} online',
    'dashboard.gateway.cpu': 'CPU',
    'dashboard.gateway.mem': 'Mem',
    'dashboard.gateway.devices': 'Devices',
  },

  zh: {
    'dashboard.stat.connectedDevices': '已连接设备',
    'dashboard.stat.activeSafetyRules': '启用中的安全规则',
    'dashboard.stat.edgeGateways': '边缘网关',
    'dashboard.stat.online': '在线',
    'dashboard.stat.countriesDeployed': '已部署国家',

    'dashboard.traffic.title': '平台流量',
    'dashboard.traffic.subtitle': '每分钟命令消息数 — 最近24小时',
    'dashboard.traffic.live': '实时',
    'dashboard.traffic.peakThroughput': '峰值吞吐量',
    'dashboard.traffic.cmdPerMin': '{count} 条/分钟',
    'dashboard.traffic.avgLatency': '平均延迟',
    'dashboard.traffic.ms': '{count} 毫秒',
    'dashboard.traffic.uptime': '运行时间',
    'dashboard.traffic.days': '{count} 天',

    'dashboard.health.title': '设备健康状态',
    'dashboard.health.subtitle': '全球设备状态',
    'dashboard.health.online': '在线',
    'dashboard.health.warning': '警告',
    'dashboard.health.offline': '离线',

    'dashboard.alerts.title': '警报活动',
    'dashboard.alerts.subtitle': '安全与安防触发事件',
    'dashboard.alerts.openAlerts': '未处理警报',
    'dashboard.alerts.critical': '{count} 严重',

    'dashboard.sites.title': '站点负载',
    'dashboard.sites.subtitle': '各站点设备数量与网关使用率',
    'dashboard.sites.viewAll': '查看全部',
    'dashboard.sites.devicesAndLoad': '{count} 台设备 · {load}%',

    'dashboard.recentDevices.title': '最近设备',

    'dashboard.safetyRules.title': '安全规则',
    'dashboard.safetyRules.triggered': '{scope} · 已触发 {count} 次',

    'dashboard.protocols.title': '协议健康状态',
    'dashboard.protocols.devicesAndLatency': '{count} 台设备 · {latency}毫秒',

    'dashboard.gateway.title': '边缘网关集群',
    'dashboard.gateway.subtitle': '支持离线模式的本地控制器',
    'dashboard.gateway.onlineBadge': '{online}/{total} 在线',
    'dashboard.gateway.cpu': '处理器',
    'dashboard.gateway.mem': '内存',
    'dashboard.gateway.devices': '设备数',
  },

  km: {
    'dashboard.stat.connectedDevices': 'ឧបករណ៍ដែលបានភ្ជាប់',
    'dashboard.stat.activeSafetyRules': 'វិធានសុវត្ថិភាពកំពុងប្រើប្រាស់',
    'dashboard.stat.edgeGateways': 'Edge Gateway',
    'dashboard.stat.online': 'កំពុងដំណើរការ',
    'dashboard.stat.countriesDeployed': 'ប្រទេសដែលបានដាក់ឲ្យប្រើ',

    'dashboard.traffic.title': 'ចរាចរណ៍ប្រព័ន្ធ',
    'dashboard.traffic.subtitle': 'ចំនួនសារពាក្យបញ្ជាក្នុងមួយនាទី — ២៤ម៉ោងចុងក្រោយ',
    'dashboard.traffic.live': 'ផ្ទាល់',
    'dashboard.traffic.peakThroughput': 'ចរាចរណ៍កំពូល',
    'dashboard.traffic.cmdPerMin': '{count} ពាក្យបញ្ជា/នាទី',
    'dashboard.traffic.avgLatency': 'ពេលវេលាយឺតជាមធ្យម',
    'dashboard.traffic.ms': '{count} ms',
    'dashboard.traffic.uptime': 'រយៈពេលដំណើរការ',
    'dashboard.traffic.days': '{count} ថ្ងៃ',

    'dashboard.health.title': 'ស្ថានភាពសុខភាពឧបករណ៍',
    'dashboard.health.subtitle': 'ស្ថានភាពប្រព័ន្ធសរុប',
    'dashboard.health.online': 'កំពុងដំណើរការ',
    'dashboard.health.warning': 'ព្រមាន',
    'dashboard.health.offline': 'គ្មានការតភ្ជាប់',

    'dashboard.alerts.title': 'សកម្មភាពការជូនដំណឹង',
    'dashboard.alerts.subtitle': 'ការជូនដំណឹងសុវត្ថិភាព និងសន្តិសុខ',
    'dashboard.alerts.openAlerts': 'ការជូនដំណឹងមិនទាន់ដោះស្រាយ',
    'dashboard.alerts.critical': '{count} គ្រោះថ្នាក់ខ្លាំង',

    'dashboard.sites.title': 'ចំណុះទីតាំង',
    'dashboard.sites.subtitle': 'ចំនួនឧបករណ៍តាមទីតាំង និងការប្រើប្រាស់ gateway',
    'dashboard.sites.viewAll': 'មើលទាំងអស់',
    'dashboard.sites.devicesAndLoad': 'ឧបករណ៍ {count} · {load}%',

    'dashboard.recentDevices.title': 'ឧបករណ៍ថ្មីៗ',

    'dashboard.safetyRules.title': 'វិធានសុវត្ថិភាព',
    'dashboard.safetyRules.triggered': '{scope} · បានកេះ {count} ដង',

    'dashboard.protocols.title': 'ស្ថានភាព Protocol',
    'dashboard.protocols.devicesAndLatency': 'ឧបករណ៍ {count} · {latency}ms',

    'dashboard.gateway.title': 'ក្រុម Edge Gateway',
    'dashboard.gateway.subtitle': 'ឧបករណ៍ត្រួតពិនិត្យមូលដ្ឋានដែលអាចដំណើរការក្រៅបណ្តាញ',
    'dashboard.gateway.onlineBadge': '{online}/{total} កំពុងដំណើរការ',
    'dashboard.gateway.cpu': 'CPU',
    'dashboard.gateway.mem': 'សតិ',
    'dashboard.gateway.devices': 'ឧបករណ៍',
  },
} as const;
