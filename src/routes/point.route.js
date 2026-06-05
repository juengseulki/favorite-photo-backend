import express from 'express';
import { getPoints } from '../controllers/point.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/history', authenticate, getPoints);

export default router;
