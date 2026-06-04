import { Router } from 'express';
import authRoutes from './authRoutes.js';
import exchangeRoutes from './exchange.routes.js';
import marketRoutes from './market.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', exchangeRoutes);
router.use('/market', marketRoutes);

export default router;
