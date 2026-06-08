import {
  getPointsService,
  getRandomBoxStatusService,
  openRandomBoxService,
} from '../services/point.service.js';

export const getPoints = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { page = 1, limit = 15 } = req.query;

    const result = await getPointsService({
      userId,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};

export const getRandomBoxStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await getRandomBoxStatusService(userId);

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};

export const openRandomBox = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { selectedBox } = req.body;
    const result = await openRandomBoxService(userId, selectedBox);

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};
