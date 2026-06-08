//요청 데이터 검증, 서비스 호출, 응답 반환 역할

import saleService from '../services/sale.service.js';
import AppError from '../utils/AppError.js';

export const createSale = async (req, res, next) => {
  //새로운 sale 데이터 검증
  try {
    //TODO: 그런데, 이런 로그인 검증은, 검증이 필요한 API들을 싸그리 모아서 한 번에 처리할 수 있지 않나?
    const userId = req.user.id;
    if (!userId) {
      //TODO: 에러 상수 넣기
      throw new AppError(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
    }

    const {
      photoCardId,
      price,
      quantity,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
    } = req.body;

    //필수 값 누락 검증
    if (!photoCardId || !price || !quantity) {
      //TODO: 에러 상수 넣기
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'photoCardId, price, quantity, exchangeInfo는 필수 정보입니다.'
      );
    }

    //값의 논리적 오류 검증
    if (price <= 0)
      //TODO: 에러 상수 넣기
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        '가격은 1원 이상이어야 합니다.'
      );
    if (quantity <= 0)
      //TODO: 에러 상수 넣기
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        '수량은 1개 이상이어야 합니다.'
      );

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
    res.status(201).json({ data: response, message: 'success' });
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
    res.status(200).json({ data: response, message: 'success' });
  } catch (e) {
    next(e);
  }
};
export const cancelSale = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const { saleId } = req.params;
    await saleService.cancelSale(saleId, userId);
    res.status(204).json({ message: 'success' });
  } catch (e) {
    next(e);
  }
};

const saleController = { createSale, modifySale, cancelSale };
export default saleController;
