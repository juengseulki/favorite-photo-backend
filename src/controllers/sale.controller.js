//요청 데이터 검증, 서비스 호출, 응답 반환 역할

import { ERROR_CODES } from '../constants/errorCodes.js';
import saleService from '../services/sale.service.js';
import AppError from '../utils/AppError.js';

export const createSale = async (req, res, next) => {
  //새로운 sale 데이터 검증
  try {
    const userId = req.user.id;
    if (!userId) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED);
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
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR(
          'photoCardId, price, quantity, exchangeInfo는 필수 정보입니다.'
        )
      );
    }

    //값의 논리적 오류 검증
    if (price <= 0)
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR('가격은 1원 이상이어야 합니다.')
      );
    if (quantity <= 0)
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR('수량은 1개 이상이어야 합니다.')
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
