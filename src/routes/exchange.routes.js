import express from 'express';
import {
  createExchangeProposal,
  getExchangeProposals,
} from '../controllers/exchange.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/exchange-proposals', authenticate, createExchangeProposal);
router.get('/exchange-proposals', authenticate, getExchangeProposals);

export default router;
