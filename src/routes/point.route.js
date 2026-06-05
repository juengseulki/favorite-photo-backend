import express from 'express';
import {
  getPoints,
  getRandomBoxStatus,
} from '../controllers/point.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/history', authenticate, getPoints);
router.get('/random-box/status', authenticate, getRandomBoxStatus);

export default router;
