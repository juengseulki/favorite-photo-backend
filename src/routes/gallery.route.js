import express from 'express';
import {
  getMyCards,
  postMyCards,
  getMyTrades,
} from '../controllers/gallery.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/me/cards', authenticate, getMyCards);
router.post('/me/cards', authenticate, upload.single('image'), postMyCards);
router.get('/me/sales/cards', authenticate, getMyTrades);

export default router;
