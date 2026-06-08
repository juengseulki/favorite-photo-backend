import express from 'express';
import {
  getMarketCards,
  getMarketCardDetail,
  purchaseCards,
} from '../controllers/market.controller.js';

const router = express.Router();

router.get('/cards', getMarketCards);
router.get('/cards/:saleId', getMarketCardDetail);
router.post('/cards/:saleId/purchase', purchaseCards);

export default router;
