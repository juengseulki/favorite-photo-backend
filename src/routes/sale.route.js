import express from 'express';
import saleController from '../controllers/sale.controller.js';

const router = express.Router();

router.post('/', saleController.createSale); //카드 판매 등록

router.get('/:saleId/photocard', saleController.getPhotocardBySaleId); //판매에 해당하는 포토카드 조회
router.get('/:saleId/count-all', saleController.countAllCards); //판매에 해당하는 카드를 모두 Count (판매 된 것도, 판매 안 된 것도)
router.get('/:saleId/count-active', saleController.countActiveCards); //판매에 해당하는 카드 중, 판매 중인 것만 Count

router.patch('/:saleId', saleController.modifySale); //판매 정보 수정
router.delete('/:saleId', saleController.cancelSale); //판매 취소
router.get('/:saleId', saleController.getSale); //판매 조회

export default router;
