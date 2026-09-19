import { Router } from 'express';
import { identityRoutes } from '../modules/identity';
import { organizationRoutes } from '../modules/organization';
import { deviceRoutes } from '../modules/device';
import { discoveryRoutes } from '../modules/discovery';
import { commandRoutes } from '../modules/command';
import { gatewayRoutes } from '../modules/communication/gateway';
import { protocolRoutes } from '../modules/communication/protocol';
import { safetyRoutes } from '../modules/safety';

const router = Router();

router.use('/identity', identityRoutes);
router.use('/organization', organizationRoutes);
router.use('/device', deviceRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/command', commandRoutes);
router.use('/gateway', gatewayRoutes);
router.use('/protocol', protocolRoutes);
router.use('/safety', safetyRoutes);

export default router;
