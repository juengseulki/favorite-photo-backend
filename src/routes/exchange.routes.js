import express from 'express';
import {
  acceptExchangeProposal,
  createExchangeProposal,
  getExchangeProposals,
  rejectExchangeProposal,
} from '../controllers/exchange.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/exchange-proposals', authenticate, createExchangeProposal);
router.get('/exchange-proposals', authenticate, getExchangeProposals);
router.patch(
  '/exchange-proposals/:id/accept',
  authenticate,
  acceptExchangeProposal
);
router.patch(
  '/exchange-proposals/:id/reject',
  authenticate,
  rejectExchangeProposal
);

export default router;
