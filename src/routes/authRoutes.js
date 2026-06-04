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
