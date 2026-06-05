import {
  getPointsService,
  getRandomBoxStatusService,
} from '../services/point.service.js';

export const getPoints = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await getPointsService(userId);

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
