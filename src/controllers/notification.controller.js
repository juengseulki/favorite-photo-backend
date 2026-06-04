import { getNotificationsService } from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('userId', userId);
    const result = await getNotificationsService(userId);

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};
