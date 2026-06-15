import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const getPointsService = async ({ userId, page, limit }) => {
  if (!Number.isInteger(page) || page < 1) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('page는 1 이상의 정수여야 합니다.')
    );
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('limit은 1 이상의 정수여야 합니다.')
    );
  }

  const skip = (page - 1) * limit;

  const [points, totalCount] = await prisma.$transaction([
    prisma.pointHistory.findMany({
      where: {
        userId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.pointHistory.count({
      where: {
        userId,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;

  return {
    items: points,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage,
    },
  };
};

export const getRandomBoxStatusService = async (userId) => {
  const lastHistory = await prisma.randomBoxHistory.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

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

  if (![1, 2, 3].includes(boxNumber)) {
    throw new AppError(ERROR_CODES.RANDOM_BOX_OPEN_FAILED());
  }

  const result = await prisma.$transaction(async (tx) => {
    const lastHistory = await tx.randomBoxHistory.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
        throw new AppError(ERROR_CODES.RANDOM_BOX_COOLDOWN());
      }
    }

    const MIN_POINT = 100;
    const MAX_POINT = 1000;

    const amount =
      Math.floor(Math.random() * (MAX_POINT - MIN_POINT + 1)) + MIN_POINT;

    const point = await tx.point.upsert({
      where: {
        userId,
      },
      update: {
        balance: {
          increment: amount,
        },
      },
      create: {
        userId,
        balance: amount,
      },
    });

    await tx.pointHistory.create({
      data: {
        userId,
        amount,
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
      amount,
      balance: point.balance,
    };
  });

  return result;
};
