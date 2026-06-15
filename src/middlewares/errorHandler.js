import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';

import AppError from '../utils/AppError.js';
import logger from '../configs/logger.js';

const DEFAULT_ERROR_CODE = 'INTERNAL_SERVER_ERROR';
const DEFAULT_ERROR_MESSAGE = '서버 오류가 발생했습니다.';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function normalizeError(err) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      isOperational: true,
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return {
        statusCode: 409,
        code: 'DUPLICATE_ERROR',
        message: '이미 존재하는 데이터입니다.',
        isOperational: true,
      };
    }

    if (err.code === 'P2025') {
      return {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: '요청한 데이터를 찾을 수 없습니다.',
        isOperational: true,
      };
    }

    if (err.code === 'P2003') {
      return {
        statusCode: 400,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: '연결된 데이터가 올바르지 않습니다.',
        isOperational: true,
      };
    }

    return {
      statusCode: 400,
      code: 'DATABASE_ERROR',
      message: '데이터베이스 요청 처리 중 오류가 발생했습니다.',
      isOperational: true,
    };
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      code: 'DATABASE_VALIDATION_ERROR',
      message: '데이터 형식이 올바르지 않습니다.',
      isOperational: true,
    };
  }

  if (err instanceof jwt.TokenExpiredError) {
    return {
      statusCode: 401,
      code: 'EXPIRED_TOKEN',
      message: '만료된 토큰입니다.',
      isOperational: true,
    };
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return {
      statusCode: 401,
      code: 'INVALID_TOKEN',
      message: '유효하지 않은 토큰입니다.',
      isOperational: true,
    };
  }

  if (err instanceof multer.MulterError) {
    return {
      statusCode: 400,
      code: 'FILE_UPLOAD_ERROR',
      message: '파일 업로드 중 오류가 발생했습니다.',
      isOperational: true,
    };
  }

  if (err.message === 'Not allowed by CORS') {
    return {
      statusCode: 403,
      code: 'CORS_NOT_ALLOWED',
      message: '허용되지 않은 출처입니다.',
      isOperational: true,
    };
  }

  if (err.statusCode || err.status) {
    return {
      statusCode: err.statusCode || err.status,
      code: err.code || DEFAULT_ERROR_CODE,
      message: err.message || DEFAULT_ERROR_MESSAGE,
      isOperational: true,
    };
  }

  return {
    statusCode: 500,
    code: DEFAULT_ERROR_CODE,
    message: DEFAULT_ERROR_MESSAGE,
    isOperational: false,
  };
}

const errorHandler = (err, req, res, next) => {
  const normalizedError = normalizeError(err);
  const { statusCode, code, message, isOperational } = normalizedError;

  if (isOperational) {
    logger.warn(`[${code}] ${message} — ${req.method} ${req.originalUrl}`);
  } else {
    logger.error(`Unhandled error — ${req.method} ${req.originalUrl}`, {
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({
    error: {
      code,
      message,
      ...(!isProduction() && !isOperational
        ? {
            detail: err.message,
          }
        : {}),
    },
  });
};

export default errorHandler;
