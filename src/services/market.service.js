import { CardStatus, SaleStatus } from '@prisma/client';

import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import purchaseRepository from '../repositories/purchase.repository.js';
import purchaseItemRepository from '../repositories/purchaseItem.repository.js';
import saleRepository from '../repositories/sale.repository.js';
import saleItemRepository from '../repositories/saleItem.repository.js';
import cardCopyRepository from '../repositories/cardCopy.repository.js';

const parsePriceCursor = (cursor) => {
  if (!cursor) return null;

  const [price, id] = cursor.split('_').map(Number);

  if (!Number.isInteger(price) || !Number.isInteger(id)) return null;

  return { price, id };
};

export const getMarketCardsService = async ({
  cursor,
  limit = 15,
  keyword,
  grade,
  genre,
  sort = 'latest',
  saleStatus,
}) => {
  const take = Number(limit);

  const photoCardWhere = {
    ...(keyword && {
      name: {
        contains: keyword,
        mode: 'insensitive',
      },
    }),
    ...(grade && { grade }),
    ...(genre && { genre }),
  };

  let saleStatusWhere = {
    status: {
      in: [SaleStatus.ON_SALE, SaleStatus.SOLD_OUT],
    },
  };

  if (saleStatus === 'onSale') {
    saleStatusWhere = {
      status: SaleStatus.ON_SALE,
      saleItems: {
        some: {
          purchaseItem: null,
        },
      },
    };
  }

  if (saleStatus === 'soldOut') {
    saleStatusWhere = {
      OR: [
        { status: SaleStatus.SOLD_OUT },
        {
          saleItems: {
            none: {
              purchaseItem: null,
            },
          },
        },
      ],
    };
  }

  const where = {
    ...saleStatusWhere,
    photoCard: photoCardWhere,
  };

  let orderBy = [{ id: 'desc' }];
  let cursorWhere = {};

  if (sort === 'priceAsc') {
    orderBy = [{ price: 'asc' }, { id: 'desc' }];
  }

  if (sort === 'priceDesc') {
    orderBy = [{ price: 'desc' }, { id: 'desc' }];
  }

  if (cursor) {
    if (sort === 'priceAsc' || sort === 'priceDesc') {
      const parsedCursor = parsePriceCursor(cursor);

      if (!parsedCursor) {
        throw new AppError(
          ERROR_CODES.INVALID_FORMAT('올바르지 않은 cursor 값입니다.')
        );
      }

      cursorWhere = {
        OR: [
          {
            price: {
              [sort === 'priceAsc' ? 'gt' : 'lt']: parsedCursor.price,
            },
          },
          {
            price: parsedCursor.price,
            id: {
              lt: parsedCursor.id,
            },
          },
        ],
      };
    } else {
      const parsedCursor = Number(cursor);

      if (!Number.isInteger(parsedCursor)) {
        throw new AppError(
          ERROR_CODES.INVALID_FORMAT('올바르지 않은 cursor 값입니다.')
        );
      }

      cursorWhere = {
        id: {
          lt: parsedCursor,
        },
      };
    }
  }

  const countSales = await prisma.sale.findMany({
    where,
    select: {
      status: true,
      photoCard: {
        select: {
          grade: true,
          genre: true,
        },
      },
      _count: {
        select: {
          saleItems: {
            where: {
              purchaseItem: null,
            },
          },
        },
      },
    },
  });

  const counts = countSales.reduce(
    (acc, sale) => {
      const grade = sale.photoCard.grade;
      const genre = sale.photoCard.genre;
      const remainingQuantity = sale._count.saleItems;
      const isSoldOut =
        sale.status === SaleStatus.SOLD_OUT || remainingQuantity === 0;

      acc.grades[grade] = (acc.grades[grade] ?? 0) + 1;
      acc.genres[genre] = (acc.genres[genre] ?? 0) + 1;

      if (isSoldOut) {
        acc.saleStatuses.soldOut += 1;
      } else {
        acc.saleStatuses.onSale += 1;
      }

      return acc;
    },
    {
      grades: {},
      genres: {},
      saleStatuses: {
        onSale: 0,
        soldOut: 0,
      },
    }
  );

  const sales = await prisma.sale.findMany({
    where: {
      ...where,
      ...cursorWhere,
    },
    take: take + 1,
    orderBy,
    select: {
      id: true,
      price: true,
      status: true,
      createdAt: true,
      seller: {
        select: {
          nickname: true,
        },
      },
      photoCard: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          grade: true,
          genre: true,
          totalQuantity: true,
          creator: {
            select: {
              nickname: true,
            },
          },
        },
      },
      _count: {
        select: {
          saleItems: {
            where: {
              purchaseItem: null,
            },
          },
        },
      },
    },
  });

  const hasNextPage = sales.length > take;
  const currentSales = hasNextPage ? sales.slice(0, take) : sales;
  const lastSale = currentSales[currentSales.length - 1];

  const nextCursor = hasNextPage
    ? sort === 'priceAsc' || sort === 'priceDesc'
      ? `${lastSale.price}_${lastSale.id}`
      : String(lastSale.id)
    : null;

  const cards = currentSales.map((sale) => {
    const remainingQuantity = sale._count.saleItems;

    return {
      saleId: sale.id,
      cardId: sale.photoCard.id,
      name: sale.photoCard.name,
      imageUrl: sale.photoCard.imageUrl,
      grade: sale.photoCard.grade,
      genre: sale.photoCard.genre,
      price: sale.price,
      status: sale.status,
      isSoldOut: sale.status === SaleStatus.SOLD_OUT || remainingQuantity === 0,
      remainingQuantity,
      totalQuantity: sale.photoCard.totalQuantity,
      sellerNickname: sale.seller.nickname,
      creatorNickname: sale.photoCard.creator.nickname,
      createdAt: sale.createdAt,
    };
  });

  return {
    cards,
    nextCursor,
    hasNextPage,
    counts,
  };
};

export const getMarketCardDetailService = async (saleId) => {
  const parsedSaleId = Number(saleId);

  if (!Number.isInteger(parsedSaleId) || parsedSaleId <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('saleId가 올바르지 않습니다.')
    );
  }

  const sale = await prisma.sale.findUnique({
    where: {
      id: parsedSaleId,
    },
    select: {
      id: true,
      price: true,
      status: true,
      createdAt: true,
      exchangeGrade: true,
      exchangeGenre: true,
      exchangeDescription: true,
      seller: {
        select: {
          nickname: true,
        },
      },
      photoCard: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          grade: true,
          genre: true,
          totalQuantity: true,
          creator: {
            select: {
              nickname: true,
            },
          },
        },
      },
      _count: {
        select: {
          saleItems: {
            where: {
              purchaseItem: null,
            },
          },
        },
      },
    },
  });

  if (!sale) {
    throw new AppError(ERROR_CODES.SALE_NOT_FOUND());
  }

  const remainingQuantity = sale._count.saleItems;

  return {
    saleId: sale.id,
    cardId: sale.photoCard.id,
    name: sale.photoCard.name,
    description: sale.photoCard.description,
    imageUrl: sale.photoCard.imageUrl,
    grade: sale.photoCard.grade,
    genre: sale.photoCard.genre,
    price: sale.price,
    status: sale.status,
    isSoldOut: sale.status === SaleStatus.SOLD_OUT || remainingQuantity === 0,
    remainingQuantity,
    totalQuantity: sale.photoCard.totalQuantity,
    sellerNickname: sale.seller.nickname,
    creatorNickname: sale.photoCard.creator.nickname,
    exchangeGrade: sale.exchangeGrade,
    exchangeGenre: sale.exchangeGenre,
    exchangeDescription: sale.exchangeDescription,
    createdAt: sale.createdAt,
  };
};

export const purchaseCardsService = async ({ saleId, buyerId, quantity }) => {
  const parsedSaleId = Number(saleId);
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedSaleId) || parsedSaleId <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('saleId가 올바르지 않습니다.')
    );
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('수량은 1 이상이어야 합니다.')
    );
  }

  return await prisma.$transaction(async (tx) => {
    const sale = await saleRepository.getSale({
      saleId: parsedSaleId,
      tx,
    });

    if (!sale) {
      throw new AppError(ERROR_CODES.SALE_NOT_FOUND());
    }

    if (sale.status !== SaleStatus.ON_SALE) {
      throw new AppError(ERROR_CODES.SALE_NOT_AVAILABLE());
    }

    if (buyerId === sale.sellerId) {
      throw new AppError(ERROR_CODES.CANNOT_BUY_OWN_CARD());
    }

    const totalPrice = parsedQuantity * sale.price;

    const buyerPoint = await tx.point.findUnique({
      where: {
        userId: buyerId,
      },
      select: {
        balance: true,
      },
    });

    if (!buyerPoint || buyerPoint.balance < totalPrice) {
      throw new AppError(ERROR_CODES.INSUFFICIENT_POINTS());
    }

    const saleItems = await saleItemRepository.getSaleItems({
      saleId: parsedSaleId,
      quantity: parsedQuantity,
      status: CardStatus.ON_SALE,
      userId: sale.sellerId,
      tx,
    });

    if (saleItems.length < parsedQuantity) {
      throw new AppError(
        ERROR_CODES.CARD_COPY_NOT_ENOUGH(
          '재고가 부족하거나, 다른 사용자가 구매 중입니다.'
        )
      );
    }

    const saleItemIds = saleItems.map((item) => item.id);
    const cardCopyIds = saleItems.map((item) => item.cardCopyId);

    const updatedCards = await cardCopyRepository.switchCardsStatus({
      userId: sale.sellerId,
      cardIds: cardCopyIds,
      prevStatus: CardStatus.ON_SALE,
      newStatus: CardStatus.OWNED,
      tx,
    });

    if (updatedCards.count !== parsedQuantity) {
      throw new AppError(
        ERROR_CODES.CONCURRENCY_ERROR(
          '다수 사용자 구매로 충돌이 발생하여 구매에 실패했습니다.'
        )
      );
    }

    await cardCopyRepository.updateCardCopiesOwnerId({
      cardsIds: cardCopyIds,
      ownerId: buyerId,
      tx,
    });

    const purchase = await purchaseRepository.createPurchase({
      buyerId,
      saleId: parsedSaleId,
      quantity: parsedQuantity,
      totalPrice,
      tx,
    });

    await purchaseItemRepository.createPurchaseItems({
      purchaseId: purchase.id,
      saleItemsIds: saleItemIds,
      tx,
    });

    const remainedQuantity =
      await saleItemRepository.countActiveSaleItemsForSale({
        saleId: parsedSaleId,
        userId: sale.sellerId,
        tx,
      });

    if (remainedQuantity === 0) {
      await saleRepository.setStatus({
        saleId: parsedSaleId,
        status: SaleStatus.SOLD_OUT,
        tx,
      });
    }

    await tx.point.update({
      where: {
        userId: buyerId,
      },
      data: {
        balance: {
          decrement: totalPrice,
        },
      },
    });

    await tx.pointHistory.create({
      data: {
        userId: buyerId,
        amount: -totalPrice,
        reason: 'PURCHASE',
        description: '포토카드 구매',
      },
    });

    await tx.point.update({
      where: {
        userId: sale.sellerId,
      },
      data: {
        balance: {
          increment: totalPrice,
        },
      },
    });

    await tx.pointHistory.create({
      data: {
        userId: sale.sellerId,
        amount: totalPrice,
        reason: 'SALE',
        description: '포토카드 판매',
      },
    });

    return await purchaseRepository.getPurchase({
      id: purchase.id,
      tx,
    });
  });
};
