import cardCopyRepository from '../repositories/cardCopy.repository.js';
import saleItemRepository from '../repositories/saleItem.repository.js';
import saleRepository from '../repositories/sale.repository.js';
import exchangeProposalRepository from '../repositories/exchangeProposal.repository.js';
import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';
import { CardStatus, ExchangeStatus, SaleStatus } from '@prisma/client';
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
  try {
    return await prisma.$transaction(async (tx) => {
      //요청한 수량 만큼, 카드를 보유중인지 확인
      const avilableCardCopies = await cardCopyRepository.getCardCopys({
        quantity,
        photoCardId,
        userId,
        status: CardStatus.OWNED,
        tx,
      });
      if (quantity > avilableCardCopies.length) {
        throw new AppError(ERROR_CODES.CARD_COPY_NOT_ENOUGH());
      }

      //1. Sale 생성
      const sale = await saleRepository.createSale({
        userId,
        photoCardId,
        price,
        exchangeGrade,
        exchangeGenre,
        exchangeDescription,
        tx,
      });
      const saleId = sale.id;

      //2. SaleItems와 CopyCards생성
      const { saleItems, cardCopies } = await createSaleItemsAndCards(
        photoCardId,
        quantity,
        saleId,
        userId,
        tx
      );

      return { sale: sale, saleItems: saleItems, cardCopies: cardCopies };
    });
  } catch (e) {
    throw e;
  }
};

//들어오는 정보에 대해서만 update. 들어오지 않는 정보는 현상유지.
export const modifySale = async ({ saleId, photoCardId, userId, data }) => {
  return await prisma.$transaction(async (tx) => {
    const sale = await saleRepository.getSale({ saleId, tx });
    //본인의 판매글인지 검사
    if (sale.sellerId !== userId) {
      throw new AppError(403, 'NOT_SALE_OWNER', '판매자만 수정할 수 있습니다.');
    }
    //판매 중인 판매글인지 검사
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

    //1. 실제로 들어온 값만 보내서 업데이트.
    const modifyData = {};
    if (price) modifyData.price = price;
    if (exchangeGrade) modifyData.exchangeGrade = exchangeGrade;
    if (exchangeGenre) modifyData.exchangeGenre = exchangeGenre;
    if (exchangeDescription)
      modifyData.exchangeDescription = exchangeDescription;
    if (Object.keys(modifyData).length > 0)
      await saleRepository.modifySale({ saleId, data: modifyData, tx });

    //2. quantity 업데이트 처리
    //   따로 처리하는 이유는, quantity는 Sale의 데이터엔 영향을 끼치지 않고, 연결된 SaleItem의 수에 영향을 끼치기 때문.
    //2-1. 기존 quantity 정보 (개수) 가져오기
    if (quantity) {
      const prevQuantity = //saleItems의 개수를 센다.
        await saleItemRepository.countActiveSaleItemsForSale({ saleId, tx });
      //2-2. quantity에 변경이 일어났을 경우 처리 (변경이 없다면 아무것도 하지않음)
      if (quantity !== prevQuantity) {
        //2-3. 카드 수량이 늘어난 경우
        if (quantity > prevQuantity) {
          //SaleItem에 포함된 적이 있던 카드를 우선적으로 ON_SALE로 변경
          //Sale에 연결된 SaleItems중, cardCopy가 UserId를 가지고 OWNED인 것
          //ㄴ(한 유저의)한 cardCopy로 여러 SaleItem이 생기는 것을 방지하기 위함.
          const usedSaleItems = await saleItemRepository.getSaleItems({
            saleId,
            status: CardStatus.OWNED,
            userId,
            tx,
          });
          const usedCopyCardsId = usedSaleItems.map((item) => item.cardCopyId);

          const addCount = quantity - prevQuantity;
          let requiredCopyCardsId = [...usedCopyCardsId];
          let remainedCount = 0;
          if (addCount < usedCopyCardsId.length) {
            //필요한 개수만큼만, id배열을 자름.
            requiredCopyCardsId = usedCopyCardsId.slice(0, addCount);
          } else if (addCount > usedCopyCardsId.length) {
            //남은 개수를 저장
            remainedCount = addCount - usedCopyCardsId.length;
          }
          //cardCopy의 상태를 ON_SALE로 바꾸기.
          await cardCopyRepository.switchCardsStatus({
            userId,
            cardIds: requiredCopyCardsId,
            prevStatus: CardStatus.OWNED,
            newStatus: CardStatus.ON_SALE,
            tx,
          });

          //남은 개수만큼 새로운 카드 추가
          const remainCards = await cardCopyRepository.getCardCopys({
            quantity: remainedCount,
            photoCardId,
            userId,
            status: CardStatus.OWNED,
            tx,
          });
          if (remainedCount > remainCards.length) {
            throw new AppError(ERROR_CODES.CARD_COPY_NOT_ENOUGH());
          }
          if (remainedCount > 0) {
            await createSaleItemsAndCards(
              photoCardId,
              remainedCount,
              saleId,
              userId,
              tx
            );
          }
        }

        //2-4. 카드 수량이 줄어든 경우
        if (quantity < prevQuantity) {
          //줄어든 개수만큼, cardCopy가 ON_SALE상태인 saleItems을 꺼내서, 연결된 cardCopy의 상태를 OWNED로 변경.
          const subCount = prevQuantity - quantity;
          const saleItems = await saleItemRepository.getSaleItems({
            saleId,
            quantity: subCount,
            tx,
          });
          const cardCopyIds = saleItems.map((item) => item.cardCopyId);
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

    //최종적으론 수정된 Sale만 반환. (굳이 cardCopy, saleItem 정보를 보낼 필요는 없을듯?)
    return await saleRepository.getSale({ saleId, tx });
  });
};

export const cancelSale = async ({ saleId, userId }) => {
  await prisma.$transaction(async (tx) => {
    const sale = await saleRepository.getSale({ saleId, tx });
    //본인의 판매글인지 검사
    if (sale.sellerId !== userId) {
      throw new AppError(403, 'NOT_SALE_OWNER', '판매자만 취소할 수 있습니다.');
    }
    //Sale이 현재 ON_SALE인지 검증 (교환 완료 후에도 판매글이 종료되기에, 끝난 걸 다시 취소하는 것 방지)
    if (sale.status !== SaleStatus.ON_SALE) {
      throw new AppError(ERROR_CODES.SALE_ALREADY_SOLD_OUT());
    }

    //1. Sale에 연결된 cardCopy의 상태는 ON_SALE -> OWNED로 변경
    const saleItems = await saleItemRepository.getSaleItems({ saleId, tx });
    const cardCopyIds = saleItems.map((item) => item.cardCopyId);
    await cardCopyRepository.switchCardsStatus({
      userId,
      cardIds: cardCopyIds,
      prevStatus: CardStatus.ON_SALE,
      newStatus: CardStatus.OWNED,
      tx,
    });

    //2. 교환 대기 중이었던 cardCopy의 상태를 변경 --> 교환 정책과 달라 삭제!

    //3. ExchangeProposal의 상태를 변경
    const exProIds = exPro.map((pro) => pro.id);
    await exchangeProposalRepository.setProposalsStatus({
      ids: exProIds,
      prevStatus: ExchangeStatus.PENDING,
      newStatus: ExchangeStatus.CANCELED,
      tx,
    });

    //3. Sale 삭제
    await saleRepository.cancelSale({ saleId, tx });
  });
};

const createSaleItemsAndCards = async (
  photoCardId,
  quantity,
  saleId,
  userId,
  tx
) => {
  //1. cardCopy 가져오기 : quantity개수만큼, 현재 OWNED상태인 cardCopy 데이터(id)를 가져온다.
  const availableCards = await cardCopyRepository.getCardCopys({
    quantity,
    photoCardId,
    userId,
    status: CardStatus.OWNED,
    tx,
  });
  const availableCardsIds = availableCards.map((card) => card.id);

  //2. saleItem 생성하기 : cardCopy의 데이터마다, saleItem을 생성한다.
  const saleItemsData = availableCardsIds.map((cardId) => {
    return { saleId: saleId, cardCopyId: cardId };
  });
  const saleItems = await saleItemRepository.createSaleItems({
    datas: saleItemsData,
    tx,
  });

  //3. cardCopy 상태 변경 : 가져온 cardCopy에 대해, 상태를 ON_SALE로 변경한다.
  const onSaleCards = await cardCopyRepository.switchCardsStatus({
    userId,
    cardIds: availableCardsIds,
    newStatus: CardStatus.ON_SALE,
    tx,
  });

  return { saleItems, onSaleCards };
};

const saleService = { createSale, modifySale, cancelSale };

export default saleService;
