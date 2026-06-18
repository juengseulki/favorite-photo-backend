import express from 'express';
import {
  getNotifications,
  readNotifications,
  readAllNotifications,
  streamNotifications,
} from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, readNotifications);
router.patch('/read-all', authenticate, readAllNotifications);
router.get('/stream', authenticate, streamNotifications);

export default router;
