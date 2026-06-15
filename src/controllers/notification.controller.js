import {
  getNotificationsService,
  readNotificationsService,
  readAllNotificationsService,
} from '../services/notification.service.js';

import { addSseClient, removeSseClient } from '../utils/sseClients.js';

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

export const readAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await readAllNotificationsService(userId);

    return res.status(200).json({
      data: result,
      message: 'success',
    });
  } catch (error) {
    next(error);
  }
};

export const streamNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders?.();

    addSseClient(userId, res);

    res.write(
      `event: connected\ndata: ${JSON.stringify({
        message: 'SSE 연결이 완료되었습니다.',
      })}\n\n`
    );

    const keepAlive = setInterval(() => {
      res.write(
        `event: ping\ndata: ${JSON.stringify({
          time: Date.now(),
        })}\n\n`
      );
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
      removeSseClient(userId, res);
    });
  } catch (error) {
    next(error);
  }
};
