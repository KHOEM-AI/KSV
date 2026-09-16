const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const marker = "const zh: Dict = {\n";
const count = content.split(marker).length - 1;
if (count !== 1) {
  console.error(`ABORT: marker found ${count} times (expected 1).`);
  process.exit(1);
}

const block =
  "  'aiChat.emptyState': '开始与 KHOEM-AI 对话',\n" +
  "  'aiChat.placeholder': '输入命令或问题…',\n" +
  "  'aiChat.subtitle': '您的助手',\n" +
  "  'intl.pin': '固定 {name}',\n" +
  "  'intl.unpin': '取消固定 {name}',\n" +
  "  'navgroup.overview': '概览',\n" +
  "  'navgroup.devicesControl': '设备与控制',\n" +
  "  'navgroup.securitySafety': '安全与保障',\n" +
  "  'navgroup.organization': '组织',\n" +
  "  'view.dashboard.subtitle': '您整个 KSV 车队的实时概览',\n" +
  "  'view.devices.subtitle': '管理所有已连接的设备',\n" +
  "  'view.controls.subtitle': '发送并查看设备命令',\n" +
  "  'view.protocols.subtitle': '连接状态与协议健康',\n" +
  "  'view.gateway.subtitle': '边缘网关与离线模式',\n" +
  "  'view.security.subtitle': '身份、会话与访问权限',\n" +
  "  'view.safety.subtitle': '安全规则与联锁',\n" +
  "  'view.organization.subtitle': '站点、团队与角色',\n" +
  "  'view.international.subtitle': '国家、语言与时区',\n" +
  "  'view.audit.subtitle': '完整的活动与安全日志',\n" +
  "  'view.certificates.subtitle': '培训与合规记录',\n" +
  "  'view.settings.subtitle': '账户与平台偏好设置',\n" +
  "  'dashboard.trend.devicesUp': '2.4%',\n" +
  "  'dashboard.trend.rulesNew': '新增 12 条',\n" +
  "  'dashboard.trend.gatewayOffline': '1 个离线',\n" +
  "  'dashboard.trend.countriesAdded': '新增 3 个',\n" +
  "  'dashboard.traffic.title': '平台流量',\n" +
  "  'dashboard.traffic.subtitle': '每分钟命令消息数 — 过去 24 小时',\n" +
  "  'dashboard.traffic.live': '实时',\n" +
  "  'dashboard.traffic.peakThroughput': '峰值吞吐量',\n" +
  "  'dashboard.traffic.cmdPerMin': '{count} 条/分钟',\n" +
  "  'dashboard.traffic.avgLatency': '平均延迟',\n" +
  "  'dashboard.traffic.ms': '{count} 毫秒',\n" +
  "  'dashboard.traffic.uptime': '正常运行时间',\n" +
  "  'dashboard.traffic.days': '{count} 天',\n" +
  "  'dashboard.health.title': '设备健康',\n" +
  "  'dashboard.health.subtitle': '全球车队状态',\n" +
  "  'dashboard.health.online': '在线',\n" +
  "  'dashboard.health.warning': '警告',\n" +
  "  'dashboard.health.offline': '离线',\n" +
  "  'dashboard.alerts.title': '告警活动',\n" +
  "  'dashboard.alerts.subtitle': '安全 + 保障触发',\n" +
  "  'dashboard.alerts.openAlerts': '未处理告警',\n" +
  "  'dashboard.alerts.critical': '{count} 个严重',\n" +
  "  'dashboard.sites.title': '站点负载',\n" +
  "  'dashboard.sites.subtitle': '各站点设备数与网关利用率',\n" +
  "  'dashboard.sites.viewAll': '查看全部',\n" +
  "  'dashboard.sites.devicesAndLoad': '{count} 台设备 · {load}%',\n" +
  "  'dashboard.recentDevices.title': '最近设备',\n" +
  "  'dashboard.safetyRules.title': '安全规则',\n" +
  "  'dashboard.safetyRules.triggered': '{scope} · 已触发 {count} 次',\n" +
  "  'dashboard.protocols.title': '协议健康',\n" +
  "  'dashboard.protocols.devicesAndLatency': '{count} 台设备 · {latency}毫秒',\n" +
  "  'dashboard.gateway.title': '边缘网关车队',\n" +
  "  'dashboard.gateway.subtitle': '具有离线模式能力的本地控制器',\n" +
  "  'dashboard.gateway.onlineBadge': '{online}/{total} 在线',\n" +
  "  'dashboard.gateway.cpu': 'CPU',\n" +
  "  'dashboard.gateway.mem': '内存',\n" +
  "  'dashboard.gateway.devices': '设备',\n" +
  "  'view.devices.registryTitle': '设备注册表',\n" +
  "  'view.devices.acrossAllSites': '跨所有站点的设备',\n" +
  "  'view.devices.export': '导出',\n" +
  "  'view.devices.searchPlaceholder': '按名称或设备 ID 搜索…',\n" +
  "  'view.devices.noMatch': '没有符合筛选条件的设备。',\n" +
  "  'view.devices.filter.all': '全部',\n" +
  "  'view.devices.filter.online': '在线',\n" +
  "  'view.devices.filter.warning': '警告',\n" +
  "  'view.devices.filter.maintenance': '维护中',\n" +
  "  'view.devices.filter.offline': '离线',\n" +
  "  'view.devices.status.online': '在线',\n" +
  "  'view.devices.status.warning': '警告',\n" +
  "  'view.devices.status.offline': '离线',\n" +
  "  'view.devices.status.maintenance': '维护中',\n" +
  "  'view.devices.category.access': '门禁',\n" +
  "  'view.devices.category.climate': '空调',\n" +
  "  'view.devices.category.industrial': '工业',\n" +
  "  'view.devices.category.vehicle': '车辆',\n" +
  "  'view.devices.category.sensor': '传感器',\n" +
  "  'view.devices.category.network': '网络',\n" +
  "  'view.devices.table.device': '设备',\n" +
  "  'view.devices.table.category': '类别',\n" +
  "  'view.devices.table.protocol': '协议',\n" +
  "  'view.devices.table.location': '位置',\n" +
  "  'view.devices.table.signal': '信号',\n" +
  "  'view.devices.table.firmware': '固件',\n" +
  "  'view.devices.table.status': '状态',\n" +
  "  'view.audit.title': '不可篡改审计追踪',\n" +
  "  'view.audit.subtitleText': '加密链式事件日志 — 所有平台活动',\n" +
  "  'view.audit.chainVerified': '链已验证',\n" +
  "  'view.audit.searchPlaceholder': '按操作者、操作或目标搜索…',\n" +
  "  'view.audit.noMatch': '没有符合筛选条件的事件。',\n" +
  "  'view.audit.loading': '正在加载审计追踪…',\n" +
  "  'view.audit.loadFailed': '无法加载审计追踪。',\n" +
  "  'view.audit.category.all': '全部',\n" +
  "  'view.audit.category.auth': '认证',\n" +
  "  'view.audit.category.device': '设备',\n" +
  "  'view.audit.category.safety': '安全',\n" +
  "  'view.audit.category.admin': '管理',\n" +
  "  'view.audit.category.network': '网络',\n" +
  "  'view.audit.result.success': '成功',\n" +
  "  'view.audit.result.denied': '已拒绝',\n" +
  "  'view.audit.result.error': '错误',\n" +
  "  'view.certificates.heading': 'Sololearn 证书',\n" +
  "  'view.certificates.description': 'KSV 团队成员持有的已验证专业认证',\n" +
  "  'view.certificates.certificatesLabel': '证书',\n" +
  "  'view.certificates.verifiedLabel': '已验证',\n" +
  "  'view.certificates.verified': '已验证',\n" +
  "  'view.certificates.issued': '颁发日期',\n" +
  "  'view.certificates.expires': '到期日期',\n" +
  "  'view.certificates.viewCertificate': '查看证书',\n" +
  "  'view.certificates.category.development': '开发',\n" +
  "  'view.certificates.category.security': '安全',\n" +
  "  'view.certificates.category.iot': '物联网',\n" +
  "  'view.certificates.category.database': '数据库',\n" +
  "  'view.certificates.category.cloud': '云计算',\n" +
  "  'view.controls.vaultDoor.name': '北金库门',\n" +
  "  'view.controls.vaultDoor.site': '法兰克福总部',\n" +
  "  'view.controls.hvac.name': '洁净室空调',\n" +
  "  'view.controls.hvac.site': '台北工厂',\n" +
  "  'view.controls.pressEstop.name': '7号生产线紧急停止',\n" +
  "  'view.controls.pressEstop.site': '斯图加特工厂',\n" +
  "  'view.controls.robotArm.name': '机械臂 RA-04',\n" +
  "  'view.controls.robotArm.site': '大阪工厂',\n" +
  "  'view.controls.eastGate.name': '东门护栏',\n" +
  "  'view.controls.eastGate.site': '迪拜物流中心',\n" +
  "  'view.controls.coldStorage.name': '冷藏监控',\n" +
  "  'view.controls.coldStorage.site': '鹿特丹港',\n" +
  "  'view.controls.secured': '已锁定',\n" +
  "  'view.controls.unlocked': '已解锁',\n" +
  "  'view.controls.unlock': '解锁',\n" +
  "  'view.controls.lock': '锁定',\n" +
  "  'view.controls.setpoint': '设定值',\n" +
  "  'view.controls.fan': '风扇',\n" +
  "  'view.controls.mode': '模式',\n" +
  "  'view.controls.cool': '制冷',\n" +
  "  'view.controls.filter': '过滤器',\n" +
  "  'view.controls.estop': '紧急停止',\n" +
  "  'view.controls.lineHalted': '生产线已停止',\n" +
  "  'view.controls.pressOperational': '压机运行正常',\n" +
  "  'view.controls.reset': '重置',\n" +
  "  'view.controls.speedLimit': '速度限制',\n" +
  "  'view.controls.humanZoneOverride': '人员区域覆盖',\n" +
  "  'view.controls.active': '已启用',\n" +
  "  'view.controls.collisionDetection': '碰撞检测',\n" +
  "  'view.controls.enabled': '已启用',\n" +
  "  'view.controls.maintenance': '维护中',\n" +
  "  'view.controls.barrierOpen': '护栏已打开',\n" +
  "  'view.controls.barrierClosed': '护栏已关闭',\n" +
  "  'view.controls.close': '关闭',\n" +
  "  'view.controls.open': '打开',\n" +
  "  'view.controls.targetTemp': '目标温度',\n" +
  "  'view.controls.current': '当前值',\n" +
  "  'view.controls.logTitle': '实时控制活动',\n" +
  "  'view.controls.logSubtitle': '过去一小时内发出的命令',\n" +
  "  'view.controls.logLoading': '正在加载最近活动…',\n" +
  "  'view.controls.logEmpty': '尚未发送任何命令。',\n" +
  "  'view.controls.logLoadFailed': '无法加载最近活动。',\n" +
  "  'view.controls.log.vaultDoor': '北金库门',\n" +
  "  'view.controls.log.robotArm': '机械臂 RA-04',\n" +
  "  'view.controls.log.hvac': '洁净室空调',\n" +
  "  'view.controls.log.pressLine': '7号生产线',\n" +
  "  'view.controls.log.eastGate': '东门护栏',\n" +
  "  'view.gateway.online': '在线',\n" +
  "  'view.gateway.degraded': '性能下降',\n" +
  "  'view.gateway.offline': '离线',\n" +
  "  'view.gateway.memory': '内存',\n" +
  "  'view.gateway.firmware': '固件',\n" +
  "  'view.gateway.lastSync': '最后同步',\n" +
  "  'view.gateway.offlineMode': '离线模式',\n" +
  "  'view.gateway.connected': '已连接',\n" +
  "  'view.gateway.reconnecting': '正在重新连接',\n" +
  "  'view.gateway.discoveryTitle': '本地网络发现',\n" +
  "  'view.gateway.discoverySubtitle': '针对边缘设备的 mDNS / UDP 广播扫描',\n" +
  "  'view.gateway.discovery.frankfurt': '法兰克福边缘控制器',\n" +
  "  'view.gateway.discovery.badgeReader': '门禁读卡器 B2-A',\n" +
  "  'view.gateway.discovery.singapore': '新加坡边缘控制器',\n" +
  "  'view.gateway.discovery.airSensor': '屋顶空气传感器',\n" +
  "  'view.organization.hierarchyTitle': '组织架构',\n" +
  "  'view.organization.hierarchySubtitle': '公司 → 站点 → 建筑 → 设备策略继承',\n" +
  "  'view.organization.nodes': '节点',\n" +
  "  'view.organization.users': '用户',\n" +
  "  'view.organization.rules': '规则',\n" +
  "  'view.organization.accessPoliciesTitle': '访问策略',\n" +
  "  'view.organization.accessPoliciesSubtitle': '基于策略的访问控制 (PBAC) 规则',\n" +
  "  'view.organization.roleDefinitionsTitle': '角色定义',\n" +
  "  'view.organization.roleDefinitionsSubtitle': '平台范围的角色目录',\n" +
  "  'view.organization.type.company': '控股公司',\n" +
  "  'view.organization.type.site': '区域/站点',\n" +
  "  'view.organization.type.building': '建筑',\n" +
  "  'view.organization.type.floor': '楼层',\n" +
  "  'view.organization.site.frankfurt': '法兰克福总部',\n" +
  "  'view.organization.site.singapore': '新加坡数据中心',\n" +
  "  'view.organization.site.taipei': '台北工厂',\n" +
  "  'view.organization.site.emea': '欧洲、中东和非洲地区',\n" +
  "  'view.organization.site.apac': '亚太地区',\n" +
  "  'view.organization.policy.hqStrict': '总部严格策略',\n" +
  "  'view.organization.policy.dcCritical': '数据中心关键策略',\n" +
  "  'view.organization.policy.fabCleanroom': '工厂洁净室策略',\n" +
  "  'view.organization.policy.emeaBaseline': '欧洲中东非洲基准策略',\n" +
  "  'view.organization.policy.apacBaseline': '亚太基准策略',\n" +
  "  'view.organization.role.orgOwner': '组织所有者',\n" +
  "  'view.organization.role.siteAdmin': '站点管理员',\n" +
  "  'view.organization.role.safetyEngineer': '安全工程师',\n" +
  "  'view.organization.role.networkAdmin': '网络管理员',\n" +
  "  'view.organization.role.operator': '操作员',\n" +
  "  'view.organization.role.viewer': '查看者',\n" +
  "  'view.organization.perms.orgOwner': '完整平台控制权',\n" +
  "  'view.organization.perms.siteAdmin': '站点级管理',\n" +
  "  'view.organization.perms.safetyEngineer': '安全规则 + 设备控制',\n" +
  "  'view.organization.perms.networkAdmin': '网关 + 协议配置',\n" +
  "  'view.organization.perms.operator': '设备控制 + 查看审计',\n" +
  "  'view.organization.perms.viewer': '只读仪表盘访问',\n" +
  "  'view.protocols.abstractionTitle': '协议抽象层',\n" +
  "  'view.protocols.abstractionSubtitle': '跨所有传输协议的统一适配器接口',\n" +
  "  'view.protocols.latency': '延迟',\n" +
  "  'view.protocols.encryptionTitle': '加密标准',\n" +
  "  'view.protocols.capabilityRegistryTitle': '能力注册表',\n" +
  "  'view.protocols.dev': '开发',\n" +
  "  'view.protocols.status.active': '活跃',\n" +
  "  'view.protocols.status.degraded': '性能下降',\n" +
  "  'view.protocols.status.offline': '离线',\n" +
  "  'view.protocols.enc.tls': 'TLS 1.3',\n" +
  "  'view.protocols.enc.wpa3': 'WPA3 企业版',\n" +
  "  'view.protocols.enc.aesBle': 'AES-CCM（蓝牙）',\n" +
  "  'view.protocols.enc.aesZigbee': 'AES-128（Zigbee）',\n" +
  "  'view.safety.stat.rulesActive': '生效规则',\n" +
  "  'view.safety.stat.totalTriggers': '总触发次数（30天）',\n" +
  "  'view.safety.stat.criticalRules': '关键规则',\n" +
  "  'view.safety.scope.all': '所有范围',\n" +
  "  'view.safety.scope.door': '门',\n" +
  "  'view.safety.scope.vehicle': '车辆',\n" +
  "  'view.safety.scope.industrial': '工业',\n" +
  "  'view.safety.condition': '条件',\n" +
  "  'view.safety.action': '操作',\n" +
  "  'view.safety.triggered': '已触发 {count} 次',\n" +
  "  'view.safety.active': '已启用',\n" +
  "  'view.safety.disabled': '已禁用',\n" +
  "  'view.safety.severity.critical': '严重',\n" +
  "  'view.safety.severity.high': '高',\n" +
  "  'view.safety.severity.medium': '中',\n" +
  "  'view.safety.severity.low': '低',\n" +
  "  'view.security.stat.grade': '安全等级',\n" +
  "  'view.security.stat.activeSessions': '活跃会话',\n" +
  "  'view.security.stat.mfaCoverage': '多因素认证覆盖率',\n" +
  "  'view.security.stat.deniedAttempts': '被拒尝试次数（24小时）',\n" +
  "  'view.security.sessions.title': '活跃会话',\n" +
  "  'view.security.sessions.subtitle': '平台上已认证的用户会话',\n" +
  "  'view.security.table.user': '用户',\n" +
  "  'view.security.table.method': '方式',\n" +
  "  'view.security.table.location': '位置',\n" +
  "  'view.security.table.mfa': '多因素认证',\n" +
  "  'view.security.table.lastActive': '最后活跃',\n" +
  "  'view.security.table.status': '状态',\n" +
  "  'view.security.mfa.on': '已开启',\n" +
  "  'view.security.mfa.off': '已关闭',\n" +
  "  'view.security.authMethods.title': '认证方式',\n" +
  "  'view.security.authMethods.sessions': '会话',\n" +
  "  'view.security.policies.title': '安全策略',\n" +
  "  'view.security.policy.zeroPlaintext': '零明文密码策略',\n" +
  "  'view.security.policy.oauthOidc': 'OAuth 2.0 / OIDC 流程',\n" +
  "  'view.security.policy.otpRecovery': 'OTP 恢复备份',\n" +
  "  'view.security.policy.sessionAudit': '会话审计日志',\n" +
  "  'view.security.policy.forceMfaAdmins': '强制管理员使用多因素认证',\n" +
  "  'view.security.policy.ipAllowlist': 'IP 白名单（生产环境）',\n" +
  "  'view.security.status.enforced': '已强制执行',\n" +
  "  'view.security.status.partial': '部分执行',\n" +
  "  'view.settings.platform.title': '平台',\n" +
  "  'view.settings.platform.subtitle': '核心平台行为',\n" +
  "  'view.settings.autoUpdate.label': '自动固件更新',\n" +
  "  'view.settings.autoUpdate.desc': '向符合条件的设备推送 OTA 更新',\n" +
  "  'view.settings.offlineMode.label': '边缘离线模式',\n" +
  "  'view.settings.offlineMode.desc': '允许网关在无云端连接时运行',\n" +
  "  'view.settings.auditLog.label': '不可篡改审计日志',\n" +
  "  'view.settings.auditLog.desc': '对所有事件进行加密链式记录',\n" +
  "  'view.settings.security.title': '安全',\n" +
  "  'view.settings.security.subtitle': '身份认证与访问策略',\n" +
  "  'view.settings.twoFactor.label': '要求所有管理员使用双重认证',\n" +
  "  'view.settings.twoFactor.desc': '在管理员和操作员角色上强制执行多因素认证',\n" +
  "  'view.settings.zeroPlaintext.label': '零明文密码策略',\n" +
  "  'view.settings.zeroPlaintext.desc': 'Argon2id 哈希加密，不存储明文',\n" +
  "  'view.settings.safetyOverride.label': '允许覆盖安全规则',\n" +
  "  'view.settings.safetyOverride.desc': '允许工程师临时禁用规则',\n" +
  "  'view.settings.notifications.title': '通知',\n" +
  "  'view.settings.notifications.subtitle': '告警发送渠道',\n" +
  "  'view.settings.emailAlerts.label': '邮件告警',\n" +
  "  'view.settings.emailAlerts.desc': '向管理员邮箱发送严重告警',\n" +
  "  'view.settings.smsAlerts.label': '短信告警',\n" +
  "  'view.settings.smsAlerts.desc': '通过短信网关发送严重告警',\n" +
  "  'view.settings.localization.title': '本地化与数据',\n" +
  "  'view.settings.localization.subtitle': '语言与存储偏好设置',\n" +
  "  'view.settings.defaultLanguage': '默认语言',\n" +
  "  'view.settings.defaultTimezone': '默认时区',\n" +
  "  'view.settings.timezoneAuto': '自动（从浏览器检测）',\n" +
  "  'view.settings.databaseBackup': '数据库备份',\n" +
  "  'view.settings.backupInterval': '自动 · 每 {hours} 小时一次',\n" +
  "  'view.settings.saveBar.note': '更改将应用于所有站点和网关。',\n" +
  "  'view.settings.saveBar.save': '保存更改',\n";

content = content.replace(marker, marker + block);
fs.writeFileSync(path, content, 'utf8');
console.log('Done. Chinese (zh) translations added.');
