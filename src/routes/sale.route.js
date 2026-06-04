import express from 'express';
import saleController from '../controllers/sale.controller.js';

const router = express.Router();

router.post('/', saleController.createSale); //카드 판매 등록
router.patch('/:saleId', saleController.modifySale); //판매 정보 수정
router.delete('/:saleId', saleController.cancelSale); //판매 취소

export default router;
