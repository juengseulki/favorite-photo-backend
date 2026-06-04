import { Router } from 'express';
import authRoutes from './authRoutes.js';
import exchangeRoutes from './exchange.routes.js';
import galleryRoutes from './gallery.route.js';
import marketRoutes from './market.route.js';
import notification from './notification.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', exchangeRoutes);
router.use('/', galleryRoutes);
router.use('/market', marketRoutes);
router.use('/notifications', notification);

export default router;
