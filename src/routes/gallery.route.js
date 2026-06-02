import express from 'express';
import { getMyCards } from '../controllers/gallery.controller.js';

const router = express.Router();

router.get('/me/cards', getMyCards);

export default router;
