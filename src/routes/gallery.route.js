import express from 'express';
import { getMyCards, postMyCards } from '../controllers/gallery.controller.js';

const router = express.Router();

router.get('/me/cards', getMyCards);
router.post('/me/cards', postMyCards);

export default router;
