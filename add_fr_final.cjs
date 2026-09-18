const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const marker = "const fr: Dict = {\n";
const count = content.split(marker).length - 1;
if (count !== 1) {
  console.error(`ABORT: marker found ${count} times (expected 1).`);
  process.exit(1);
}

const block =
  "  'aiChat.emptyState': \"Commencez une conversation avec KHOEM-AI\",\n" +
  "  'aiChat.placeholder': 'Tapez une commande ou une question…',\n" +
  "  'aiChat.subtitle': 'Votre assistant',\n" +
  "  'intl.pin': 'Épingler {name}',\n" +
  "  'intl.unpin': 'Désépingler {name}',\n" +
  "  'navgroup.overview': 'Aperçu',\n" +
  "  'navgroup.devicesControl': 'Appareils et contrôle',\n" +
  "  'navgroup.securitySafety': 'Sécurité et sûreté',\n" +
  "  'navgroup.organization': 'Organisation',\n" +
  "  'view.dashboard.subtitle': \"Aperçu en temps réel de l'ensemble de votre flotte KSV\",\n" +
  "  'view.devices.subtitle': 'Gérez tous les appareils connectés',\n" +
  "  'view.controls.subtitle': 'Envoyez et consultez les commandes des appareils',\n" +
  "  'view.protocols.subtitle': 'Connectivité et état des protocoles',\n" +
  "  'view.gateway.subtitle': 'Passerelles périphériques et mode hors ligne',\n" +
  "  'view.security.subtitle': 'Identité, sessions et accès',\n" +
  "  'view.safety.subtitle': 'Règles de sécurité et verrouillages',\n" +
  "  'view.organization.subtitle': 'Sites, équipes et rôles',\n" +
  "  'view.international.subtitle': 'Pays, langue et fuseau horaire',\n" +
  "  'view.audit.subtitle': \"Journal complet d'activité et de sécurité\",\n" +
  "  'view.certificates.subtitle': 'Dossiers de formation et de conformité',\n" +
  "  'view.settings.subtitle': 'Préférences du compte et de la plateforme',\n" +
  "  'dashboard.trend.devicesUp': '2,4%',\n" +
  "  'dashboard.trend.rulesNew': '12 nouvelles',\n" +
  "  'dashboard.trend.gatewayOffline': '1 hors ligne',\n" +
  "  'dashboard.trend.countriesAdded': '3 ajoutés',\n" +
  "  'dashboard.traffic.title': 'Trafic de la plateforme',\n" +
  "  'dashboard.traffic.subtitle': 'Messages de commande par minute — dernières 24 heures',\n" +
  "  'dashboard.traffic.live': 'En direct',\n" +
  "  'dashboard.traffic.peakThroughput': 'Débit maximal',\n" +
  "  'dashboard.traffic.cmdPerMin': '{count} cmd/min',\n" +
  "  'dashboard.traffic.avgLatency': 'Latence moyenne',\n" +
  "  'dashboard.traffic.ms': '{count} ms',\n" +
  "  'dashboard.traffic.uptime': 'Disponibilité',\n" +
  "  'dashboard.traffic.days': '{count} jours',\n" +
  "  'dashboard.health.title': 'État des appareils',\n" +
  "  'dashboard.health.subtitle': 'État global de la flotte',\n" +
  "  'dashboard.health.online': 'En ligne',\n" +
  "  'dashboard.health.warning': 'Avertissement',\n" +
  "  'dashboard.health.offline': 'Hors ligne',\n" +
  "  'dashboard.alerts.title': 'Activité des alertes',\n" +
  "  'dashboard.alerts.subtitle': 'Déclencheurs de sécurité + sûreté',\n" +
  "  'dashboard.alerts.openAlerts': 'Alertes ouvertes',\n" +
  "  'dashboard.alerts.critical': '{count} critiques',\n" +
  "  'dashboard.sites.title': 'Charge des sites',\n" +
  "  'dashboard.sites.subtitle': 'Appareils par site et utilisation des passerelles',\n" +
  "  'dashboard.sites.viewAll': 'Tout afficher',\n" +
  "  'dashboard.sites.devicesAndLoad': '{count} appareils · {load}%',\n" +
  "  'dashboard.recentDevices.title': 'Appareils récents',\n" +
  "  'dashboard.safetyRules.title': 'Règles de sécurité',\n" +
  "  'dashboard.safetyRules.triggered': '{scope} · déclenché {count} fois',\n" +
  "  'dashboard.protocols.title': 'État des protocoles',\n" +
  "  'dashboard.protocols.devicesAndLatency': '{count} appareils · {latency}ms',\n" +
  "  'dashboard.gateway.title': 'Flotte de passerelles périphériques',\n" +
  "  'dashboard.gateway.subtitle': 'Contrôleurs locaux avec capacité de mode hors ligne',\n" +
  "  'dashboard.gateway.onlineBadge': '{online}/{total} en ligne',\n" +
  "  'dashboard.gateway.cpu': 'CPU',\n" +
  "  'dashboard.gateway.mem': 'Mémoire',\n" +
  "  'dashboard.gateway.devices': 'Appareils',\n" +
  "  'view.devices.registryTitle': 'Registre des appareils',\n" +
  "  'view.devices.acrossAllSites': 'appareils sur tous les sites',\n" +
  "  'view.devices.export': 'Exporter',\n" +
  "  'view.devices.searchPlaceholder': \"Rechercher par nom ou ID d'appareil…\",\n" +
  "  'view.devices.noMatch': 'Aucun appareil ne correspond à vos filtres.',\n" +
  "  'view.devices.filter.all': 'tous',\n" +
  "  'view.devices.filter.online': 'en ligne',\n" +
  "  'view.devices.filter.warning': 'avertissement',\n" +
  "  'view.devices.filter.maintenance': 'maintenance',\n" +
  "  'view.devices.filter.offline': 'hors ligne',\n" +
  "  'view.devices.status.online': 'en ligne',\n" +
  "  'view.devices.status.warning': 'avertissement',\n" +
  "  'view.devices.status.offline': 'hors ligne',\n" +
  "  'view.devices.status.maintenance': 'maintenance',\n" +
  "  'view.devices.category.access': 'Accès',\n" +
  "  'view.devices.category.climate': 'Climatisation',\n" +
  "  'view.devices.category.industrial': 'Industriel',\n" +
  "  'view.devices.category.vehicle': 'Véhicule',\n" +
  "  'view.devices.category.sensor': 'Capteur',\n" +
  "  'view.devices.category.network': 'Réseau',\n" +
  "  'view.devices.table.device': 'Appareil',\n" +
  "  'view.devices.table.category': 'Catégorie',\n" +
  "  'view.devices.table.protocol': 'Protocole',\n" +
  "  'view.devices.table.location': 'Emplacement',\n" +
  "  'view.devices.table.signal': 'Signal',\n" +
  "  'view.devices.table.firmware': 'Micrologiciel',\n" +
  "  'view.devices.table.status': 'Statut',\n" +
  "  'view.audit.title': \"Piste d'audit immuable\",\n" +
  "  'view.audit.subtitleText': \"Journal d'événements chaîné par cryptographie — toute l'activité de la plateforme\",\n" +
  "  'view.audit.chainVerified': 'Chaîne vérifiée',\n" +
  "  'view.audit.searchPlaceholder': 'Rechercher par acteur, action ou cible…',\n" +
  "  'view.audit.noMatch': 'Aucun événement ne correspond à vos filtres.',\n" +
  "  'view.audit.loading': \"Chargement de la piste d'audit…\",\n" +
  "  'view.audit.loadFailed': \"Impossible de charger la piste d'audit.\",\n" +
  "  'view.audit.category.all': 'tous',\n" +
  "  'view.audit.category.auth': 'authentification',\n" +
  "  'view.audit.category.device': 'appareil',\n" +
  "  'view.audit.category.safety': 'sécurité',\n" +
  "  'view.audit.category.admin': 'administration',\n" +
  "  'view.audit.category.network': 'réseau',\n" +
  "  'view.audit.result.success': 'succès',\n" +
  "  'view.audit.result.denied': 'refusé',\n" +
  "  'view.audit.result.error': 'erreur',\n" +
  "  'view.certificates.heading': 'Certificats Sololearn',\n" +
  "  'view.certificates.description': \"Certifications professionnelles vérifiées détenues par les membres de l'équipe KSV\",\n" +
  "  'view.certificates.certificatesLabel': 'Certificats',\n" +
  "  'view.certificates.verifiedLabel': 'Vérifié',\n" +
  "  'view.certificates.verified': 'Vérifié',\n" +
  "  'view.certificates.issued': 'Délivré',\n" +
  "  'view.certificates.expires': 'Expire',\n" +
  "  'view.certificates.viewCertificate': 'Voir le certificat',\n" +
  "  'view.certificates.category.development': 'Développement',\n" +
  "  'view.certificates.category.security': 'Sécurité',\n" +
  "  'view.certificates.category.iot': 'IoT',\n" +
  "  'view.certificates.category.database': 'Base de données',\n" +
  "  'view.certificates.category.cloud': 'Cloud',\n" +
  "  'view.controls.vaultDoor.name': 'Porte du coffre nord',\n" +
  "  'view.controls.vaultDoor.site': 'Siège de Francfort',\n" +
  "  'view.controls.hvac.name': 'CVC de salle blanche',\n" +
  "  'view.controls.hvac.site': 'Usine de Taipei',\n" +
  "  'view.controls.pressEstop.name': \"Arrêt d'urgence ligne de presse 7\",\n" +
  "  'view.controls.pressEstop.site': 'Usine de Stuttgart',\n" +
  "  'view.controls.robotArm.name': 'Bras robotique RA-04',\n" +
  "  'view.controls.robotArm.site': \"Usine d'Osaka\",\n" +
  "  'view.controls.eastGate.name': 'Barrière porte est',\n" +
  "  'view.controls.eastGate.site': 'Logistique de Dubaï',\n" +
  "  'view.controls.coldStorage.name': 'Moniteur de chambre froide',\n" +
  "  'view.controls.coldStorage.site': 'Port de Rotterdam',\n" +
  "  'view.controls.secured': 'SÉCURISÉ',\n" +
  "  'view.controls.unlocked': 'DÉVERROUILLÉ',\n" +
  "  'view.controls.unlock': 'Déverrouiller',\n" +
  "  'view.controls.lock': 'Verrouiller',\n" +
  "  'view.controls.setpoint': 'Consigne',\n" +
  "  'view.controls.fan': 'Ventilateur',\n" +
  "  'view.controls.mode': 'Mode',\n" +
  "  'view.controls.cool': 'Refroidir',\n" +
  "  'view.controls.filter': 'Filtre',\n" +
  "  'view.controls.estop': \"ARRÊT D'URGENCE\",\n" +
  "  'view.controls.lineHalted': 'LIGNE ARRÊTÉE',\n" +
  "  'view.controls.pressOperational': 'Presse opérationnelle',\n" +
  "  'view.controls.reset': 'Réinitialiser',\n" +
  "  'view.controls.speedLimit': 'Limite de vitesse',\n" +
  "  'view.controls.humanZoneOverride': 'Dérogation zone humaine',\n" +
  "  'view.controls.active': 'Actif',\n" +
  "  'view.controls.collisionDetection': 'Détection de collision',\n" +
  "  'view.controls.enabled': 'Activé',\n" +
  "  'view.controls.maintenance': 'Maintenance',\n" +
  "  'view.controls.barrierOpen': 'BARRIÈRE OUVERTE',\n" +
  "  'view.controls.barrierClosed': 'BARRIÈRE FERMÉE',\n" +
  "  'view.controls.close': 'Fermer',\n" +
  "  'view.controls.open': 'Ouvrir',\n" +
  "  'view.controls.targetTemp': 'Température cible',\n" +
  "  'view.controls.current': 'Actuel',\n" +
  "  'view.controls.logTitle': 'Activité de contrôle en direct',\n" +
  "  'view.controls.logSubtitle': 'Commandes envoyées au cours de la dernière heure',\n" +
  "  'view.controls.logLoading': \"Chargement de l'activité récente…\",\n" +
  "  'view.controls.logEmpty': 'Aucune commande envoyée pour le moment.',\n" +
  "  'view.controls.logLoadFailed': \"Impossible de charger l'activité récente.\",\n" +
  "  'view.controls.log.vaultDoor': 'Porte du coffre nord',\n" +
  "  'view.controls.log.robotArm': 'Bras robotique RA-04',\n" +
  "  'view.controls.log.hvac': 'CVC de salle blanche',\n" +
  "  'view.controls.log.pressLine': 'Ligne de presse 7',\n" +
  "  'view.controls.log.eastGate': 'Barrière porte est',\n" +
  "  'view.gateway.online': 'En ligne',\n" +
  "  'view.gateway.degraded': 'Dégradé',\n" +
  "  'view.gateway.offline': 'Hors ligne',\n" +
  "  'view.gateway.memory': 'Mémoire',\n" +
  "  'view.gateway.firmware': 'Micrologiciel',\n" +
  "  'view.gateway.lastSync': 'Dernière synchronisation',\n" +
  "  'view.gateway.offlineMode': 'Mode hors ligne',\n" +
  "  'view.gateway.connected': 'Connecté',\n" +
  "  'view.gateway.reconnecting': 'Reconnexion en cours',\n" +
  "  'view.gateway.discoveryTitle': 'Découverte réseau local',\n" +
  "  'view.gateway.discoverySubtitle': 'Analyse par diffusion mDNS / UDP pour les appareils périphériques',\n" +
  "  'view.gateway.discovery.frankfurt': 'Contrôleur périphérique de Francfort',\n" +
  "  'view.gateway.discovery.badgeReader': 'Lecteur de badge B2-A',\n" +
  "  'view.gateway.discovery.singapore': 'Contrôleur périphérique de Singapour',\n" +
  "  'view.gateway.discovery.airSensor': \"Capteur d'air de toit\",\n" +
  "  'view.organization.hierarchyTitle': 'Hiérarchie organisationnelle',\n" +
  "  'view.organization.hierarchySubtitle': 'Entreprise → Site → Bâtiment → Héritage de politique des appareils',\n" +
  "  'view.organization.nodes': 'nœuds',\n" +
  "  'view.organization.users': 'Utilisateurs',\n" +
  "  'view.organization.rules': 'règles',\n" +
  "  'view.organization.accessPoliciesTitle': \"Politiques d'accès\",\n" +
  "  'view.organization.accessPoliciesSubtitle': \"Règles de contrôle d'accès basé sur les politiques (PBAC)\",\n" +
  "  'view.organization.roleDefinitionsTitle': 'Définitions des rôles',\n" +
  "  'view.organization.roleDefinitionsSubtitle': 'Catalogue des rôles à l\\'échelle de la plateforme',\n" +
  "  'view.organization.type.company': 'Holding',\n" +
  "  'view.organization.type.site': 'Région/Site',\n" +
  "  'view.organization.type.building': 'Bâtiment',\n" +
  "  'view.organization.type.floor': 'Étage',\n" +
  "  'view.organization.site.frankfurt': 'Siège de Francfort',\n" +
  "  'view.organization.site.singapore': 'Centre de données de Singapour',\n" +
  "  'view.organization.site.taipei': 'Usine de Taipei',\n" +
  "  'view.organization.site.emea': 'Région EMEA',\n" +
  "  'view.organization.site.apac': 'Région APAC',\n" +
  "  'view.organization.policy.hqStrict': 'Siège strict',\n" +
  "  'view.organization.policy.dcCritical': 'Centre de données critique',\n" +
  "  'view.organization.policy.fabCleanroom': \"Salle blanche d'usine\",\n" +
  "  'view.organization.policy.emeaBaseline': 'Référence EMEA',\n" +
  "  'view.organization.policy.apacBaseline': 'Référence APAC',\n" +
  "  'view.organization.role.orgOwner': \"Propriétaire de l'organisation\",\n" +
  "  'view.organization.role.siteAdmin': 'Administrateur de site',\n" +
  "  'view.organization.role.safetyEngineer': 'Ingénieur sécurité',\n" +
  "  'view.organization.role.networkAdmin': 'Administrateur réseau',\n" +
  "  'view.organization.role.operator': 'Opérateur',\n" +
  "  'view.organization.role.viewer': 'Observateur',\n" +
  "  'view.organization.perms.orgOwner': 'Contrôle complet de la plateforme',\n" +
  "  'view.organization.perms.siteAdmin': 'Gestion au niveau du site',\n" +
  "  'view.organization.perms.safetyEngineer': 'Règles de sécurité + contrôles des appareils',\n" +
  "  'view.organization.perms.networkAdmin': 'Configuration passerelle + protocole',\n" +
  "  'view.organization.perms.operator': \"Contrôle des appareils + consultation de l'audit\",\n" +
  "  'view.organization.perms.viewer': 'Accès en lecture seule au tableau de bord',\n" +
  "  'view.protocols.abstractionTitle': \"Couche d'abstraction de protocole\",\n" +
  "  'view.protocols.abstractionSubtitle': \"Interface d'adaptateur unifiée pour tous les protocoles de transport\",\n" +
  "  'view.protocols.latency': 'Latence',\n" +
  "  'view.protocols.encryptionTitle': 'Normes de chiffrement',\n" +
  "  'view.protocols.capabilityRegistryTitle': 'Registre des capacités',\n" +
  "  'view.protocols.dev': 'développement',\n" +
  "  'view.protocols.status.active': 'actif',\n" +
  "  'view.protocols.status.degraded': 'dégradé',\n" +
  "  'view.protocols.status.offline': 'hors ligne',\n" +
  "  'view.protocols.enc.tls': 'TLS 1.3',\n" +
  "  'view.protocols.enc.wpa3': 'WPA3-Entreprise',\n" +
  "  'view.protocols.enc.aesBle': 'AES-CCM (BLE)',\n" +
  "  'view.protocols.enc.aesZigbee': 'AES-128 (Zigbee)',\n" +
  "  'view.safety.stat.rulesActive': 'Règles actives',\n" +
  "  'view.safety.stat.totalTriggers': 'Total des déclenchements (30j)',\n" +
  "  'view.safety.stat.criticalRules': 'Règles critiques',\n" +
  "  'view.safety.scope.all': 'Toutes les portées',\n" +
  "  'view.safety.scope.door': 'Porte',\n" +
  "  'view.safety.scope.vehicle': 'Véhicule',\n" +
  "  'view.safety.scope.industrial': 'Industriel',\n" +
  "  'view.safety.condition': 'Condition',\n" +
  "  'view.safety.action': 'Action',\n" +
  "  'view.safety.triggered': 'Déclenché {count} fois',\n" +
  "  'view.safety.active': 'Actif',\n" +
  "  'view.safety.disabled': 'Désactivé',\n" +
  "  'view.safety.severity.critical': 'critique',\n" +
  "  'view.safety.severity.high': 'élevé',\n" +
  "  'view.safety.severity.medium': 'moyen',\n" +
  "  'view.safety.severity.low': 'faible',\n" +
  "  'view.security.stat.grade': 'Note de sécurité',\n" +
  "  'view.security.stat.activeSessions': 'Sessions actives',\n" +
  "  'view.security.stat.mfaCoverage': 'Couverture MFA',\n" +
  "  'view.security.stat.deniedAttempts': 'Tentatives refusées (24h)',\n" +
  "  'view.security.sessions.title': 'Sessions actives',\n" +
  "  'view.security.sessions.subtitle': 'Sessions utilisateur authentifiées sur la plateforme',\n" +
  "  'view.security.table.user': 'Utilisateur',\n" +
  "  'view.security.table.method': 'Méthode',\n" +
  "  'view.security.table.location': 'Emplacement',\n" +
  "  'view.security.table.mfa': 'MFA',\n" +
  "  'view.security.table.lastActive': 'Dernière activité',\n" +
  "  'view.security.table.status': 'Statut',\n" +
  "  'view.security.mfa.on': 'Activé',\n" +
  "  'view.security.mfa.off': 'Désactivé',\n" +
  "  'view.security.authMethods.title': \"Méthodes d'authentification\",\n" +
  "  'view.security.authMethods.sessions': 'sessions',\n" +
  "  'view.security.policies.title': 'Politiques de sécurité',\n" +
  "  'view.security.policy.zeroPlaintext': 'Politique de mot de passe sans texte clair',\n" +
  "  'view.security.policy.oauthOidc': 'Flux OAuth 2.0 / OIDC',\n" +
  "  'view.security.policy.otpRecovery': 'Sauvegarde de récupération OTP',\n" +
  "  'view.security.policy.sessionAudit': \"Journalisation d'audit de session\",\n" +
  "  'view.security.policy.forceMfaAdmins': 'Forcer la MFA pour tous les administrateurs',\n" +
  "  'view.security.policy.ipAllowlist': 'Liste blanche IP (production)',\n" +
  "  'view.security.status.enforced': 'Appliqué',\n" +
  "  'view.security.status.partial': 'Partiel',\n" +
  "  'view.settings.platform.title': 'Plateforme',\n" +
  "  'view.settings.platform.subtitle': 'Comportement principal de la plateforme',\n" +
  "  'view.settings.autoUpdate.label': 'Mises à jour automatiques du micrologiciel',\n" +
  "  'view.settings.autoUpdate.desc': 'Envoyer les mises à jour OTA aux appareils éligibles',\n" +
  "  'view.settings.offlineMode.label': 'Mode hors ligne périphérique',\n" +
  "  'view.settings.offlineMode.desc': 'Permettre aux passerelles de fonctionner sans le cloud',\n" +
  "  'view.settings.auditLog.label': \"Journalisation d'audit immuable\",\n" +
  "  'view.settings.auditLog.desc': 'Chaîner tous les événements par cryptographie',\n" +
  "  'view.settings.security.title': 'Sécurité',\n" +
  "  'view.settings.security.subtitle': \"Politiques d'authentification et d'accès\",\n" +
  "  'view.settings.twoFactor.label': 'Exiger la 2FA pour tous les administrateurs',\n" +
  "  'view.settings.twoFactor.desc': \"Appliquer la MFA sur les rôles d'administrateur et d'opérateur\",\n" +
  "  'view.settings.zeroPlaintext.label': 'Politique de mot de passe sans texte clair',\n" +
  "  'view.settings.zeroPlaintext.desc': 'Hachage Argon2id, aucun stockage en texte clair',\n" +
  "  'view.settings.safetyOverride.label': 'Autoriser la dérogation aux règles de sécurité',\n" +
  "  'view.settings.safetyOverride.desc': 'Permettre aux ingénieurs de désactiver temporairement les règles',\n" +
  "  'view.settings.notifications.title': 'Notifications',\n" +
  "  'view.settings.notifications.subtitle': 'Canaux de diffusion des alertes',\n" +
  "  'view.settings.emailAlerts.label': 'Alertes par e-mail',\n" +
  "  'view.settings.emailAlerts.desc': 'Envoyer les alertes critiques aux e-mails des administrateurs',\n" +
  "  'view.settings.smsAlerts.label': 'Alertes par SMS',\n" +
  "  'view.settings.smsAlerts.desc': 'Envoyer les alertes critiques via une passerelle SMS',\n" +
  "  'view.settings.localization.title': 'Localisation et données',\n" +
  "  'view.settings.localization.subtitle': 'Préférences de langue et de stockage',\n" +
  "  'view.settings.defaultLanguage': 'Langue par défaut',\n" +
  "  'view.settings.defaultTimezone': 'Fuseau horaire par défaut',\n" +
  "  'view.settings.timezoneAuto': 'Auto (détecter depuis le navigateur)',\n" +
  "  'view.settings.databaseBackup': 'Sauvegarde de la base de données',\n" +
  "  'view.settings.backupInterval': 'Auto · intervalle de {hours}h',\n" +
  "  'view.settings.saveBar.note': \"Les modifications s'appliquent à tous les sites et passerelles.\",\n" +
  "  'view.settings.saveBar.save': 'Enregistrer les modifications',\n";

content = content.replace(marker, marker + block);
fs.writeFileSync(path, content, 'utf8');
console.log('Done. French (fr) translations added.');
