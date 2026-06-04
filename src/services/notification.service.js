import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';

export const getNotificationsService = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return {
    items: notifications,
    meta: { totalCount: notifications.length, unreadCount },
  };
};
