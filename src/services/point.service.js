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
