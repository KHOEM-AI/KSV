// KSV Dashboard — UI text dictionary (English / 中文 / ខ្មែរ)
// Covers: top stat cards, Platform Traffic, Device Health, Alert Activity,
// Site Load, Recent Devices, Safety Rules, Protocol Health, Edge Gateway Fleet.
// Device names, rule names, and city names are left untranslated (proper nouns).

export type SupportedLanguage = "en" | "zh" | "km";

export const DASHBOARD_COPY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Header
    liveOverview: "Live overview of your entire KSV fleet",
    search: "Search...",

    // Stat cards
    connectedDevices: "Connected Devices",
    activeSafetyRules: "Active Safety Rules",
    edgeGateways: "Edge Gateways",
    online: "online",
    countriesDeployed: "Countries Deployed",

    // Platform Traffic
    platformTraffic: "Platform Traffic",
    platformTrafficSub: "Command messages per minute — last 24 hours",
    live: "Live",
    peakThroughput: "Peak throughput",
    avgLatency: "Avg latency",
    uptime: "Uptime",
    cmdPerMin: "cmd/min",

    // Device Health
    deviceHealth: "Device Health",
    globalFleetStatus: "Global fleet status",
    warning: "Warning",
    offline: "Offline",

    // Alert Activity
    alertActivity: "Alert Activity",
    alertActivitySub: "Safety + security triggers",
    openAlerts: "Open alerts",
    critical: "critical",

    // Site Load
    siteLoad: "Site Load",
    siteLoadSub: "Devices per site and gateway utilization",
    viewAll: "View all",
    noSitesYet: "No sites yet.",

    // Recent Devices
    recentDevices: "Recent Devices",

    // Safety Rules
    safetyRules: "Safety Rules",
    severityCritical: "critical",
    severityHigh: "high",
    severityMedium: "medium",

    // Protocol Health
    protocolHealth: "Protocol Health",
    noProtocolsYet: "No protocols yet.",

    // Edge Gateway Fleet
    edgeGatewayFleet: "Edge Gateway Fleet",
    edgeGatewayFleetSub: "Local controllers with offline-mode capability",
    cpu: "CPU",
    mem: "Mem",
    devices: "Devices",
  },

  zh: {
    liveOverview: "实时查看您整个 KSV 设备网络",
    search: "搜索...",

    connectedDevices: "已连接设备",
    activeSafetyRules: "启用中的安全规则",
    edgeGateways: "边缘网关",
    online: "在线",
    countriesDeployed: "已部署国家",

    platformTraffic: "平台流量",
    platformTrafficSub: "每分钟命令消息数 — 最近24小时",
    live: "实时",
    peakThroughput: "峰值吞吐量",
    avgLatency: "平均延迟",
    uptime: "运行时间",
    cmdPerMin: "条/分钟",

    deviceHealth: "设备健康状态",
    globalFleetStatus: "全球设备状态",
    warning: "警告",
    offline: "离线",

    alertActivity: "警报活动",
    alertActivitySub: "安全与安防触发事件",
    openAlerts: "未处理警报",
    critical: "严重",

    siteLoad: "站点负载",
    siteLoadSub: "各站点设备数量与网关使用率",
    viewAll: "查看全部",
    noSitesYet: "暂无站点。",

    recentDevices: "最近设备",

    safetyRules: "安全规则",
    severityCritical: "严重",
    severityHigh: "高",
    severityMedium: "中",

    protocolHealth: "协议健康状态",
    noProtocolsYet: "暂无协议。",

    edgeGatewayFleet: "边缘网关集群",
    edgeGatewayFleetSub: "支持离线模式的本地控制器",
    cpu: "处理器",
    mem: "内存",
    devices: "设备数",
  },

  km: {
    liveOverview: "ទិដ្ឋភាពផ្ទាល់នៃប្រព័ន្ធ KSV ទាំងមូលរបស់អ្នក",
    search: "ស្វែងរក...",

    connectedDevices: "ឧបករណ៍ដែលបានភ្ជាប់",
    activeSafetyRules: "វិធានសុវត្ថិភាពកំពុងប្រើប្រាស់",
    edgeGateways: "Edge Gateway",
    online: "កំពុងដំណើរការ",
    countriesDeployed: "ប្រទេសដែលបានដាក់ឲ្យប្រើ",

    platformTraffic: "ចរាចរណ៍ប្រព័ន្ធ",
    platformTrafficSub: "ចំនួនសារពាក្យបញ្ជាក្នុងមួយនាទី — ២៤ម៉ោងចុងក្រោយ",
    live: "ផ្ទាល់",
    peakThroughput: "ចរាចរណ៍កំពូល",
    avgLatency: "ពេលវេលាយឺតជាមធ្យម",
    uptime: "រយៈពេលដំណើរការ",
    cmdPerMin: "ពាក្យបញ្ជា/នាទី",

    deviceHealth: "ស្ថានភាពសុខភាពឧបករណ៍",
    globalFleetStatus: "ស្ថានភាពប្រព័ន្ធសរុប",
    warning: "ព្រមាន",
    offline: "គ្មានការតភ្ជាប់",

    alertActivity: "សកម្មភាពការជូនដំណឹង",
    alertActivitySub: "ការជូនដំណឹងសុវត្ថិភាព និងសន្តិសុខ",
    openAlerts: "ការជូនដំណឹងមិនទាន់ដោះស្រាយ",
    critical: "គ្រោះថ្នាក់ខ្លាំង",

    siteLoad: "ចំណុះទីតាំង",
    siteLoadSub: "ចំនួនឧបករណ៍តាមទីតាំង និងការប្រើប្រាស់ gateway",
    viewAll: "មើលទាំងអស់",
    noSitesYet: "មិនទាន់មានទីតាំងនៅឡើយទេ។",

    recentDevices: "ឧបករណ៍ថ្មីៗ",

    safetyRules: "វិធានសុវត្ថិភាព",
    severityCritical: "គ្រោះថ្នាក់ខ្លាំង",
    severityHigh: "ខ្ពស់",
    severityMedium: "មធ្យម",

    protocolHealth: "ស្ថានភាព Protocol",
    noProtocolsYet: "មិនទាន់មាន protocol នៅឡើយទេ។",

    edgeGatewayFleet: "ក្រុម Edge Gateway",
    edgeGatewayFleetSub: "ឧបករណ៍ត្រួតពិនិត្យមូលដ្ឋានដែលអាចដំណើរការក្រៅបណ្តាញ",
    cpu: "CPU",
    mem: "សតិ",
    devices: "ឧបករណ៍",
  },
};
