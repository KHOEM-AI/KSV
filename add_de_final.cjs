const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const marker = "const de: Dict = {\n";
const count = content.split(marker).length - 1;
if (count !== 1) {
  console.error(`ABORT: marker found ${count} times (expected 1).`);
  process.exit(1);
}

const block =
  "  'aiChat.emptyState': 'Starten Sie ein Gespräch mit KHOEM-AI',\n" +
  "  'aiChat.placeholder': 'Befehl oder Frage eingeben…',\n" +
  "  'aiChat.subtitle': 'Ihr Assistent',\n" +
  "  'intl.pin': '{name} anheften',\n" +
  "  'intl.unpin': '{name} lösen',\n" +
  "  'navgroup.overview': 'Übersicht',\n" +
  "  'navgroup.devicesControl': 'Geräte und Steuerung',\n" +
  "  'navgroup.securitySafety': 'Sicherheit und Schutz',\n" +
  "  'navgroup.organization': 'Organisation',\n" +
  "  'view.dashboard.subtitle': 'Live-Übersicht Ihrer gesamten KSV-Flotte',\n" +
  "  'view.devices.subtitle': 'Verwalten Sie alle verbundenen Geräte',\n" +
  "  'view.controls.subtitle': 'Gerätebefehle senden und prüfen',\n" +
  "  'view.protocols.subtitle': 'Konnektivität und Protokollstatus',\n" +
  "  'view.gateway.subtitle': 'Edge-Gateways und Offline-Modus',\n" +
  "  'view.security.subtitle': 'Identität, Sitzungen und Zugriff',\n" +
  "  'view.safety.subtitle': 'Sicherheitsregeln und Verriegelungen',\n" +
  "  'view.organization.subtitle': 'Standorte, Teams und Rollen',\n" +
  "  'view.international.subtitle': 'Land, Sprache und Zeitzone',\n" +
  "  'view.audit.subtitle': 'Vollständiges Aktivitäts- und Sicherheitsprotokoll',\n" +
  "  'view.certificates.subtitle': 'Schulungs- und Compliance-Nachweise',\n" +
  "  'view.settings.subtitle': 'Konto- und Plattformeinstellungen',\n" +
  "  'dashboard.trend.devicesUp': '2,4%',\n" +
  "  'dashboard.trend.rulesNew': '12 neu',\n" +
  "  'dashboard.trend.gatewayOffline': '1 offline',\n" +
  "  'dashboard.trend.countriesAdded': '3 hinzugefügt',\n" +
  "  'dashboard.traffic.title': 'Plattformverkehr',\n" +
  "  'dashboard.traffic.subtitle': 'Befehlsnachrichten pro Minute — letzte 24 Stunden',\n" +
  "  'dashboard.traffic.live': 'Live',\n" +
  "  'dashboard.traffic.peakThroughput': 'Spitzendurchsatz',\n" +
  "  'dashboard.traffic.cmdPerMin': '{count} Befehle/Min',\n" +
  "  'dashboard.traffic.avgLatency': 'Durchschnittliche Latenz',\n" +
  "  'dashboard.traffic.ms': '{count} ms',\n" +
  "  'dashboard.traffic.uptime': 'Verfügbarkeit',\n" +
  "  'dashboard.traffic.days': '{count} Tage',\n" +
  "  'dashboard.health.title': 'Gerätezustand',\n" +
  "  'dashboard.health.subtitle': 'Globaler Flottenstatus',\n" +
  "  'dashboard.health.online': 'Online',\n" +
  "  'dashboard.health.warning': 'Warnung',\n" +
  "  'dashboard.health.offline': 'Offline',\n" +
  "  'dashboard.alerts.title': 'Alarmaktivität',\n" +
  "  'dashboard.alerts.subtitle': 'Sicherheits- und Schutzauslöser',\n" +
  "  'dashboard.alerts.openAlerts': 'Offene Alarme',\n" +
  "  'dashboard.alerts.critical': '{count} kritisch',\n" +
  "  'dashboard.sites.title': 'Standortauslastung',\n" +
  "  'dashboard.sites.subtitle': 'Geräte pro Standort und Gateway-Auslastung',\n" +
  "  'dashboard.sites.viewAll': 'Alle anzeigen',\n" +
  "  'dashboard.sites.devicesAndLoad': '{count} Geräte · {load}%',\n" +
  "  'dashboard.recentDevices.title': 'Zuletzt hinzugefügte Geräte',\n" +
  "  'dashboard.safetyRules.title': 'Sicherheitsregeln',\n" +
  "  'dashboard.safetyRules.triggered': '{scope} · {count}× ausgelöst',\n" +
  "  'dashboard.protocols.title': 'Protokollstatus',\n" +
  "  'dashboard.protocols.devicesAndLatency': '{count} Geräte · {latency}ms',\n" +
  "  'dashboard.gateway.title': 'Edge-Gateway-Flotte',\n" +
  "  'dashboard.gateway.subtitle': 'Lokale Controller mit Offline-Modus-Fähigkeit',\n" +
  "  'dashboard.gateway.onlineBadge': '{online}/{total} online',\n" +
  "  'dashboard.gateway.cpu': 'CPU',\n" +
  "  'dashboard.gateway.mem': 'Speicher',\n" +
  "  'dashboard.gateway.devices': 'Geräte',\n" +
  "  'view.devices.registryTitle': 'Geräteregister',\n" +
  "  'view.devices.acrossAllSites': 'Geräte an allen Standorten',\n" +
  "  'view.devices.export': 'Exportieren',\n" +
  "  'view.devices.searchPlaceholder': 'Nach Name oder Geräte-ID suchen…',\n" +
  "  'view.devices.noMatch': 'Keine Geräte entsprechen Ihren Filtern.',\n" +
  "  'view.devices.filter.all': 'alle',\n" +
  "  'view.devices.filter.online': 'online',\n" +
  "  'view.devices.filter.warning': 'Warnung',\n" +
  "  'view.devices.filter.maintenance': 'Wartung',\n" +
  "  'view.devices.filter.offline': 'offline',\n" +
  "  'view.devices.status.online': 'online',\n" +
  "  'view.devices.status.warning': 'Warnung',\n" +
  "  'view.devices.status.offline': 'offline',\n" +
  "  'view.devices.status.maintenance': 'Wartung',\n" +
  "  'view.devices.category.access': 'Zutritt',\n" +
  "  'view.devices.category.climate': 'Klima',\n" +
  "  'view.devices.category.industrial': 'Industrie',\n" +
  "  'view.devices.category.vehicle': 'Fahrzeug',\n" +
  "  'view.devices.category.sensor': 'Sensor',\n" +
  "  'view.devices.category.network': 'Netzwerk',\n" +
  "  'view.devices.table.device': 'Gerät',\n" +
  "  'view.devices.table.category': 'Kategorie',\n" +
  "  'view.devices.table.protocol': 'Protokoll',\n" +
  "  'view.devices.table.location': 'Standort',\n" +
  "  'view.devices.table.signal': 'Signal',\n" +
  "  'view.devices.table.firmware': 'Firmware',\n" +
  "  'view.devices.table.status': 'Status',\n" +
  "  'view.audit.title': 'Unveränderlicher Prüfpfad',\n" +
  "  'view.audit.subtitleText': 'Kryptografisch verkettetes Ereignisprotokoll — alle Plattformaktivitäten',\n" +
  "  'view.audit.chainVerified': 'Kette verifiziert',\n" +
  "  'view.audit.searchPlaceholder': 'Nach Akteur, Aktion oder Ziel suchen…',\n" +
  "  'view.audit.noMatch': 'Keine Ereignisse entsprechen Ihren Filtern.',\n" +
  "  'view.audit.loading': 'Prüfpfad wird geladen…',\n" +
  "  'view.audit.loadFailed': 'Prüfpfad konnte nicht geladen werden.',\n" +
  "  'view.audit.category.all': 'alle',\n" +
  "  'view.audit.category.auth': 'Authentifizierung',\n" +
  "  'view.audit.category.device': 'Gerät',\n" +
  "  'view.audit.category.safety': 'Sicherheit',\n" +
  "  'view.audit.category.admin': 'Verwaltung',\n" +
  "  'view.audit.category.network': 'Netzwerk',\n" +
  "  'view.audit.result.success': 'Erfolg',\n" +
  "  'view.audit.result.denied': 'Verweigert',\n" +
  "  'view.audit.result.error': 'Fehler',\n" +
  "  'view.certificates.heading': 'Sololearn-Zertifikate',\n" +
  "  'view.certificates.description': 'Verifizierte berufliche Zertifizierungen der KSV-Teammitglieder',\n" +
  "  'view.certificates.certificatesLabel': 'Zertifikate',\n" +
  "  'view.certificates.verifiedLabel': 'Verifiziert',\n" +
  "  'view.certificates.verified': 'Verifiziert',\n" +
  "  'view.certificates.issued': 'Ausgestellt',\n" +
  "  'view.certificates.expires': 'Läuft ab',\n" +
  "  'view.certificates.viewCertificate': 'Zertifikat ansehen',\n" +
  "  'view.certificates.category.development': 'Entwicklung',\n" +
  "  'view.certificates.category.security': 'Sicherheit',\n" +
  "  'view.certificates.category.iot': 'IoT',\n" +
  "  'view.certificates.category.database': 'Datenbank',\n" +
  "  'view.certificates.category.cloud': 'Cloud',\n" +
  "  'view.controls.vaultDoor.name': 'Nordtresortür',\n" +
  "  'view.controls.vaultDoor.site': 'Hauptsitz Frankfurt',\n" +
  "  'view.controls.hvac.name': 'Reinraum-Klimaanlage',\n" +
  "  'view.controls.hvac.site': 'Werk Taipeh',\n" +
  "  'view.controls.pressEstop.name': 'Not-Aus Presslinie 7',\n" +
  "  'view.controls.pressEstop.site': 'Werk Stuttgart',\n" +
  "  'view.controls.robotArm.name': 'Roboterarm RA-04',\n" +
  "  'view.controls.robotArm.site': 'Werk Osaka',\n" +
  "  'view.controls.eastGate.name': 'Osttorschranke',\n" +
  "  'view.controls.eastGate.site': 'Logistik Dubai',\n" +
  "  'view.controls.coldStorage.name': 'Kühllager-Überwachung',\n" +
  "  'view.controls.coldStorage.site': 'Hafen Rotterdam',\n" +
  "  'view.controls.secured': 'GESICHERT',\n" +
  "  'view.controls.unlocked': 'ENTRIEGELT',\n" +
  "  'view.controls.unlock': 'Entriegeln',\n" +
  "  'view.controls.lock': 'Verriegeln',\n" +
  "  'view.controls.setpoint': 'Sollwert',\n" +
  "  'view.controls.fan': 'Lüfter',\n" +
  "  'view.controls.mode': 'Modus',\n" +
  "  'view.controls.cool': 'Kühlen',\n" +
  "  'view.controls.filter': 'Filter',\n" +
  "  'view.controls.estop': 'NOT-AUS',\n" +
  "  'view.controls.lineHalted': 'LINIE GESTOPPT',\n" +
  "  'view.controls.pressOperational': 'Presse betriebsbereit',\n" +
  "  'view.controls.reset': 'Zurücksetzen',\n" +
  "  'view.controls.speedLimit': 'Geschwindigkeitsbegrenzung',\n" +
  "  'view.controls.humanZoneOverride': 'Personenzonen-Override',\n" +
  "  'view.controls.active': 'Aktiv',\n" +
  "  'view.controls.collisionDetection': 'Kollisionserkennung',\n" +
  "  'view.controls.enabled': 'Aktiviert',\n" +
  "  'view.controls.maintenance': 'Wartung',\n" +
  "  'view.controls.barrierOpen': 'SCHRANKE OFFEN',\n" +
  "  'view.controls.barrierClosed': 'SCHRANKE GESCHLOSSEN',\n" +
  "  'view.controls.close': 'Schließen',\n" +
  "  'view.controls.open': 'Öffnen',\n" +
  "  'view.controls.targetTemp': 'Zieltemperatur',\n" +
  "  'view.controls.current': 'Aktuell',\n" +
  "  'view.controls.logTitle': 'Live-Steuerungsaktivität',\n" +
  "  'view.controls.logSubtitle': 'Befehle der letzten Stunde',\n" +
  "  'view.controls.logLoading': 'Letzte Aktivitäten werden geladen…',\n" +
  "  'view.controls.logEmpty': 'Noch keine Befehle gesendet.',\n" +
  "  'view.controls.logLoadFailed': 'Letzte Aktivitäten konnten nicht geladen werden.',\n" +
  "  'view.controls.log.vaultDoor': 'Nordtresortür',\n" +
  "  'view.controls.log.robotArm': 'Roboterarm RA-04',\n" +
  "  'view.controls.log.hvac': 'Reinraum-Klimaanlage',\n" +
  "  'view.controls.log.pressLine': 'Presslinie 7',\n" +
  "  'view.controls.log.eastGate': 'Osttorschranke',\n" +
  "  'view.gateway.online': 'Online',\n" +
  "  'view.gateway.degraded': 'Beeinträchtigt',\n" +
  "  'view.gateway.offline': 'Offline',\n" +
  "  'view.gateway.memory': 'Speicher',\n" +
  "  'view.gateway.firmware': 'Firmware',\n" +
  "  'view.gateway.lastSync': 'Letzte Synchronisierung',\n" +
  "  'view.gateway.offlineMode': 'Offline-Modus',\n" +
  "  'view.gateway.connected': 'Verbunden',\n" +
  "  'view.gateway.reconnecting': 'Wird erneut verbunden',\n" +
  "  'view.gateway.discoveryTitle': 'Lokale Netzwerkerkennung',\n" +
  "  'view.gateway.discoverySubtitle': 'mDNS-/UDP-Broadcast-Suche nach Edge-Geräten',\n" +
  "  'view.gateway.discovery.frankfurt': 'Edge-Controller Frankfurt',\n" +
  "  'view.gateway.discovery.badgeReader': 'Badge-Leser B2-A',\n" +
  "  'view.gateway.discovery.singapore': 'Edge-Controller Singapur',\n" +
  "  'view.gateway.discovery.airSensor': 'Luftsensor Dach',\n" +
  "  'view.organization.hierarchyTitle': 'Organisationshierarchie',\n" +
  "  'view.organization.hierarchySubtitle': 'Unternehmen → Standort → Gebäude → Geräterichtlinien-Vererbung',\n" +
  "  'view.organization.nodes': 'Knoten',\n" +
  "  'view.organization.users': 'Benutzer',\n" +
  "  'view.organization.rules': 'Regeln',\n" +
  "  'view.organization.accessPoliciesTitle': 'Zugriffsrichtlinien',\n" +
  "  'view.organization.accessPoliciesSubtitle': 'Richtlinienbasierte Zugriffskontrolle (PBAC)',\n" +
  "  'view.organization.roleDefinitionsTitle': 'Rollendefinitionen',\n" +
  "  'view.organization.roleDefinitionsSubtitle': 'Plattformweiter Rollenkatalog',\n" +
  "  'view.organization.type.company': 'Holding',\n" +
  "  'view.organization.type.site': 'Region/Standort',\n" +
  "  'view.organization.type.building': 'Gebäude',\n" +
  "  'view.organization.type.floor': 'Etage',\n" +
  "  'view.organization.site.frankfurt': 'Hauptsitz Frankfurt',\n" +
  "  'view.organization.site.singapore': 'Rechenzentrum Singapur',\n" +
  "  'view.organization.site.taipei': 'Werk Taipeh',\n" +
  "  'view.organization.site.emea': 'Region EMEA',\n" +
  "  'view.organization.site.apac': 'Region APAC',\n" +
  "  'view.organization.policy.hqStrict': 'Zentrale strikt',\n" +
  "  'view.organization.policy.dcCritical': 'Rechenzentrum kritisch',\n" +
  "  'view.organization.policy.fabCleanroom': 'Werk-Reinraum',\n" +
  "  'view.organization.policy.emeaBaseline': 'EMEA-Basislinie',\n" +
  "  'view.organization.policy.apacBaseline': 'APAC-Basislinie',\n" +
  "  'view.organization.role.orgOwner': 'Organisationsinhaber',\n" +
  "  'view.organization.role.siteAdmin': 'Standortadministrator',\n" +
  "  'view.organization.role.safetyEngineer': 'Sicherheitsingenieur',\n" +
  "  'view.organization.role.networkAdmin': 'Netzwerkadministrator',\n" +
  "  'view.organization.role.operator': 'Bediener',\n" +
  "  'view.organization.role.viewer': 'Betrachter',\n" +
  "  'view.organization.perms.orgOwner': 'Vollständige Plattformkontrolle',\n" +
  "  'view.organization.perms.siteAdmin': 'Verwaltung auf Standortebene',\n" +
  "  'view.organization.perms.safetyEngineer': 'Sicherheitsregeln + Gerätesteuerung',\n" +
  "  'view.organization.perms.networkAdmin': 'Gateway- + Protokollkonfiguration',\n" +
  "  'view.organization.perms.operator': 'Gerätesteuerung + Prüfpfad ansehen',\n" +
  "  'view.organization.perms.viewer': 'Nur-Lese-Zugriff auf Dashboard',\n" +
  "  'view.protocols.abstractionTitle': 'Protokoll-Abstraktionsschicht',\n" +
  "  'view.protocols.abstractionSubtitle': 'Einheitliche Adapterschnittstelle für alle Transportprotokolle',\n" +
  "  'view.protocols.latency': 'Latenz',\n" +
  "  'view.protocols.encryptionTitle': 'Verschlüsselungsstandards',\n" +
  "  'view.protocols.capabilityRegistryTitle': 'Funktionsregister',\n" +
  "  'view.protocols.dev': 'Entwicklung',\n" +
  "  'view.protocols.status.active': 'aktiv',\n" +
  "  'view.protocols.status.degraded': 'beeinträchtigt',\n" +
  "  'view.protocols.status.offline': 'offline',\n" +
  "  'view.protocols.enc.tls': 'TLS 1.3',\n" +
  "  'view.protocols.enc.wpa3': 'WPA3-Enterprise',\n" +
  "  'view.protocols.enc.aesBle': 'AES-CCM (BLE)',\n" +
  "  'view.protocols.enc.aesZigbee': 'AES-128 (Zigbee)',\n" +
  "  'view.safety.stat.rulesActive': 'Aktive Regeln',\n" +
  "  'view.safety.stat.totalTriggers': 'Auslösungen gesamt (30T)',\n" +
  "  'view.safety.stat.criticalRules': 'Kritische Regeln',\n" +
  "  'view.safety.scope.all': 'Alle Bereiche',\n" +
  "  'view.safety.scope.door': 'Tür',\n" +
  "  'view.safety.scope.vehicle': 'Fahrzeug',\n" +
  "  'view.safety.scope.industrial': 'Industrie',\n" +
  "  'view.safety.condition': 'Bedingung',\n" +
  "  'view.safety.action': 'Aktion',\n" +
  "  'view.safety.triggered': '{count}× ausgelöst',\n" +
  "  'view.safety.active': 'Aktiv',\n" +
  "  'view.safety.disabled': 'Deaktiviert',\n" +
  "  'view.safety.severity.critical': 'kritisch',\n" +
  "  'view.safety.severity.high': 'hoch',\n" +
  "  'view.safety.severity.medium': 'mittel',\n" +
  "  'view.safety.severity.low': 'niedrig',\n" +
  "  'view.security.stat.grade': 'Sicherheitsstufe',\n" +
  "  'view.security.stat.activeSessions': 'Aktive Sitzungen',\n" +
  "  'view.security.stat.mfaCoverage': 'MFA-Abdeckung',\n" +
  "  'view.security.stat.deniedAttempts': 'Abgelehnte Versuche (24h)',\n" +
  "  'view.security.sessions.title': 'Aktive Sitzungen',\n" +
  "  'view.security.sessions.subtitle': 'Authentifizierte Benutzersitzungen auf der Plattform',\n" +
  "  'view.security.table.user': 'Benutzer',\n" +
  "  'view.security.table.method': 'Methode',\n" +
  "  'view.security.table.location': 'Standort',\n" +
  "  'view.security.table.mfa': 'MFA',\n" +
  "  'view.security.table.lastActive': 'Zuletzt aktiv',\n" +
  "  'view.security.table.status': 'Status',\n" +
  "  'view.security.mfa.on': 'Ein',\n" +
  "  'view.security.mfa.off': 'Aus',\n" +
  "  'view.security.authMethods.title': 'Authentifizierungsmethoden',\n" +
  "  'view.security.authMethods.sessions': 'Sitzungen',\n" +
  "  'view.security.policies.title': 'Sicherheitsrichtlinien',\n" +
  "  'view.security.policy.zeroPlaintext': 'Zero-Plaintext-Passwortrichtlinie',\n" +
  "  'view.security.policy.oauthOidc': 'OAuth 2.0 / OIDC-Ablauf',\n" +
  "  'view.security.policy.otpRecovery': 'OTP-Wiederherstellungssicherung',\n" +
  "  'view.security.policy.sessionAudit': 'Sitzungs-Audit-Protokollierung',\n" +
  "  'view.security.policy.forceMfaAdmins': 'MFA für alle Administratoren erzwingen',\n" +
  "  'view.security.policy.ipAllowlist': 'IP-Positivliste (Produktion)',\n" +
  "  'view.security.status.enforced': 'Durchgesetzt',\n" +
  "  'view.security.status.partial': 'Teilweise',\n" +
  "  'view.settings.platform.title': 'Plattform',\n" +
  "  'view.settings.platform.subtitle': 'Kernverhalten der Plattform',\n" +
  "  'view.settings.autoUpdate.label': 'Automatische Firmware-Updates',\n" +
  "  'view.settings.autoUpdate.desc': 'OTA-Updates an berechtigte Geräte senden',\n" +
  "  'view.settings.offlineMode.label': 'Edge-Offline-Modus',\n" +
  "  'view.settings.offlineMode.desc': 'Gateways ohne Cloud-Verbindung betreiben lassen',\n" +
  "  'view.settings.auditLog.label': 'Unveränderliche Audit-Protokollierung',\n" +
  "  'view.settings.auditLog.desc': 'Alle Ereignisse kryptografisch verketten',\n" +
  "  'view.settings.security.title': 'Sicherheit',\n" +
  "  'view.settings.security.subtitle': 'Authentifizierungs- und Zugriffsrichtlinien',\n" +
  "  'view.settings.twoFactor.label': '2FA für alle Administratoren erfordern',\n" +
  "  'view.settings.twoFactor.desc': 'MFA für Administrator- und Bedienerrollen erzwingen',\n" +
  "  'view.settings.zeroPlaintext.label': 'Zero-Plaintext-Passwortrichtlinie',\n" +
  "  'view.settings.zeroPlaintext.desc': 'Argon2id-Hashing, keine Klartextspeicherung',\n" +
  "  'view.settings.safetyOverride.label': 'Außerkraftsetzung von Sicherheitsregeln zulassen',\n" +
  "  'view.settings.safetyOverride.desc': 'Ingenieuren erlauben, Regeln vorübergehend zu deaktivieren',\n" +
  "  'view.settings.notifications.title': 'Benachrichtigungen',\n" +
  "  'view.settings.notifications.subtitle': 'Kanäle für Alarmzustellung',\n" +
  "  'view.settings.emailAlerts.label': 'E-Mail-Alarme',\n" +
  "  'view.settings.emailAlerts.desc': 'Kritische Alarme an Administrator-E-Mails senden',\n" +
  "  'view.settings.smsAlerts.label': 'SMS-Alarme',\n" +
  "  'view.settings.smsAlerts.desc': 'Kritische Alarme über SMS-Gateway senden',\n" +
  "  'view.settings.localization.title': 'Lokalisierung und Daten',\n" +
  "  'view.settings.localization.subtitle': 'Sprach- und Speichereinstellungen',\n" +
  "  'view.settings.defaultLanguage': 'Standardsprache',\n" +
  "  'view.settings.defaultTimezone': 'Standardzeitzone',\n" +
  "  'view.settings.timezoneAuto': 'Auto (aus Browser erkennen)',\n" +
  "  'view.settings.databaseBackup': 'Datenbanksicherung',\n" +
  "  'view.settings.backupInterval': 'Auto · alle {hours}h',\n" +
  "  'view.settings.saveBar.note': 'Änderungen gelten für alle Standorte und Gateways.',\n" +
  "  'view.settings.saveBar.save': 'Änderungen speichern',\n";

content = content.replace(marker, marker + block);
fs.writeFileSync(path, content, 'utf8');
console.log('Done. German (de) translations added.');
