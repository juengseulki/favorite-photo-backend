import prisma from '../configs/prisma.js';

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
