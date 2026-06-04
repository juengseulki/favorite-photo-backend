import express from 'express';
import {
  getNotifications,
  readNotifications,
} from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, readNotifications);

export default router;
