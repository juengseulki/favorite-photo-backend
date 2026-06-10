import express from 'express';
import {
  getMarketCards,
  getMarketCardDetail,
  purchaseCards,
} from '../controllers/market.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/cards', getMarketCards);
router.get('/cards/:saleId', getMarketCardDetail);
router.post('/cards/:saleId/purchase', authenticate, purchaseCards);

export default router;
