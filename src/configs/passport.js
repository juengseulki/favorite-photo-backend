import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  findOAuthAccount,
  findUserByEmail,
  createOAuthUser,
  linkOAuthAccount,
} from '../repositories/authRepository.js';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    '[Google OAuth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 미설정 — Google 로그인 비활성화'
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const providerAccountId = profile.id;
          const email = profile.emails?.[0]?.value;

          // 1. 이미 연결된 OAuth 계정이 있으면 해당 유저 반환
          const existing = await findOAuthAccount('GOOGLE', providerAccountId);
          if (existing) {
            return done(null, existing.user);
          }

          // 2. 같은 이메일로 가입된 일반 계정이 있으면 OAuth 계정 연결
          if (email) {
            const userByEmail = await findUserByEmail(email);
            if (userByEmail) {
              await linkOAuthAccount(
                userByEmail.id,
                'GOOGLE',
                providerAccountId
              );
              return done(null, {
                ...userByEmail,
                point: userByEmail.point?.balance ?? 0,
                needsNickname: false,
              });
            }
          }

          // 3. 신규 사용자 — 닉네임 입력이 필요하므로 profile 정보만 전달
          return done(null, {
            isNew: true,
            providerAccountId,
            email: email ?? null,
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

export default passport;
