import { CardStatus, ExchangeStatus, SaleStatus } from '@prisma/client';

import cardCopyRepository from '../repositories/cardCopy.repository.js';
import exchangeProposalRepository from '../repositories/exchangeProposal.repository.js';
import saleItemRepository from '../repositories/saleItem.repository.js';
import saleRepository from '../repositories/sale.repository.js';
import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const createSale = async ({
  photoCardId,
  price,
  quantity,
  exchangeGrade,
  exchangeGenre,
  exchangeDescription,
  userId,
}) => {
  const parsedPhotoCardId = Number(photoCardId);
  const parsedPrice = Number(price);
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedPhotoCardId) || parsedPhotoCardId <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('photoCardId가 올바르지 않습니다.')
    );
  }

  if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('가격은 1 이상이어야 합니다.')
    );
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('수량은 1개 이상이어야 합니다.')
    );
  }

  return await prisma.$transaction(async (tx) => {
    const availableCardCopies = await cardCopyRepository.getCardCopys({
      quantity: parsedQuantity,
      photoCardId: parsedPhotoCardId,
      userId,
      status: CardStatus.OWNED,
      tx,
    });

    if (parsedQuantity > availableCardCopies.length) {
      throw new AppError(
        ERROR_CODES.CARD_COPY_NOT_ENOUGH('요청 수량 대비 카드가 부족합니다.')
      );
    }

    const sale = await saleRepository.createSale({
      userId,
      photoCardId: parsedPhotoCardId,
      price: parsedPrice,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
      tx,
    });

    const { saleItems, onSaleCards } = await createSaleItemsAndCards({
      photoCardId: parsedPhotoCardId,
      quantity: parsedQuantity,
      saleId: sale.id,
      userId,
      tx,
    });

    return {
      sale,
      saleItems,
      cardCopies: onSaleCards,
    };
  });
};

export const modifySale = async (saleId, photoCardId, userId, data) => {
  const parsedSaleId = Number(saleId);
  const parsedPhotoCardId = Number(photoCardId);

  if (!Number.isInteger(parsedSaleId) || parsedSaleId <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('saleId가 올바르지 않습니다.')
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

    if (sale.sellerId !== userId) {
      throw new AppError(ERROR_CODES.NOT_SALE_OWNER());
    }

    if (sale.status !== SaleStatus.ON_SALE) {
      throw new AppError(ERROR_CODES.SALE_ALREADY_SOLD_OUT());
    }

    const {
      quantity,
      price,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
    } = data;

    const modifyData = {};

    if (price !== undefined) {
      const parsedPrice = Number(price);

      if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR('가격은 1 이상이어야 합니다.')
        );
      }

      modifyData.price = parsedPrice;
    }

    if (exchangeGrade !== undefined) modifyData.exchangeGrade = exchangeGrade;
    if (exchangeGenre !== undefined) modifyData.exchangeGenre = exchangeGenre;
    if (exchangeDescription !== undefined) {
      modifyData.exchangeDescription = exchangeDescription;
    }

    if (Object.keys(modifyData).length > 0) {
      await saleRepository.modifySale({
        saleId: parsedSaleId,
        data: modifyData,
        tx,
      });
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR('수량은 1개 이상이어야 합니다.')
        );
      }

      const prevQuantity = await saleItemRepository.countActiveSaleItemsForSale(
        {
          saleId: parsedSaleId,
          userId,
          tx,
        }
      );

      if (parsedQuantity > prevQuantity) {
        const addCount = parsedQuantity - prevQuantity;

        const usedSaleItems = await saleItemRepository.getSaleItems({
          saleId: parsedSaleId,
          status: CardStatus.OWNED,
          userId,
          tx,
        });

        const usedCardCopyIds = usedSaleItems
          .map((item) => item.cardCopyId)
          .slice(0, addCount);

        const remainedCount = addCount - usedCardCopyIds.length;

        if (usedCardCopyIds.length > 0) {
          await cardCopyRepository.switchCardsStatus({
            userId,
            cardIds: usedCardCopyIds,
            prevStatus: CardStatus.OWNED,
            newStatus: CardStatus.ON_SALE,
            tx,
          });
        }

        if (remainedCount > 0) {
          const availableCards = await cardCopyRepository.getCardCopys({
            quantity: remainedCount,
            photoCardId: Number.isInteger(parsedPhotoCardId)
              ? parsedPhotoCardId
              : sale.photoCardId,
            userId,
            status: CardStatus.OWNED,
            tx,
          });

          if (remainedCount > availableCards.length) {
            throw new AppError(
              ERROR_CODES.CARD_COPY_NOT_ENOUGH(
                '요청 수량 대비 카드가 부족합니다.'
              )
            );
          }

          await createSaleItemsAndCards({
            photoCardId: Number.isInteger(parsedPhotoCardId)
              ? parsedPhotoCardId
              : sale.photoCardId,
            quantity: remainedCount,
            saleId: parsedSaleId,
            userId,
            tx,
          });
        }
      }

      if (parsedQuantity < prevQuantity) {
        const subCount = prevQuantity - parsedQuantity;

        const saleItems = await saleItemRepository.getSaleItems({
          saleId: parsedSaleId,
          quantity: subCount,
          status: CardStatus.ON_SALE,
          userId,
          tx,
        });

        const cardCopyIds = saleItems.map((item) => item.cardCopyId);

        if (cardCopyIds.length > 0) {
          await cardCopyRepository.switchCardsStatus({
            userId,
            cardIds: cardCopyIds,
            prevStatus: CardStatus.ON_SALE,
            newStatus: CardStatus.OWNED,
            tx,
          });
        }
      }
    }

    return await saleRepository.getSale({
      saleId: parsedSaleId,
      tx,
    });
  });
};

export const cancelSale = async (saleId, userId) => {
  const parsedSaleId = Number(saleId);

  if (!Number.isInteger(parsedSaleId) || parsedSaleId <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR('saleId가 올바르지 않습니다.')
    );
  }

  await prisma.$transaction(async (tx) => {
    const sale = await saleRepository.getSale({
      saleId: parsedSaleId,
      tx,
    });

    if (!sale) {
      throw new AppError(ERROR_CODES.SALE_NOT_FOUND());
    }

    if (sale.sellerId !== userId) {
      throw new AppError(
        ERROR_CODES.NOT_SALE_OWNER('판매자만 취소할 수 있습니다.')
      );
    }

    if (sale.status !== SaleStatus.ON_SALE) {
      throw new AppError(ERROR_CODES.SALE_ALREADY_SOLD_OUT());
    }

    const saleItems = await saleItemRepository.getSaleItems({
      saleId: parsedSaleId,
      status: CardStatus.ON_SALE,
      userId,
      tx,
    });

    const cardCopyIds = saleItems.map((item) => item.cardCopyId);

    if (cardCopyIds.length > 0) {
      await cardCopyRepository.switchCardsStatus({
        userId,
        cardIds: cardCopyIds,
        prevStatus: CardStatus.ON_SALE,
        newStatus: CardStatus.OWNED,
        tx,
      });
    }

    const exchangeProposals =
      await exchangeProposalRepository.getExchangeProposal({
        saleId: parsedSaleId,
        tx,
      });

    const exchangeProposalIds = exchangeProposals.map(
      (proposal) => proposal.id
    );

    if (exchangeProposalIds.length > 0) {
      await exchangeProposalRepository.setProposalsStatus({
        ids: exchangeProposalIds,
        prevStatus: ExchangeStatus.PENDING,
        newStatus: ExchangeStatus.CANCELED,
        tx,
      });
    }

    await saleRepository.cancelSale({
      saleId: parsedSaleId,
      tx,
    });
  });
};

const createSaleItemsAndCards = async ({
  photoCardId,
  quantity,
  saleId,
  userId,
  tx,
}) => {
  const availableCards = await cardCopyRepository.getCardCopys({
    quantity,
    photoCardId,
    userId,
    status: CardStatus.OWNED,
    tx,
  });

  const availableCardIds = availableCards.map((card) => card.id);

  if (availableCardIds.length < quantity) {
    throw new AppError(
      ERROR_CODES.CARD_COPY_NOT_ENOUGH('요청 수량 대비 카드가 부족합니다.')
    );
  }

  const saleItemsData = availableCardIds.map((cardCopyId) => ({
    saleId,
    cardCopyId,
  }));

  const saleItems = await saleItemRepository.createSaleItems({
    datas: saleItemsData,
    tx,
  });

  const onSaleCards = await cardCopyRepository.switchCardsStatus({
    userId,
    cardIds: availableCardIds,
    prevStatus: CardStatus.OWNED,
    newStatus: CardStatus.ON_SALE,
    tx,
  });

  if (onSaleCards.count !== quantity) {
    throw new AppError(
      ERROR_CODES.CONCURRENCY_ERROR('카드 상태 변경 중 충돌이 발생했습니다.')
    );
  }

  return { saleItems, onSaleCards };
};

const saleService = { createSale, modifySale, cancelSale };

export default saleService;
