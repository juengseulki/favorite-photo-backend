import {
  getMyCardsService,
  postMyCardsService,
} from '../services/gallery.service.js';

export const getMyCards = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      keyword,
      grade,
      genre,
      page = 1,
      limit = 15,
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

export const postMyCards = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { name, description, grade, genre, initialPrice, totalQuantity } =
      req.body;

    const imageUrl = `/uploads/${req.file.filename}`;

    const result = await postMyCardsService({
      userId,
      name,
      description,
      imageUrl,
      grade,
      genre,
      initialPrice: Number(initialPrice),
      totalQuantity: Number(totalQuantity),
    });

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};
