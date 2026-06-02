import prisma from '../configs/prisma.js';

export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

export const findUserByNickname = (nickname) =>
  prisma.user.findUnique({ where: { nickname } });

export const findUserById = (id) => prisma.user.findUnique({ where: { id } });

export const createUserWithPoint = ({ email, nickname, password }) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, nickname, password },
    });

    await tx.point.create({
      data: { userId: user.id, balance: 2000 },
    });

    await tx.pointHistory.create({
      data: {
        userId: user.id,
        amount: 2000,
        reason: 'SIGN_UP',
        description: '회원가입 축하 포인트',
      },
    });

    return user;
  });

export const createRefreshToken = ({ userId, tokenHash, expiresAt }) =>
  prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });

export const findRefreshToken = (tokenHash) =>
  prisma.refreshToken.findUnique({ where: { tokenHash } });

export const deleteRefreshToken = (tokenHash) =>
  prisma.refreshToken.deleteMany({ where: { tokenHash } });

export const deleteAllRefreshTokensByUserId = (userId) =>
  prisma.refreshToken.deleteMany({ where: { userId } });
