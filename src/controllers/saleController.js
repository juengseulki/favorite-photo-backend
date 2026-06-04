//요청 데이터 검증, 서비스 호출, 응답 반환 역할

import saleService from '../services/saleService.js';
import AppError from '../utils/AppError.js';

export const createSale = async (req, res, next) => {
  //새로운 sale 데이터 검증
  try {
    const {
      photoCardId,
      price,
      quantity,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
    } = req.body;
    //validation_error 검증
    if (!photoCardId || !price || !quantity) {
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
    const response = await saleService.createSale({
      photoCardId,
      price,
      quantity,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
      userId,
    });
    res.json({ data: response, message: 'success' });
  } catch (e) {
    next(e);
  }
};

export const modifySale = async (req, res, next) => {
  try {
    const { saleId } = req.params;
    const userId = req.user.id;
    const { photoCardId, data } = req.body;
    const response = await saleService.modifySale(
      saleId,
      photoCardId,
      userId,
      data
    );
    res.json({ data: response, message: 'success' });
  } catch (e) {
    next(e);
  }
};
export const cancelSale = async (req, res, next) => {
  try {
    const { saleId } = req.params;
    await saleService.cancelSale(saleId);
    res.json {message:'success'}
  } catch (e) {
    next(e);
  }
};

const saleController = { createSale, modifySale, cancelSale };
export default saleController;
