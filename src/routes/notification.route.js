import express from 'express';
import { getNotifications } from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);

export default router;
