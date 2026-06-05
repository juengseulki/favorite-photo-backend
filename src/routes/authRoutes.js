import { Router } from 'express';
import passport from '../configs/passport.js';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

// OAuth 공통 닉네임 설정 완료
router.post('/oauth/complete', authController.oauthComplete);

// passport 인증 실패 시 프론트 로그인 페이지로 리다이렉트하는 공통 핸들러
const oauthAuthenticate = (strategy) => (req, res, next) => {
  const CLIENT_URL = (
    process.env.CLIENT_URL ?? 'http://localhost:3000'
  ).replace(/\/$/, '');

  passport.authenticate(strategy, { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  authController.oauthCallback
);

// Kakao OAuth
router.get('/kakao', passport.authenticate('kakao', { session: false }));
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/login', session: false }),
  authController.oauthCallback
);

// Naver OAuth
router.get('/naver', passport.authenticate('naver', { session: false }));
router.get(
  '/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/login', session: false }),
  authController.oauthCallback
);

export default router;
