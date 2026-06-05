import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';

//공통 함수 (알림 생성)
export const createNotification = async ({
  userId,
  type,
  content,
  linkUrl,
  targetId,
  targetType,
}) => {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      content,
      linkUrl,
      targetId,
      targetType,
    },
  });
};

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
    throw new AppError(
      404,
      'NOTIFICATION_NOT_FOUND',
      '알림을 찾을 수 없습니다.'
    );
  }

  if (notifications.userId !== userId) {
    throw new AppError(
      403,
      'FORBIDDEN_NOTIFICATION',
      '해당 알림에 접근할 권한이 없습니다.'
    );
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
