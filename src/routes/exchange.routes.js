import express from 'express';
import {
  createExchangeProposal,
  getExchangeProposals,
} from '../controllers/exchange.controller.js';

const router = express.Router();

// TODO(auth): 팀원 auth 작업 머지 후 requireAuth 미들웨어 연결
router.post('/exchange-proposals', createExchangeProposal);
router.get('/exchange-proposals', getExchangeProposals);

export default router;
