import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';

const parsePriceCursor = (cursor) => {
  if (!cursor) return null;

  const [price, id] = cursor.split('_').map(Number);

  if (!Number.isInteger(price) || !Number.isInteger(id)) {
    return null;
  }

  return { price, id };
};

// 마켓 판매 카드 목록 조회
export const getMarketCardsService = async ({
  cursor,
  limit,
  keyword,
  grade,
  genre,
  sort,
}) => {
  const where = {
    status: {
      in: ['ON_SALE', 'SOLD_OUT'],
    },
    photoCard: {
      ...(keyword && {
        name: {
          contains: keyword,
          mode: 'insensitive',
        },
      }),
      ...(grade && { grade }),
      ...(genre && { genre }),
    },
  };

  let orderBy;

  switch (sort) {
    case 'priceAsc':
      orderBy = [{ price: 'asc' }, { id: 'desc' }];
      break;

    case 'priceDesc':
      orderBy = [{ price: 'desc' }, { id: 'desc' }];
      break;

    case 'latest':
    default:
      orderBy = [{ id: 'desc' }];
      break;
  }

  let cursorWhere = {};

  if (cursor) {
    if (sort === 'priceAsc') {
      const parsedCursor = parsePriceCursor(cursor);

      if (parsedCursor) {
        cursorWhere = {
          OR: [
            {
              price: {
                gt: parsedCursor.price,
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
      }
    } else if (sort === 'priceDesc') {
      const parsedCursor = parsePriceCursor(cursor);

      if (parsedCursor) {
        cursorWhere = {
          OR: [
            {
              price: {
                lt: parsedCursor.price,
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
      }
    } else {
      cursorWhere = {
        id: {
          lt: Number(cursor),
        },
      };
    }
  }

  const sales = await prisma.sale.findMany({
    where: {
      ...where,
      ...cursorWhere,
    },
    take: limit + 1,
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
  const lastSale = currentSales[currentSales.length - 1];

  const nextCursor = hasNextPage
    ? sort === 'priceAsc' || sort === 'priceDesc'
      ? `${lastSale.price}_${lastSale.id}`
      : String(lastSale.id)
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

//카드 구매
export const purchaseCardsService = async ({ saleId, userId, quantity }) => {
  await prisma.$transaction(async (tx) => {});
};
