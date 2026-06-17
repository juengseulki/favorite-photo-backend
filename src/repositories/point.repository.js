import prisma from '../configs/prisma.js';

const pointRepository = {
  getPoint: async ({ userId, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.point.findUnique({
      where: { userId },
    });
  },

  increasePoint: async ({ userId, amount, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.point.update({
      where: { userId },
      data: {
        balance: {
          increment: Number(amount),
        },
      },
    });
  },

  decreasePoint: async ({ userId, amount, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.point.update({
      where: { userId },
      data: {
        balance: {
          decrement: Number(amount),
        },
      },
    });
  },

  createPointHistory: async ({ userId, amount, reason, description, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.pointHistory.create({
      data: {
        userId,
        amount: Number(amount),
        reason,
        description,
      },
    });
  },

  getPointHistories: async ({ userId, skip, limit, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.pointHistory.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  countPointHistories: async ({ userId, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.pointHistory.count({
      where: { userId },
    });
  },

  getLastRandomBoxHistory: async ({ userId, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.randomBoxHistory.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  createRandomBoxHistory: async ({ userId, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.randomBoxHistory.create({
      data: { userId },
    });
  },

  upsertPointByRandomBox: async ({ userId, amount, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.point.upsert({
      where: { userId },
      update: {
        balance: {
          increment: Number(amount),
        },
      },
      create: {
        userId,
        balance: Number(amount),
      },
    });
  },
};

export default pointRepository;
