import {
  getMarketCardsService,
  getMarketCardDetailService,
  purchaseCardsService,
} from '../services/market.service.js';

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
