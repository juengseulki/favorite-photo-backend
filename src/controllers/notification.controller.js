import {
  getNotificationsService,
  readNotificationsService,
} from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getNotificationsService(userId);

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};

export const readNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);
    const result = await readNotificationsService(userId, notificationId);

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};
