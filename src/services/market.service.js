import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';
import purchaseRepository from '../repositories/purchase.repository.js';
import purchaseItemRepository from '../repositories/purchaseItem.repository.js';
import saleRepository from '../repositories/sale.repository.js';
import saleItemRepository from '../repositories/saleItem.repository.js';
import cardCopyRepository from '../repositories/cardCopy.repository.js';
import { CardStatus, SaleStatus } from '@prisma/client';

const parsePriceCursor = (cursor) => {
  if (!cursor) return null;

  const parts = cursor.split('_');

  if (parts.length !== 2) {
    return null;
  }

  const [price, id] = parts.map(Number);

  if (
    !Number.isInteger(price) ||
    !Number.isInteger(id) ||
    price < 0 ||
    id <= 0
  ) {
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
    if (sort === 'priceAsc' || sort === 'priceDesc') {
      const parsedCursor = parsePriceCursor(cursor);

      if (!parsedCursor) {
        throw new AppError(
          400,
          'INVALID_CURSOR',
          '올바르지 않은 cursor 값입니다.'
        );
      }

      const priceCondition = sort === 'priceAsc' ? 'gt' : 'lt';

      cursorWhere = {
        OR: [
          {
            price: {
              [priceCondition]: parsedCursor.price,
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
          400,
          'INVALID_CURSOR',
          '올바르지 않은 cursor 값입니다.'
        );
      }

      cursorWhere = {
        id: {
          lt: parsedCursor,
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

  const hasNextPage = sales.length > limit;
  const currentSales = hasNextPage ? sales.slice(0, limit) : sales;
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
    throw new AppError(404, 'SALE_NOT_FOUND', '판매 카드를 찾을 수 없습니다.');
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
    //1. 구매 조건 체크

    //판매가 존재하는지 체크
    const isExist = await saleRepository.isExist({ saleId, tx });
    if (!isExist) {
      throw new AppError(ERROR_CODES.SALE_NOT_FOUND());
    }
    //유효한 판매(Sale)인지 체크
    const isOnSale = await saleRepository.isOnSale({ saleId, tx });
    if (!isOnSale) {
      throw new AppError(ERROR_CODES.SALE_NOT_AVAILABLE());
    }

    const sale = await saleRepository.getSale({ saleId, tx });
    const price = sale.price;
    const totalPrice = quantity * price; //point 증/감 쪽에서도 사용

    //본인 판매글 구매 방지 : 구매자=판매자 인지 체크
    if (buyerId === sale.sellerId) {
      throw new AppError(ERROR_CODES.CANNOT_BUY_OWN_CARD());
    }

    //구매자의 포인트가 충분한지 확인
    //TODO: 추후 point repository 만들어진 후 알맞게 수정 필요. (현재는 임시로 아무거나 적어둔 것)
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

    //2. 구매 기록하기
    //2-1. 가능한 SaleItems를 먼저 가져오기.
    const saleItems = await saleItemRepository.getSaleItems({
      saleId: sale.id,
      quantity,
      status: CardStatus.ON_SALE,
      userId: sale.sellerId,
      tx,
    });
    if (saleItems.length < quantity) {
      throw new AppError(
        ERROR_CODES.CARD_COPY_NOT_ENOUGH(
          '재고가 부족하거나, 다른 사용자가 구매 중입니다.'
        )
      );
    }
    //가져온 saleItems에서 saleItem의 id, cardCopy의 id들을 추출하기
    const saleItemsIds = saleItems.map((item) => item.id);
    const cardCopiesIds = saleItems.map((item) => item.cardCopyId);

    //2-2. SaleItem - CardCopy의 소유 정보 변경
    //실제로 구매가 가능한 상태라면 CardCopy의 소유 정보를 변경한다.
    // 그리고 그 후에 Purchase를 만들도록 하여,
    // 동시 요청 문제로, Purchase가 만들어진 상황에 cardcopy 업데이트 충돌이 되는 문제를 예방한다.

    //ownerId를 구매자로, 상태를 OWNED로.
    //원래는 아래 두 코드의 순서가 반대였는데, 정합성 문제로 바꿈. (AI가 검토하여 제안해준 사항) (그러나 아직 완벽히 이해하지 못했다.)
    const updatedCards = await cardCopyRepository.switchCardsStatus({
      userId: sale.sellerId, //원래 buyerId로 했었음.
      cardIds: cardCopiesIds,
      prevStatus: CardStatus.ON_SALE,
      newStatus: CardStatus.OWNED,
      tx,
    });
    if (updatedCards.count !== quantity) {
      throw new AppError(
        ERROR_CODES.CONCURRENCY_ERROR(
          '다수 사용자 구매로 충돌이 발생하여 구매에 실패했습니다.'
        )
      );
    }
    await cardCopyRepository.updateCardCopiesOwnerId({
      cardsIds: cardCopiesIds,
      ownerId: buyerId,
      tx,
    });

    //2-3. Purchase 생성
    const purchase = await purchaseRepository.createPurchase({
      buyerId,
      saleId,
      quantity,
      totalPrice,
      tx,
    });

    //2-4. PurchaseItems 생성
    //추출한 ids를 넣어 purchaseItems 생성하기
    const purchaseItems = await purchaseItemRepository.createPurchaseItems({
      purchaseId: purchase.id,
      saleItemsIds,
      tx,
    });

    //품절 처리 : 구매가 끝난 뒤 품절 처리하는 것이 자연스러운 흐름이므로, 위치를 여기로 수정.
    const remainedQuantity =
      await saleItemRepository.countActiveSaleItemsForSale({
        saleId,
        userId: sale.sellerId, //cardCopy의 보유자가 판매자가 맞는지 조건 체크 추가
        tx,
      });
    //판매 수량이 0이면 품절 처리
    if (remainedQuantity === 0) {
      await saleRepository.setStatus({
        saleId,
        status: SaleStatus.SOLD_OUT,
        tx,
      });
    }

    //3. 포인트 감소&증가
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

    return await purchaseRepository.getPurchase({ id: purchase.id, tx });
  });
};
