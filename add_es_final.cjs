const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const marker = "const es: Dict = {\n";
const count = content.split(marker).length - 1;
if (count !== 1) {
  console.error(`ABORT: marker found ${count} times (expected 1).`);
  process.exit(1);
}

const block =
  "  'aiChat.emptyState': 'Inicia una conversación con KHOEM-AI',\n" +
  "  'aiChat.placeholder': 'Escribe un comando o pregunta…',\n" +
  "  'aiChat.subtitle': 'Tu asistente',\n" +
  "  'intl.pin': 'Fijar {name}',\n" +
  "  'intl.unpin': 'Desfijar {name}',\n" +
  "  'navgroup.overview': 'Resumen',\n" +
  "  'navgroup.devicesControl': 'Dispositivos y control',\n" +
  "  'navgroup.securitySafety': 'Seguridad y protección',\n" +
  "  'navgroup.organization': 'Organización',\n" +
  "  'view.dashboard.subtitle': 'Resumen en vivo de toda su flota KSV',\n" +
  "  'view.devices.subtitle': 'Administre todos los dispositivos conectados',\n" +
  "  'view.controls.subtitle': 'Envíe y revise comandos de dispositivos',\n" +
  "  'view.protocols.subtitle': 'Conectividad y estado de protocolos',\n" +
  "  'view.gateway.subtitle': 'Gateways perimetrales y modo sin conexión',\n" +
  "  'view.security.subtitle': 'Identidad, sesiones y acceso',\n" +
  "  'view.safety.subtitle': 'Reglas de seguridad y bloqueos',\n" +
  "  'view.organization.subtitle': 'Sitios, equipos y roles',\n" +
  "  'view.international.subtitle': 'País, idioma y zona horaria',\n" +
  "  'view.audit.subtitle': 'Registro completo de actividad y seguridad',\n" +
  "  'view.certificates.subtitle': 'Registros de capacitación y cumplimiento',\n" +
  "  'view.settings.subtitle': 'Preferencias de cuenta y plataforma',\n" +
  "  'dashboard.trend.devicesUp': '2.4%',\n" +
  "  'dashboard.trend.rulesNew': '12 nuevas',\n" +
  "  'dashboard.trend.gatewayOffline': '1 sin conexión',\n" +
  "  'dashboard.trend.countriesAdded': '3 añadidos',\n" +
  "  'dashboard.traffic.title': 'Tráfico de la plataforma',\n" +
  "  'dashboard.traffic.subtitle': 'Mensajes de comando por minuto — últimas 24 horas',\n" +
  "  'dashboard.traffic.live': 'En vivo',\n" +
  "  'dashboard.traffic.peakThroughput': 'Rendimiento máximo',\n" +
  "  'dashboard.traffic.cmdPerMin': '{count} cmd/min',\n" +
  "  'dashboard.traffic.avgLatency': 'Latencia promedio',\n" +
  "  'dashboard.traffic.ms': '{count} ms',\n" +
  "  'dashboard.traffic.uptime': 'Tiempo de actividad',\n" +
  "  'dashboard.traffic.days': '{count} días',\n" +
  "  'dashboard.health.title': 'Estado de los dispositivos',\n" +
  "  'dashboard.health.subtitle': 'Estado global de la flota',\n" +
  "  'dashboard.health.online': 'En línea',\n" +
  "  'dashboard.health.warning': 'Advertencia',\n" +
  "  'dashboard.health.offline': 'Sin conexión',\n" +
  "  'dashboard.alerts.title': 'Actividad de alertas',\n" +
  "  'dashboard.alerts.subtitle': 'Disparadores de seguridad y protección',\n" +
  "  'dashboard.alerts.openAlerts': 'Alertas abiertas',\n" +
  "  'dashboard.alerts.critical': '{count} críticas',\n" +
  "  'dashboard.sites.title': 'Carga por sitio',\n" +
  "  'dashboard.sites.subtitle': 'Dispositivos por sitio y utilización de gateways',\n" +
  "  'dashboard.sites.viewAll': 'Ver todo',\n" +
  "  'dashboard.sites.devicesAndLoad': '{count} dispositivos · {load}%',\n" +
  "  'dashboard.recentDevices.title': 'Dispositivos recientes',\n" +
  "  'dashboard.safetyRules.title': 'Reglas de seguridad',\n" +
  "  'dashboard.safetyRules.triggered': '{scope} · activada {count} veces',\n" +
  "  'dashboard.protocols.title': 'Estado de protocolos',\n" +
  "  'dashboard.protocols.devicesAndLatency': '{count} dispositivos · {latency}ms',\n" +
  "  'dashboard.gateway.title': 'Flota de gateways perimetrales',\n" +
  "  'dashboard.gateway.subtitle': 'Controladores locales con capacidad de modo sin conexión',\n" +
  "  'dashboard.gateway.onlineBadge': '{online}/{total} en línea',\n" +
  "  'dashboard.gateway.cpu': 'CPU',\n" +
  "  'dashboard.gateway.mem': 'Memoria',\n" +
  "  'dashboard.gateway.devices': 'Dispositivos',\n" +
  "  'view.devices.registryTitle': 'Registro de dispositivos',\n" +
  "  'view.devices.acrossAllSites': 'dispositivos en todos los sitios',\n" +
  "  'view.devices.export': 'Exportar',\n" +
  "  'view.devices.searchPlaceholder': 'Buscar por nombre o ID de dispositivo…',\n" +
  "  'view.devices.noMatch': 'Ningún dispositivo coincide con sus filtros.',\n" +
  "  'view.devices.filter.all': 'todos',\n" +
  "  'view.devices.filter.online': 'en línea',\n" +
  "  'view.devices.filter.warning': 'advertencia',\n" +
  "  'view.devices.filter.maintenance': 'mantenimiento',\n" +
  "  'view.devices.filter.offline': 'sin conexión',\n" +
  "  'view.devices.status.online': 'en línea',\n" +
  "  'view.devices.status.warning': 'advertencia',\n" +
  "  'view.devices.status.offline': 'sin conexión',\n" +
  "  'view.devices.status.maintenance': 'mantenimiento',\n" +
  "  'view.devices.category.access': 'Acceso',\n" +
  "  'view.devices.category.climate': 'Climatización',\n" +
  "  'view.devices.category.industrial': 'Industrial',\n" +
  "  'view.devices.category.vehicle': 'Vehículo',\n" +
  "  'view.devices.category.sensor': 'Sensor',\n" +
  "  'view.devices.category.network': 'Red',\n" +
  "  'view.devices.table.device': 'Dispositivo',\n" +
  "  'view.devices.table.category': 'Categoría',\n" +
  "  'view.devices.table.protocol': 'Protocolo',\n" +
  "  'view.devices.table.location': 'Ubicación',\n" +
  "  'view.devices.table.signal': 'Señal',\n" +
  "  'view.devices.table.firmware': 'Firmware',\n" +
  "  'view.devices.table.status': 'Estado',\n" +
  "  'view.audit.title': 'Registro de auditoría inmutable',\n" +
  "  'view.audit.subtitleText': 'Registro de eventos encadenado criptográficamente — toda la actividad de la plataforma',\n" +
  "  'view.audit.chainVerified': 'Cadena verificada',\n" +
  "  'view.audit.searchPlaceholder': 'Buscar por actor, acción u objetivo…',\n" +
  "  'view.audit.noMatch': 'Ningún evento coincide con sus filtros.',\n" +
  "  'view.audit.loading': 'Cargando registro de auditoría…',\n" +
  "  'view.audit.loadFailed': 'No se pudo cargar el registro de auditoría.',\n" +
  "  'view.audit.category.all': 'todos',\n" +
  "  'view.audit.category.auth': 'autenticación',\n" +
  "  'view.audit.category.device': 'dispositivo',\n" +
  "  'view.audit.category.safety': 'seguridad',\n" +
  "  'view.audit.category.admin': 'administración',\n" +
  "  'view.audit.category.network': 'red',\n" +
  "  'view.audit.result.success': 'éxito',\n" +
  "  'view.audit.result.denied': 'denegado',\n" +
  "  'view.audit.result.error': 'error',\n" +
  "  'view.certificates.heading': 'Certificados de Sololearn',\n" +
  "  'view.certificates.description': 'Certificaciones profesionales verificadas de los miembros del equipo KSV',\n" +
  "  'view.certificates.certificatesLabel': 'Certificados',\n" +
  "  'view.certificates.verifiedLabel': 'Verificado',\n" +
  "  'view.certificates.verified': 'Verificado',\n" +
  "  'view.certificates.issued': 'Emitido',\n" +
  "  'view.certificates.expires': 'Vence',\n" +
  "  'view.certificates.viewCertificate': 'Ver certificado',\n" +
  "  'view.certificates.category.development': 'Desarrollo',\n" +
  "  'view.certificates.category.security': 'Seguridad',\n" +
  "  'view.certificates.category.iot': 'IoT',\n" +
  "  'view.certificates.category.database': 'Base de datos',\n" +
  "  'view.certificates.category.cloud': 'Nube',\n" +
  "  'view.controls.vaultDoor.name': 'Puerta norte de la bóveda',\n" +
  "  'view.controls.vaultDoor.site': 'Sede de Fráncfort',\n" +
  "  'view.controls.hvac.name': 'HVAC de sala limpia',\n" +
  "  'view.controls.hvac.site': 'Fábrica de Taipéi',\n" +
  "  'view.controls.pressEstop.name': 'Parada de emergencia línea de prensa 7',\n" +
  "  'view.controls.pressEstop.site': 'Planta de Stuttgart',\n" +
  "  'view.controls.robotArm.name': 'Brazo robótico RA-04',\n" +
  "  'view.controls.robotArm.site': 'Fábrica de Osaka',\n" +
  "  'view.controls.eastGate.name': 'Barrera de la puerta este',\n" +
  "  'view.controls.eastGate.site': 'Logística de Dubái',\n" +
  "  'view.controls.coldStorage.name': 'Monitor de almacenamiento en frío',\n" +
  "  'view.controls.coldStorage.site': 'Puerto de Róterdam',\n" +
  "  'view.controls.secured': 'ASEGURADO',\n" +
  "  'view.controls.unlocked': 'DESBLOQUEADO',\n" +
  "  'view.controls.unlock': 'Desbloquear',\n" +
  "  'view.controls.lock': 'Bloquear',\n" +
  "  'view.controls.setpoint': 'Punto de referencia',\n" +
  "  'view.controls.fan': 'Ventilador',\n" +
  "  'view.controls.mode': 'Modo',\n" +
  "  'view.controls.cool': 'Enfriar',\n" +
  "  'view.controls.filter': 'Filtro',\n" +
  "  'view.controls.estop': 'PARADA DE EMERGENCIA',\n" +
  "  'view.controls.lineHalted': 'LÍNEA DETENIDA',\n" +
  "  'view.controls.pressOperational': 'Prensa operativa',\n" +
  "  'view.controls.reset': 'Restablecer',\n" +
  "  'view.controls.speedLimit': 'Límite de velocidad',\n" +
  "  'view.controls.humanZoneOverride': 'Anulación de zona humana',\n" +
  "  'view.controls.active': 'Activo',\n" +
  "  'view.controls.collisionDetection': 'Detección de colisiones',\n" +
  "  'view.controls.enabled': 'Habilitado',\n" +
  "  'view.controls.maintenance': 'Mantenimiento',\n" +
  "  'view.controls.barrierOpen': 'BARRERA ABIERTA',\n" +
  "  'view.controls.barrierClosed': 'BARRERA CERRADA',\n" +
  "  'view.controls.close': 'Cerrar',\n" +
  "  'view.controls.open': 'Abrir',\n" +
  "  'view.controls.targetTemp': 'Temperatura objetivo',\n" +
  "  'view.controls.current': 'Actual',\n" +
  "  'view.controls.logTitle': 'Actividad de control en vivo',\n" +
  "  'view.controls.logSubtitle': 'Comandos enviados en la última hora',\n" +
  "  'view.controls.logLoading': 'Cargando actividad reciente…',\n" +
  "  'view.controls.logEmpty': 'Aún no se han enviado comandos.',\n" +
  "  'view.controls.logLoadFailed': 'No se pudo cargar la actividad reciente.',\n" +
  "  'view.controls.log.vaultDoor': 'Puerta norte de la bóveda',\n" +
  "  'view.controls.log.robotArm': 'Brazo robótico RA-04',\n" +
  "  'view.controls.log.hvac': 'HVAC de sala limpia',\n" +
  "  'view.controls.log.pressLine': 'Línea de prensa 7',\n" +
  "  'view.controls.log.eastGate': 'Barrera de la puerta este',\n" +
  "  'view.gateway.online': 'En línea',\n" +
  "  'view.gateway.degraded': 'Degradado',\n" +
  "  'view.gateway.offline': 'Sin conexión',\n" +
  "  'view.gateway.memory': 'Memoria',\n" +
  "  'view.gateway.firmware': 'Firmware',\n" +
  "  'view.gateway.lastSync': 'Última sincronización',\n" +
  "  'view.gateway.offlineMode': 'Modo sin conexión',\n" +
  "  'view.gateway.connected': 'Conectado',\n" +
  "  'view.gateway.reconnecting': 'Reconectando',\n" +
  "  'view.gateway.discoveryTitle': 'Descubrimiento de red local',\n" +
  "  'view.gateway.discoverySubtitle': 'Escaneo por difusión mDNS / UDP para dispositivos periféricos',\n" +
  "  'view.gateway.discovery.frankfurt': 'Controlador perimetral de Fráncfort',\n" +
  "  'view.gateway.discovery.badgeReader': 'Lector de credenciales B2-A',\n" +
  "  'view.gateway.discovery.singapore': 'Controlador perimetral de Singapur',\n" +
  "  'view.gateway.discovery.airSensor': 'Sensor de aire en el techo',\n" +
  "  'view.organization.hierarchyTitle': 'Jerarquía organizativa',\n" +
  "  'view.organization.hierarchySubtitle': 'Empresa → Sitio → Edificio → Herencia de política de dispositivos',\n" +
  "  'view.organization.nodes': 'nodos',\n" +
  "  'view.organization.users': 'Usuarios',\n" +
  "  'view.organization.rules': 'reglas',\n" +
  "  'view.organization.accessPoliciesTitle': 'Políticas de acceso',\n" +
  "  'view.organization.accessPoliciesSubtitle': 'Reglas de control de acceso basado en políticas (PBAC)',\n" +
  "  'view.organization.roleDefinitionsTitle': 'Definiciones de roles',\n" +
  "  'view.organization.roleDefinitionsSubtitle': 'Catálogo de roles de toda la plataforma',\n" +
  "  'view.organization.type.company': 'Holding',\n" +
  "  'view.organization.type.site': 'Región/Sitio',\n" +
  "  'view.organization.type.building': 'Edificio',\n" +
  "  'view.organization.type.floor': 'Piso',\n" +
  "  'view.organization.site.frankfurt': 'Sede de Fráncfort',\n" +
  "  'view.organization.site.singapore': 'Centro de datos de Singapur',\n" +
  "  'view.organization.site.taipei': 'Fábrica de Taipéi',\n" +
  "  'view.organization.site.emea': 'Región EMEA',\n" +
  "  'view.organization.site.apac': 'Región APAC',\n" +
  "  'view.organization.policy.hqStrict': 'Sede estricta',\n" +
  "  'view.organization.policy.dcCritical': 'Centro de datos crítico',\n" +
  "  'view.organization.policy.fabCleanroom': 'Sala limpia de fábrica',\n" +
  "  'view.organization.policy.emeaBaseline': 'Línea base EMEA',\n" +
  "  'view.organization.policy.apacBaseline': 'Línea base APAC',\n" +
  "  'view.organization.role.orgOwner': 'Propietario de la organización',\n" +
  "  'view.organization.role.siteAdmin': 'Administrador de sitio',\n" +
  "  'view.organization.role.safetyEngineer': 'Ingeniero de seguridad',\n" +
  "  'view.organization.role.networkAdmin': 'Administrador de red',\n" +
  "  'view.organization.role.operator': 'Operador',\n" +
  "  'view.organization.role.viewer': 'Observador',\n" +
  "  'view.organization.perms.orgOwner': 'Control total de la plataforma',\n" +
  "  'view.organization.perms.siteAdmin': 'Gestión a nivel de sitio',\n" +
  "  'view.organization.perms.safetyEngineer': 'Reglas de seguridad + controles de dispositivos',\n" +
  "  'view.organization.perms.networkAdmin': 'Configuración de gateway + protocolo',\n" +
  "  'view.organization.perms.operator': 'Control de dispositivos + ver auditoría',\n" +
  "  'view.organization.perms.viewer': 'Acceso de solo lectura al panel',\n" +
  "  'view.protocols.abstractionTitle': 'Capa de abstracción de protocolos',\n" +
  "  'view.protocols.abstractionSubtitle': 'Interfaz de adaptador unificada para todos los protocolos de transporte',\n" +
  "  'view.protocols.latency': 'Latencia',\n" +
  "  'view.protocols.encryptionTitle': 'Estándares de cifrado',\n" +
  "  'view.protocols.capabilityRegistryTitle': 'Registro de capacidades',\n" +
  "  'view.protocols.dev': 'desarrollo',\n" +
  "  'view.protocols.status.active': 'activo',\n" +
  "  'view.protocols.status.degraded': 'degradado',\n" +
  "  'view.protocols.status.offline': 'sin conexión',\n" +
  "  'view.protocols.enc.tls': 'TLS 1.3',\n" +
  "  'view.protocols.enc.wpa3': 'WPA3-Enterprise',\n" +
  "  'view.protocols.enc.aesBle': 'AES-CCM (BLE)',\n" +
  "  'view.protocols.enc.aesZigbee': 'AES-128 (Zigbee)',\n" +
  "  'view.safety.stat.rulesActive': 'Reglas activas',\n" +
  "  'view.safety.stat.totalTriggers': 'Total de activaciones (30d)',\n" +
  "  'view.safety.stat.criticalRules': 'Reglas críticas',\n" +
  "  'view.safety.scope.all': 'Todos los ámbitos',\n" +
  "  'view.safety.scope.door': 'Puerta',\n" +
  "  'view.safety.scope.vehicle': 'Vehículo',\n" +
  "  'view.safety.scope.industrial': 'Industrial',\n" +
  "  'view.safety.condition': 'Condición',\n" +
  "  'view.safety.action': 'Acción',\n" +
  "  'view.safety.triggered': 'Activada {count} veces',\n" +
  "  'view.safety.active': 'Activo',\n" +
  "  'view.safety.disabled': 'Deshabilitado',\n" +
  "  'view.safety.severity.critical': 'crítico',\n" +
  "  'view.safety.severity.high': 'alto',\n" +
  "  'view.safety.severity.medium': 'medio',\n" +
  "  'view.safety.severity.low': 'bajo',\n" +
  "  'view.security.stat.grade': 'Nivel de seguridad',\n" +
  "  'view.security.stat.activeSessions': 'Sesiones activas',\n" +
  "  'view.security.stat.mfaCoverage': 'Cobertura de MFA',\n" +
  "  'view.security.stat.deniedAttempts': 'Intentos denegados (24h)',\n" +
  "  'view.security.sessions.title': 'Sesiones activas',\n" +
  "  'view.security.sessions.subtitle': 'Sesiones de usuario autenticadas en toda la plataforma',\n" +
  "  'view.security.table.user': 'Usuario',\n" +
  "  'view.security.table.method': 'Método',\n" +
  "  'view.security.table.location': 'Ubicación',\n" +
  "  'view.security.table.mfa': 'MFA',\n" +
  "  'view.security.table.lastActive': 'Última actividad',\n" +
  "  'view.security.table.status': 'Estado',\n" +
  "  'view.security.mfa.on': 'Activado',\n" +
  "  'view.security.mfa.off': 'Desactivado',\n" +
  "  'view.security.authMethods.title': 'Métodos de autenticación',\n" +
  "  'view.security.authMethods.sessions': 'sesiones',\n" +
  "  'view.security.policies.title': 'Políticas de seguridad',\n" +
  "  'view.security.policy.zeroPlaintext': 'Política de contraseña sin texto plano',\n" +
  "  'view.security.policy.oauthOidc': 'Flujo OAuth 2.0 / OIDC',\n" +
  "  'view.security.policy.otpRecovery': 'Copia de recuperación OTP',\n" +
  "  'view.security.policy.sessionAudit': 'Registro de auditoría de sesión',\n" +
  "  'view.security.policy.forceMfaAdmins': 'Forzar MFA para todos los administradores',\n" +
  "  'view.security.policy.ipAllowlist': 'Lista blanca de IP (producción)',\n" +
  "  'view.security.status.enforced': 'Aplicado',\n" +
  "  'view.security.status.partial': 'Parcial',\n" +
  "  'view.settings.platform.title': 'Plataforma',\n" +
  "  'view.settings.platform.subtitle': 'Comportamiento principal de la plataforma',\n" +
  "  'view.settings.autoUpdate.label': 'Actualizaciones automáticas de firmware',\n" +
  "  'view.settings.autoUpdate.desc': 'Enviar actualizaciones OTA a dispositivos elegibles',\n" +
  "  'view.settings.offlineMode.label': 'Modo sin conexión perimetral',\n" +
  "  'view.settings.offlineMode.desc': 'Permitir que los gateways funcionen sin la nube',\n" +
  "  'view.settings.auditLog.label': 'Registro de auditoría inmutable',\n" +
  "  'view.settings.auditLog.desc': 'Encadenar criptográficamente todos los eventos',\n" +
  "  'view.settings.security.title': 'Seguridad',\n" +
  "  'view.settings.security.subtitle': 'Políticas de autenticación y acceso',\n" +
  "  'view.settings.twoFactor.label': 'Requerir 2FA para todos los administradores',\n" +
  "  'view.settings.twoFactor.desc': 'Aplicar MFA en los roles de administrador y operador',\n" +
  "  'view.settings.zeroPlaintext.label': 'Política de contraseña sin texto plano',\n" +
  "  'view.settings.zeroPlaintext.desc': 'Hash Argon2id, sin almacenamiento en texto plano',\n" +
  "  'view.settings.safetyOverride.label': 'Permitir anulación de reglas de seguridad',\n" +
  "  'view.settings.safetyOverride.desc': 'Permitir a los ingenieros deshabilitar reglas temporalmente',\n" +
  "  'view.settings.notifications.title': 'Notificaciones',\n" +
  "  'view.settings.notifications.subtitle': 'Canales de entrega de alertas',\n" +
  "  'view.settings.emailAlerts.label': 'Alertas por correo electrónico',\n" +
  "  'view.settings.emailAlerts.desc': 'Enviar alertas críticas a los correos de los administradores',\n" +
  "  'view.settings.smsAlerts.label': 'Alertas por SMS',\n" +
  "  'view.settings.smsAlerts.desc': 'Enviar alertas críticas mediante gateway SMS',\n" +
  "  'view.settings.localization.title': 'Localización y datos',\n" +
  "  'view.settings.localization.subtitle': 'Preferencias de idioma y almacenamiento',\n" +
  "  'view.settings.defaultLanguage': 'Idioma predeterminado',\n" +
  "  'view.settings.defaultTimezone': 'Zona horaria predeterminada',\n" +
  "  'view.settings.timezoneAuto': 'Automático (detectar desde el navegador)',\n" +
  "  'view.settings.databaseBackup': 'Copia de seguridad de la base de datos',\n" +
  "  'view.settings.backupInterval': 'Automático · intervalo de {hours}h',\n" +
  "  'view.settings.saveBar.note': 'Los cambios se aplican a todos los sitios y gateways.',\n" +
  "  'view.settings.saveBar.save': 'Guardar cambios',\n";

content = content.replace(marker, marker + block);
fs.writeFileSync(path, content, 'utf8');
console.log('Done. Spanish (es) translations added.');
