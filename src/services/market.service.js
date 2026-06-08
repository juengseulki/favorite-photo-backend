import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';
import purchaseRepository from '../repositories/purchase.repository.js';
import purchaseItemRepository from '../repositories/purchaseItem.repository.js';
import saleRepository from '../repositories/sale.repository.js';
import saleItemRepository from '../repositories/saleItem.repository.js';
import cardCopyRepository from '../repositories/cardCopy.repository.js';

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
export const purchaseCardsService = async ({ saleId, buyerId, quantity }) => {
  return await prisma.$transaction(async (tx) => {
    //1. 구매 조건 체크 (수량, 포인트가 충분한지)
    //가장 먼저 체크하여, 불필요한 코드 실행을 줄인다.
    const remainedQuantity =
      await saleItemRepository.countActiveSaleItemsForSale(saleId, tx);
    //1-1. [구매 수량 > 판매 수량] 이면 에러
    if (quantity > remainedQuantity) {
      //TODO: 에러 상수 넣기
      throw new AppError(
        400,
        'CARD_NOT_ENOUGH',
        '판매 가능한 수량이, 구매 수량보다 적습니다.'
      );
    }
    //1-2. [구매 수량 = 판매 수량]이면 품절 처리
    if (quantity === remainedQuantity) {
      await saleRepository.setStatus(saleId, 'SOLD_OUT', tx);
    }
    //1-3. 구매자의 포인트가 충분한지 확인
    //TODO: 추후 point repository 만들어진 후 알맞게 수정 필요. (현재는 임시로 아무거나 적어둔 것)
    const buyerPoint = await pointRepository.getPoint({ userId: buyerId });
    if (buyerPoint < totalPrice) {
      //TODO: 에러 상수 넣기
      throw new AppError(400, 'INSUFFICIENT_POINTS', '포인트가 부족합니다.');
    }

    //2. 구매 기록하기
    //2-1. Purchase 생성
    const sale = await saleRepository.getSale(saleId, tx);
    const price = sale.price;
    const totalPrice = quantity * price; //point 증/감 쪽에서도 사용
    const purchase = await purchaseRepository.createPurchase({
      buyerId,
      saleId,
      quantity,
      totalPrice,
      tx,
    });
    //2-2. PurchaseItems 생성
    //필요한 개수(quantity)만큼 saleItems 가져오기
    const saleItems = await saleItemRepository.getSaleItems({
      saleId: sale.id,
      quantity,
      status: 'ON_SALE',
      userId: sale.sellerId,
      tx,
    });
    //가져온 saleItems에서 id만 추출하기
    const saleItemsIds = saleItems.map((item) => item.id);
    //추출한 ids를 넣어 purchaseItems 생성하기
    const purchaseItems = await purchaseItemRepository.createPurchaseItems({
      purchaseId: purchase.id,
      saleItemsIds,
      tx,
    });
    //2-3. SaleItem - CardCopy의 소유 정보 변경
    const cardCopiesIds = saleItems.map((item) => item.cardCopyId);
    //ownerId를 구매자로, 상태를 OWNED로.
    //원래는 아래 두 코드의 순서가 반대였는데, 정합성 문제로 바꿈. (AI가 검토하여 제안해준 사항) (그러나 아직 완벽히 이해하지 못했다.)
    await cardCopyRepository.switchCardsStatus({
      userId: sale.sellerId, //원래 buyerId로 했었음.
      cardIds: cardCopiesIds,
      prevStatus: 'ON_SALE',
      newStatus: 'OWNED',
      tx,
    });
    await cardCopyRepository.updateCardCopiesOwnerId({
      cardCopiesIds,
      ownerId: buyerId,
      tx,
    });

    //3. 포인트 감소&증가
    //TODO: 추후 point repository 만들어진 후 알맞게 수정 필요. (현재는 임시로 아무거나 적어둔 것)
    //3-1. 구매 User의 포인트를 Price 만큼 감소
    await pointRepository.decreasePoints({
      userId: buyerId,
      price: totalPrice,
      tx,
    });
    //3-2. 판매 User의 포인트를 Price 만큼 증가
    await pointRepository.increasePoints({
      userId: sale.sellerId,
      price: totalPrice,
      tx,
    });

    return await purchaseRepository.getPurchase({ id: purchase.id, tx });
  });
};
