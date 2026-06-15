import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { sendSseToUser } from '../utils/sseClients.js';

export const createNotification = async ({
  userId,
  type,
  content,
  linkUrl,
  targetId,
  targetType,
}) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      content,
      linkUrl,
      targetId,
      targetType,
    },
  });

  sendSseToUser(userId, 'notification', notification);

  return notification;
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
    meta: {
      totalCount: notifications.length,
      unreadCount,
    },
  };
};

export const readNotificationsService = async (userId, notificationId) => {
  const parsedNotificationId = Number(notificationId);

  if (!Number.isInteger(parsedNotificationId) || parsedNotificationId <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('notificationId가 올바르지 않습니다.')
    );
  }

  const notification = await prisma.notification.findUnique({
    where: {
      id: parsedNotificationId,
    },
  });

  if (!notification) {
    throw new AppError(ERROR_CODES.NOTIFICATION_NOT_FOUND());
  }

  if (notification.userId !== userId) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN('해당 알림에 접근할 권한이 없습니다.')
    );
  }

  return await prisma.notification.update({
    where: {
      id: parsedNotificationId,
    },
    data: {
      isRead: true,
    },
  });
};

export const readAllNotificationsService = async (userId) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};
