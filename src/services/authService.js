import * as authRepository from '../repositories/authRepository.js';
import { hashPassword, verifyPassword, hashToken } from '../utils/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import AppError from '../utils/AppError.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

const REFRESH_EXPIRES_DAYS = 7;
const SIGNUP_POINTS = 2000;

const generateTokens = async (userId) => {
  const accessToken = signAccessToken({ userId });
  const refreshToken = signRefreshToken({ userId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  await authRepository.createRefreshToken({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return { accessToken, refreshToken };
};

const validateRegisterInput = ({ email, nickname, password }) => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(400, 'INVALID_EMAIL', ERROR_MESSAGES.INVALID_EMAIL);
  }
  if (!nickname || nickname.length < 2 || nickname.length > 12) {
    throw new AppError(
      400,
      'INVALID_NICKNAME',
      ERROR_MESSAGES.INVALID_NICKNAME_LENGTH
    );
  }
  if (!password || password.length < 8) {
    throw new AppError(
      400,
      'INVALID_PASSWORD',
      ERROR_MESSAGES.INVALID_PASSWORD_LENGTH
    );
  }
};

export const register = async ({ email, nickname, password }) => {
  validateRegisterInput({ email, nickname, password });

  const [existingEmail, existingNickname] = await Promise.all([
    authRepository.findUserByEmail(email),
    authRepository.findUserByNickname(nickname),
  ]);

  if (existingEmail)
    throw new AppError(
      409,
      'EMAIL_CONFLICT',
      ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
    );
  if (existingNickname)
    throw new AppError(
      409,
      'NICKNAME_CONFLICT',
      ERROR_MESSAGES.NICKNAME_ALREADY_EXISTS
    );

  const hashedPassword = await hashPassword(password);
  const user = await authRepository.createUserWithPoint({
    email,
    nickname,
    password: hashedPassword,
  });

  const tokens = await generateTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      point: SIGNUP_POINTS,
    },
    ...tokens,
  };
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError(
      400,
      'MISSING_FIELDS',
      ERROR_MESSAGES.MISSING_CREDENTIALS
    );
  }

  const user = await authRepository.findUserByEmail(email);

  // 이메일 없음과 비밀번호 불일치를 같은 메시지로 처리 (사용자 열거 방지)
  if (!user || !user.password) {
    throw new AppError(401, 'INVALID_CREDENTIALS', ERROR_MESSAGES.LOGIN_FAILED);
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', ERROR_MESSAGES.LOGIN_FAILED);
  }

  const userWithPoint = await authRepository.findUserWithPoint(user.id);
  const tokens = await generateTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      point: userWithPoint?.point?.balance ?? 0,
    },
    ...tokens,
  };
};

export const refresh = async (incomingToken) => {
  if (!incomingToken) {
    throw new AppError(
      401,
      'NO_REFRESH_TOKEN',
      ERROR_MESSAGES.NO_REFRESH_TOKEN
    );
  }

  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    throw new AppError(
      401,
      'INVALID_REFRESH_TOKEN',
      ERROR_MESSAGES.INVALID_REFRESH_TOKEN
    );
  }

  const tokenHash = hashToken(incomingToken);
  const stored = await authRepository.findRefreshToken(tokenHash);

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(
      401,
      'REFRESH_TOKEN_EXPIRED',
      ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED
    );
  }

  // 기존 토큰 삭제 후 재발급
  await authRepository.deleteRefreshToken(tokenHash);
  return generateTokens(payload.userId);
};

export const googleOAuthComplete = async ({
  providerAccountId,
  email,
  nickname,
  provider = 'GOOGLE',
}) => {
  if (!nickname || nickname.length < 2 || nickname.length > 12) {
    throw new AppError(
      400,
      'INVALID_NICKNAME',
      ERROR_MESSAGES.INVALID_NICKNAME_LENGTH
    );
  }

  const existingNickname = await authRepository.findUserByNickname(nickname);
  if (existingNickname) {
    throw new AppError(
      409,
      'NICKNAME_CONFLICT',
      ERROR_MESSAGES.NICKNAME_ALREADY_EXISTS
    );
  }

  const user = await authRepository.createOAuthUser({
    email,
    nickname,
    provider,
    providerAccountId,
  });

  const tokens = await generateTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      point: SIGNUP_POINTS,
    },
    ...tokens,
  };
};

export const logout = async (incomingToken) => {
  if (!incomingToken) return;

  const tokenHash = hashToken(incomingToken);
  await authRepository.deleteRefreshToken(tokenHash).catch(() => {});
};
