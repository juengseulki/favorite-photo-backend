import { Router } from 'express';
import authRoutes from './authRoutes.js';
import exchangeRoutes from './exchange.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', exchangeRoutes);

export default router;
