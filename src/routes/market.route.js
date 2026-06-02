import express from 'express';
import {
  getMarketCards,
  getMarketCardDetail,
} from '../controllers/market.controller.js';

const router = express.Router();

router.get('/cards', getMarketCards);
router.get('/cards/:saleId', getMarketCardDetail);

export default router;
