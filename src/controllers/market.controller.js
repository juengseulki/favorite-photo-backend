import {
  getMarketCardsService,
  getMarketCardDetailService,
  purchaseCardsService,
} from '../services/market.service.js';
import AppError from '../utils/AppError.js';

export const getMarketCards = async (req, res, next) => {
  try {
    const {
      keyword,
      grade,
      genre,
      cursor,
      limit = 15,
      sort = 'latest',
    } = req.query;

    const result = await getMarketCardsService({
      keyword,
      grade,
      genre,
      cursor,
      limit: Number(limit),
      sort,
    });

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketCardDetail = async (req, res, next) => {
  try {
    const { saleId } = req.params;

    const result = await getMarketCardDetailService(Number(saleId));

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};

//카드 구매
export const purchaseCards = async (req, res, next) => {
  try {
    const { saleId } = req.params;
    const userId = req.user.id;
    const { quantity } = req.body;

    //값 존재 여부 체크
    if (!quantity) {
      //TODO: 에러 상수 넣기
      throw new AppError(400, 'VALIDATION_ERROR', '수량이 존재하지 않습니다.');
    }
    //값의 논리적 오류 체크
    if (quantity <= 0) {
      //TODO: 에러 상수 넣기
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        '수량은 1 이상이어야 합니다.'
      );
    }

    const response = await purchaseCardsService({
      saleId: Number(saleId),
      buyerId: Number(userId),
      quantity: Number(quantity),
    });
    res.status(200).json({ data: response, message: 'success' });
  } catch (error) {
    next(error);
  }
};
