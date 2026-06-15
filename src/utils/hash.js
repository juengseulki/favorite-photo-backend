import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  if (!password) {
    throw new Error('Password is required');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
};

export const hashToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  return crypto.createHash('sha256').update(token).digest('hex');
};
