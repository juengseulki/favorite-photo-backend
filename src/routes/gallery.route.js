import express from 'express';
import {
  getMyCards,
  postMyCards,
  getMyTrades,
  getMyCardCreateStatus,
} from '../controllers/gallery.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/me/cards', authenticate, getMyCards);
router.post('/me/cards', authenticate, upload.single('image'), postMyCards);
router.get('/me/cards/status', authenticate, getMyCardCreateStatus);

// 프론트 API_ROUTES.SALES.MY 기준
router.get('/me/sales', authenticate, getMyTrades);

// 기존 경로도 유지
router.get('/me/sales/cards', authenticate, getMyTrades);

export default router;
