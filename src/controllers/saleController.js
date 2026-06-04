//요청 데이터 검증, 서비스 호출, 응답 반환 역할

import saleService from '../services/saleService';
import AppError from '../utils/AppError';

const saleController = { createSale, modifySale, cancelSale };

export const createSale = (req, res, next) => {
  //새로운 sale 데이터 검증
  try {
    const { photoCardId, price, quantity, exchangeInfo } = req.body;
    //validation_error 검증
    if (!photoCardId || !price || !quantity || !exchangeInfo) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'photoCardId, price, quantity, exchangeInfo는 필수 정보입니다.'
      );
    }
    const userId = req.user.id;
    if (!userId) {
      throw new AppError();
      //TODO: 내가 여기에서 뭔 에러를 던져야 하지? 유저 id가 없는 것 -> 로그인 되지 않은 거라는 건데,
    }
    //1. Sale 만들기
    const sale = saleService.createSale(
      photoCardId,
      price,
      exchangeInfo,
      userId
    );
    //2. quantity만큼 SaleItem을 만들어서, cardCopy와 연결하기
    const saleId = sale.id;
    const cardCopyId = saleService.getCardCopyId();
    //3. cardCopy의 status를 ON_SALE로 변경
    res.json({ data: response, message: 'success' });
  } catch (e) {
    next(e);
  }
};
export const modifySale = (req, res, next) => {
  try {
    const { saleId } = req.params;
    const {} = req.body;
  } catch (e) {
    next(e);
  }
};
export const cancelSale = (req, res, next) => {
  try {
    const { saleId } = req.params;
  } catch (e) {
    next(e);
  }
};

export default saleController;
