import { getMyCardsService } from '../services/gallery.service.js';

export const getMyCards = async (req, res, next) => {
  try {
    const userId = 'b8d131c1-fedc-4fe6-bb20-5f71331d0d3c';

    const {
      keyword,
      grade,
      genre,
      page = 1,
      limit = 4,
      sort = 'latest',
    } = req.query;

    const result = await getMyCardsService({
      userId,
      keyword,
      grade,
      genre,
      page: Number(page),
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
