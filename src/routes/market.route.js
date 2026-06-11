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
router.post('/cards/:saleId/purchase', authenticate, purchaseCards); //구매 API. 로그인 된 사용자만 접근할 수 있도록 함(authenticate)

export default router;
