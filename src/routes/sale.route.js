import express from 'express';
import saleController from '../controllers/sale.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/', authenticate, saleController.createSale); //카드 판매 등록
router.patch('/:saleId', authenticate, saleController.modifySale); //판매 정보 수정
router.delete('/:saleId', authenticate, saleController.cancelSale); //판매 취소

export default router;
