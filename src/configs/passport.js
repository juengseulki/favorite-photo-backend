import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import {
  findOAuthAccount,
  findUserByEmail,
  linkOAuthAccount,
} from '../repositories/authRepository.js';

// 세 provider 공통 콜백 로직
const handleOAuth =
  (provider) => async (accessToken, refreshToken, profile, done) => {
    try {
      const providerAccountId = String(profile.id);
      const email =
        profile.emails?.[0]?.value ??
        profile._json?.kakao_account?.email ??
        null;

      // 1. 이미 연결된 OAuth 계정
      const existing = await findOAuthAccount(provider, providerAccountId);
      if (existing) return done(null, existing.user);

      // 2. 같은 이메일의 일반 계정 → OAuth 연결
      if (email) {
        const userByEmail = await findUserByEmail(email);
        if (userByEmail) {
          await linkOAuthAccount(userByEmail.id, provider, providerAccountId);
          return done(null, userByEmail);
        }
      }

      // 3. 완전 신규 → 닉네임 설정 필요
      return done(null, { isNew: true, provider, providerAccountId, email });
    } catch (err) {
      return done(err);
    }
  };

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      handleOAuth('GOOGLE')
    )
  );
} else {
  console.warn('[OAuth] Google 자격증명 미설정 — Google 로그인 비활성화');
}

if (process.env.KAKAO_CLIENT_ID) {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET ?? '',
        callbackURL: process.env.KAKAO_CALLBACK_URL,
      },
      handleOAuth('KAKAO')
    )
  );
} else {
  console.warn('[OAuth] Kakao 자격증명 미설정 — Kakao 로그인 비활성화');
}

if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: process.env.NAVER_CALLBACK_URL,
      },
      handleOAuth('NAVER')
    )
  );
} else {
  console.warn('[OAuth] Naver 자격증명 미설정 — Naver 로그인 비활성화');
}

export default passport;
