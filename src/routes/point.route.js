import express from 'express';
import {
  getPoints,
  getRandomBoxStatus,
  openRandomBox,
} from '../controllers/point.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/history', authenticate, getPoints);
router.get('/random-box/status', authenticate, getRandomBoxStatus);
router.post('/random-box', authenticate, openRandomBox);

export default router;
