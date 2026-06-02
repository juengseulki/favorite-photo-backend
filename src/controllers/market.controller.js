import {
  getMarketCardsService,
  getMarketCardDetailService,
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
      cursor: cursor ? Number(cursor) : undefined,
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
