import * as authRepository from '../repositories/authRepository.js';
import { hashPassword, verifyPassword, hashToken } from '../utils/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import AppError from '../utils/AppError.js';

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
    throw new AppError(400, 'INVALID_EMAIL', '유효한 이메일을 입력해 주세요.');
  }
  if (!nickname || nickname.length < 2 || nickname.length > 12) {
    throw new AppError(
      400,
      'INVALID_NICKNAME',
      '닉네임은 2자 이상 12자 이하로 입력해 주세요.'
    );
  }
  if (!password || password.length < 8) {
    throw new AppError(
      400,
      'INVALID_PASSWORD',
      '비밀번호는 8자 이상 입력해 주세요.'
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
    throw new AppError(409, 'EMAIL_CONFLICT', '이미 사용 중인 이메일입니다.');
  if (existingNickname)
    throw new AppError(
      409,
      'NICKNAME_CONFLICT',
      '이미 사용 중인 닉네임입니다.'
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
      '이메일과 비밀번호를 입력해 주세요.'
    );
  }

  const user = await authRepository.findUserByEmail(email);

  // 이메일 없음과 비밀번호 불일치를 같은 메시지로 처리 (사용자 열거 방지)
  if (!user || !user.password) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      '이메일 또는 비밀번호가 올바르지 않습니다.'
    );
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      '이메일 또는 비밀번호가 올바르지 않습니다.'
    );
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
    throw new AppError(401, 'NO_REFRESH_TOKEN', '리프레시 토큰이 없습니다.');
  }

  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    throw new AppError(
      401,
      'INVALID_REFRESH_TOKEN',
      '유효하지 않은 리프레시 토큰입니다.'
    );
  }

  const tokenHash = hashToken(incomingToken);
  const stored = await authRepository.findRefreshToken(tokenHash);

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(
      401,
      'REFRESH_TOKEN_EXPIRED',
      '리프레시 토큰이 만료되었습니다. 다시 로그인해 주세요.'
    );
  }

  // 기존 토큰 삭제 후 재 발급
  await authRepository.deleteRefreshToken(tokenHash);
  return generateTokens(payload.userId);
};

export const googleOAuthComplete = async ({
  providerAccountId,
  email,
  nickname,
}) => {
  if (!nickname || nickname.length < 2 || nickname.length > 12) {
    throw new AppError(
      400,
      'INVALID_NICKNAME',
      '닉네임은 2자 이상 12자 이하로 입력해 주세요.'
    );
  }

  const existingNickname = await authRepository.findUserByNickname(nickname);
  if (existingNickname) {
    throw new AppError(
      409,
      'NICKNAME_CONFLICT',
      '이미 사용 중인 닉네임입니다.'
    );
  }

  const user = await authRepository.createOAuthUser({
    email,
    nickname,
    provider: 'GOOGLE',
    providerAccountId,
  });

  const tokens = await generateTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      point: 2000,
    },
    ...tokens,
  };
};

export const logout = async (incomingToken) => {
  if (!incomingToken) return;

  const tokenHash = hashToken(incomingToken);
  await authRepository.deleteRefreshToken(tokenHash).catch(() => {});
};
