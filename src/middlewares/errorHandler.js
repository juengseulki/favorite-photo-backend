import AppError from '../utils/AppError.js';
import logger from '../configs/logger.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn(
      `[${err.code}] ${err.message} — ${req.method} ${req.originalUrl}`
    );
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  logger.error(`Unhandled error — ${req.method} ${req.originalUrl}`, {
    error: err,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다.',
    },
  });
};

export default errorHandler;
