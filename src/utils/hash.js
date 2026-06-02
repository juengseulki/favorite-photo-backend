import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = (password, hash) =>
  bcrypt.compare(password, hash);

// DB에서 refreshToken을 tokenHash로 조회할 수 있어야 하므로 SHA-256 사용
export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
