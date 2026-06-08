import { verifyAccessToken } from '../utils/jwt.js';
import { findUserById } from '../repositories/authRepository.js';
import AppError from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

// 인증 필수 미들웨어 (Authorization: Bearer <accessToken> 헤더를 검증 후 req.user를 설정)
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'NO_TOKEN', ERROR_MESSAGES.NO_TOKEN);
    }

    const token = authHeader.slice(7);

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(401, 'INVALID_TOKEN', ERROR_MESSAGES.INVALID_TOKEN);
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      throw new AppError(401, 'USER_NOT_FOUND', ERROR_MESSAGES.USER_NOT_FOUND);
    }

    req.user = { id: user.id, email: user.email, nickname: user.nickname };
    next();
  } catch (err) {
    next(err);
  }
};

// 인증 선택 미들웨어 (토큰이 있으면 req.user를 설정하고, 없으면 그냥 통과)
export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.userId);

    if (user) {
      req.user = { id: user.id, email: user.email, nickname: user.nickname };
    }
  } catch {
    // 토큰이 유효하지 않아도 선택 인증은 그냥 통과
  }

  next();
};
