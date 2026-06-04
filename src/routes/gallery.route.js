import express from 'express';
import { getMyCards, postMyCards } from '../controllers/gallery.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/me/cards', authenticate, getMyCards);
router.post('/me/cards', authenticate, postMyCards);

export default router;
