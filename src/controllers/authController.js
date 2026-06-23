import * as authService from '../services/authService.js';
import {
  findUserWithPoint,
  upsertRefreshToken,
} from '../repositories/authRepository.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/hash.js';

const isProduction = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  const { email, nickname, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({
    email,
    nickname,
    password,
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({
    data: { user, accessToken },
    message: '회원가입이 완료되었습니다.',
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({
    data: { user, accessToken },
    message: '로그인되었습니다.',
  });
};

export const refresh = async (req, res) => {
  const incomingToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } =
    await authService.refresh(incomingToken);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({
    data: { accessToken },
    message: '토큰이 갱신되었습니다.',
  });
};

export const logout = async (req, res) => {
  const incomingToken = req.cookies.refreshToken;
  await authService.logout(incomingToken);

  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

  res.json({
    data: null,
    message: '로그아웃되었습니다.',
  });
};

// Google / Kakao / Naver 공통 OAuth 콜백
export const oauthCallback = async (req, res) => {
  const CLIENT_URL = (
    process.env.CLIENT_URL ?? 'http://localhost:3000'
  ).replace(/\/$/, '');
  const oauthUser = req.user;

  // 신규 사용자 — 닉네임 설정 페이지로 리다이렉트
  if (oauthUser?.isNew) {
    const params = new URLSearchParams({
      provider: oauthUser.provider.toUpperCase(),
      providerAccountId: oauthUser.providerAccountId,
      ...(oauthUser.email && { email: oauthUser.email }),
    });
    return res.redirect(`${CLIENT_URL}/auth/setup-nickname?${params}`);
  }

  // 기존 사용자 — 토큰 발급 후 프론트로 리다이렉트
  const accessToken = signAccessToken({ userId: oauthUser.id });
  const refreshToken = signRefreshToken({ userId: oauthUser.id });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await upsertRefreshToken({
    userId: oauthUser.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.redirect(`${CLIENT_URL}/auth/callback?token=${accessToken}`);
};

// 신규 OAuth 사용자 닉네임 설정 완료 (Google / Kakao / Naver 공통)
export const oauthComplete = async (req, res) => {
  const { provider, providerAccountId, email, nickname } = req.body;

  const normalizedProvider = (provider ?? 'GOOGLE').toUpperCase();

  const { user, accessToken, refreshToken } =
    await authService.googleOAuthComplete({
      providerAccountId,
      email,
      nickname,
      provider: normalizedProvider,
    });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({
    data: { user, accessToken },
    message: '회원가입이 완료되었습니다.',
  });
};

export const getMe = async (req, res) => {
  const user = await findUserWithPoint(req.user.id);
  res.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        point: user.point?.balance ?? 0,
      },
    },
    message: '사용자 정보를 가져왔습니다.',
  });
};
