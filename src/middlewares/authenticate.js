import { verifyAccessToken } from '../utils/jwt.js';
import { findUserById } from '../repositories/authRepository.js';
import AppError from '../utils/AppError.js';

// 인증 필수 미들웨어 (Authorization: Bearer <accessToken> 헤더를 검증 후 req.user를 설정)
export const authenticate = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.split(' ')[1];

    const queryToken = req.query.token;

    const token = bearerToken || queryToken;

    // if (!authHeader?.startsWith('Bearer ')) {
    //   throw new AppError(401, 'NO_TOKEN', '인증 토큰이 없습니다.');
    // }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(401, 'INVALID_TOKEN', '유효하지 않은 토큰입니다.');
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      throw new AppError(401, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
    }

    req.user = { id: user.id, email: user.email, nickname: user.nickname };
    next();
  } catch (err) {
    next(err);
  }
};

// 인증 선택 미들웨어 (토큰이 있으면 req.user를 설정하고, 없으면 그냥 통과)
export const optionalAuthenticate = async (req, res, next) => {
  const bearerToken = req.headers.authorization?.split(' ')[1];

  const queryToken = req.query.token;

  const token = bearerToken || queryToken;

  // if (!authHeader?.startsWith('Bearer ')) {
  //   return next();
  // }

  try {
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
