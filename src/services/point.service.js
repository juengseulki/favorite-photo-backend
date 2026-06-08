import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';

export const getPointsService = async (userId) => {
  const points = await prisma.pointHistory.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    items: points,
    meta: { totalCount: points.length },
  };
};

export const getRandomBoxStatusService = async (userId) => {
  const lastHistory = await prisma.randomBoxHistory.findFirst({
    where: {
      userId,
    },
    orderBy: { createdAt: 'desc' },
  });

  // 기록이 없을 경우 (포인트 획득 가능)
  if (!lastHistory) {
    return {
      canOpen: true,
      nextAvailableAt: null,
      remainingSeconds: 0,
    };
  }

  const now = new Date();

  const nextAvailableAt = new Date(
    lastHistory.createdAt.getTime() + 60 * 60 * 1000
  );

  const remainingSeconds = Math.max(
    0,
    Math.ceil((nextAvailableAt.getTime() - now.getTime()) / 1000)
  );

  return {
    canOpen: remainingSeconds === 0,
    nextAvailableAt,
    remainingSeconds,
  };
};

export const openRandomBoxService = async (userId, selectedBox) => {
  const boxNumber = Number(selectedBox);

  if (!boxNumber || ![1, 2, 3].includes(Number(boxNumber))) {
    throw new AppError('선택한 랜덤박스 값이 올바르지 않습니다.', 400);
  }

  const lastHistory = await prisma.randomBoxHistory.findFirst({
    where: {
      userId,
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();

  if (lastHistory) {
    const nextAvailableAt = new Date(
      lastHistory.createdAt.getTime() + 60 * 60 * 1000
    );

    const remainingSeconds = Math.max(
      0,
      Math.ceil((nextAvailableAt.getTime() - now.getTime()) / 1000)
    );

    if (remainingSeconds > 0) {
      throw new AppError('아직 랜덤박스를 열 수 없습니다.', 400);
    }
  }

  const MIN_POINT = 100;
  const MAX_POINT = 1000;

  const earnedPoint =
    Math.floor(Math.random() * (MAX_POINT - MIN_POINT + 1)) + MIN_POINT;

  const result = await prisma.$transaction(async (tx) => {
    const point = await tx.point.update({
      where: { userId },
      data: {
        balance: {
          increment: earnedPoint,
        },
      },
    });

    await tx.pointHistory.create({
      data: {
        userId,
        amount: earnedPoint,
        reason: 'RANDOM_BOX',
        description: `랜덤박스 ${boxNumber}번 선택`,
      },
    });

    await tx.randomBoxHistory.create({
      data: {
        userId,
      },
    });

    return {
      selectedBox: boxNumber,
      earnedPoint,
      balance: point.balance,
    };
  });

  return result;
};
