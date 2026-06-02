import * as authService from '../services/authService.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
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

  res.clearCookie('refreshToken');
  res.json({
    data: null,
    message: '로그아웃되었습니다.',
  });
};

export const getMe = (req, res) => {
  res.json({
    data: { user: req.user },
    message: '사용자 정보를 가져왔습니다.',
  });
};
