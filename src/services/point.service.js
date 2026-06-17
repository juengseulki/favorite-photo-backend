import prisma from '../configs/prisma.js';
import pointRepository from '../repositories/point.repository.js';
import AppError from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const validatePositiveInteger = (value, fieldName) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR(`${fieldName}은 1 이상의 정수여야 합니다.`)
    );
  }
};

const getRandomBoxRemainingSeconds = (lastHistory) => {
  if (!lastHistory) return 0;

  const now = new Date();
  const nextAvailableAt = new Date(
    lastHistory.createdAt.getTime() + 60 * 60 * 1000
  );

  return Math.max(
    0,
    Math.ceil((nextAvailableAt.getTime() - now.getTime()) / 1000)
  );
};

export const getPointsService = async ({ userId, page, limit }) => {
  validatePositiveInteger(page, 'page');
  validatePositiveInteger(limit, 'limit');

  const safeLimit = Math.min(limit, 50);
  const skip = (page - 1) * safeLimit;

  const [points, totalCount] = await prisma.$transaction(async (tx) => {
    const items = await pointRepository.getPointHistories({
      userId,
      skip,
      limit: safeLimit,
      tx,
    });

    const count = await pointRepository.countPointHistories({
      userId,
      tx,
    });

    return [items, count];
  });

  const totalPages = Math.ceil(totalCount / safeLimit);
  const hasNextPage = page < totalPages;

  return {
    items: points,
    meta: {
      totalCount,
      page,
      limit: safeLimit,
      totalPages,
      hasNextPage,
    },
  };
};

export const usePoint = async ({
  userId,
  amount,
  reason = 'PURCHASE',
  description,
  tx,
}) => {
  validatePositiveInteger(Number(amount), 'amount');

  const point = await pointRepository.getPoint({
    userId,
    tx,
  });

  if (!point || point.balance < Number(amount)) {
    throw new AppError(ERROR_CODES.INSUFFICIENT_POINTS());
  }

  const updatedPoint = await pointRepository.decreasePoint({
    userId,
    amount,
    tx,
  });

  await pointRepository.createPointHistory({
    userId,
    amount: -Number(amount),
    reason,
    description,
    tx,
  });

  return updatedPoint;
};

export const addPoint = async ({
  userId,
  amount,
  reason = 'SALE',
  description,
  tx,
}) => {
  validatePositiveInteger(Number(amount), 'amount');

  const updatedPoint = await pointRepository.increasePoint({
    userId,
    amount,
    tx,
  });

  await pointRepository.createPointHistory({
    userId,
    amount: Number(amount),
    reason,
    description,
    tx,
  });

  return updatedPoint;
};

export const getRandomBoxStatusService = async (userId) => {
  const lastHistory = await pointRepository.getLastRandomBoxHistory({
    userId,
  });

  if (!lastHistory) {
    return {
      canOpen: true,
      nextAvailableAt: null,
      remainingSeconds: 0,
    };
  }

  const nextAvailableAt = new Date(
    lastHistory.createdAt.getTime() + 60 * 60 * 1000
  );

  const remainingSeconds = getRandomBoxRemainingSeconds(lastHistory);

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

  return await prisma.$transaction(async (tx) => {
    const lastHistory = await pointRepository.getLastRandomBoxHistory({
      userId,
      tx,
    });

    const remainingSeconds = getRandomBoxRemainingSeconds(lastHistory);

    if (remainingSeconds > 0) {
      throw new AppError(ERROR_CODES.RANDOM_BOX_COOLDOWN());
    }

    const MIN_POINT = 100;
    const MAX_POINT = 1000;

    const amount =
      Math.floor(Math.random() * (MAX_POINT - MIN_POINT + 1)) + MIN_POINT;

    const point = await pointRepository.upsertPointByRandomBox({
      userId,
      amount,
      tx,
    });

    await pointRepository.createPointHistory({
      userId,
      amount,
      reason: 'RANDOM_BOX',
      description: `랜덤박스 ${boxNumber}번 선택`,
      tx,
    });

    await pointRepository.createRandomBoxHistory({
      userId,
      tx,
    });

    return {
      selectedBox: boxNumber,
      amount,
      balance: point.balance,
    };
  });
};

const pointService = {
  getPointsService,
  usePoint,
  addPoint,
  getRandomBoxStatusService,
  openRandomBoxService,
};

export default pointService;
