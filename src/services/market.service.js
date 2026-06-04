import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';

// 마켓 판매 카드 목록 조회
export const getMarketCardsService = async ({ cursor, limit }) => {
  const where = {
    status: {
      in: ['ON_SALE', 'SOLD_OUT'],
    },
  };

  const sales = await prisma.sale.findMany({
    where,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),
    take: limit + 1,
    orderBy: {
      id: 'desc',
    },
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
      saleItems: {
        where: {
          purchaseItem: null,
        },
        select: {
          id: true,
        },
      },
    },
  });

  const hasNextPage = sales.length > limit;
  const currentSales = hasNextPage ? sales.slice(0, limit) : sales;
  const nextCursor = hasNextPage
    ? currentSales[currentSales.length - 1].id
    : null;

  const cards = currentSales.map((sale) => {
    const remainingQuantity = sale.saleItems.length;

    return {
      saleId: sale.id,
      cardId: sale.photoCard.id,
      name: sale.photoCard.name,
      imageUrl: sale.photoCard.imageUrl,
      grade: sale.photoCard.grade,
      genre: sale.photoCard.genre,
      price: sale.price,
      status: sale.status,
      isSoldOut: sale.status === 'SOLD_OUT' || remainingQuantity === 0,
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
  };
};

// 마켓 판매 카드 상세 조회
export const getMarketCardDetailService = async (saleId) => {
  const sale = await prisma.sale.findUnique({
    where: {
      id: saleId,
    },
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
      saleItems: {
        where: {
          purchaseItem: null,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!sale) {
    throw new AppError(404, 'SALE_NOT_FOUND', '판매 카드를 찾을 수 없습니다.');
  }

  const remainingQuantity = sale.saleItems.length;

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
    isSoldOut: sale.status === 'SOLD_OUT' || remainingQuantity === 0,
    remainingQuantity,
    totalQuantity: sale.photoCard.totalQuantity,
    sellerNickname: sale.seller.nickname,
    creatorNickname: sale.photoCard.creator.nickname,
    createdAt: sale.createdAt,
  };
};
