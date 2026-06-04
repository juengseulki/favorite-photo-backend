import prisma from '../configs/prisma.js';

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

export const readNotificationsService = async (userId, notificationId) => {
  const notifications = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notifications) {
    throw new AppError('알림을 찾을 수 없습니다.', 404);
  }

  if (notifications.userId !== userId) {
    throw new AppError('해당 알림에 접근할 권한이 없습니다.', 403);
  }

  const updatedNotification = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });

  return updatedNotification;
};

export const readAllNotificationsService = async (userId) => {
  const updatedNotification = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return updatedNotification;
};
