import cardCopyRepository from '../repositories/cardCopy.repository.js';
import saleItemRepository from '../repositories/saleItem.repository.js';
import saleRepositioy from '../repositories/sale.repository.js';
import exchangeProposalRepository from '../repositories/exchangeProposal.repository.js';

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
    //1. Sale 생성
    const sale = await saleRepositioy.createSale({
      userId,
      photoCardId,
      price,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
    });
    const saleId = sale.id;

    //2. SaleItems와 CopyCards생성
    const { saleItems, cardCopies } = await createSaleItemsAndCards(
      photoCardId,
      quantity,
      saleId,
      userId
    );

    return { sale: sale, saleItems: saleItems, cardCopies: cardCopies };
  } catch (e) {
    throw e;
  }
};

//들어오는 정보에 대해서만 update. 들어오지 않는 정보는 현상유지.
export const modifySale = async (saleId, photoCardId, userId, data) => {
  const { quantity, price, exchangeGrade, exchangeGenre, exchangeDescription } =
    data;

  //1. 실제로 들어온 값만 보내서 업데이트.
  const modifyData = {};
  if (price) modifyData.price = price;
  if (exchangeGrade) modifyData.exchangeGrade = exchangeGrade;
  if (exchangeGenre) modifyData.exchangeGenre = exchangeGenre;
  if (exchangeDescription) modifyData.exchangeDescription = exchangeDescription;
  if (Object.keys(modifyData).length > 0)
    await saleRepositioy.modifySale(saleId, modifyData);

  //2. quantity 업데이트 처리
  //   따로 처리하는 이유는, quantity는 Sale의 데이터엔 영향을 끼치지 않고, 연결된 SaleItem의 수에 영향을 끼치기 때문.
  //2-1. 기존 quantity 정보 (개수) 가져오기
  if (quantity) {
    const prevQuantity = //saleItems의 개수를 센다.
      await saleItemRepository.countActiveSaleItemsForSale(saleId);
    //2-2. quantity에 변경이 일어났을 경우 처리 (변경이 없다면 아무것도 하지않음)
    if (quantity !== prevQuantity) {
      //원래 기존의 카드를 모두 OWNED처리 후, 새로운 SaleItem을만들으려 했으나,
      // 이 방식은 이전에 사용됐던 카드가 재 사용될 경우, 한 카드가 두 SaleItem에 등록되면서,
      // 실제로 판매 중인 카드의 수량을 셀 때, 한 카드가 두번 세어지는 문제상황이 발생함.
      //카드의 늘어난/줄어든 수량만큼만 처리하도록 수정함.

      //2-3. 카드 수량이 늘어난 경우

      if (quantity > prevQuantity) {
        //SaleItem에 포함된 적이 있던 카드를 우선적으로 ON_SALE로 변경
        //Sale에 연결된 SaleItems중, cardCopy가 UserId를 가지고 OWNED인 것
        //ㄴ(한 유저의)한 cardCopy로 여러 SaleItem이 생기는 것을 방지하기 위함.
        const usedSaleItems = await saleItemRepository.getSaleItems({
          saleId,
          status: 'OWNED',
          userId,
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
          prevStatus: 'OWNED',
          newStatus: 'ON_SALE',
        });

        //남은 개수만큼 새로운 카드 추가 -
        if (remainedCount > 0) {
          await createSaleItemsAndCards(
            photoCardId,
            remainedCount,
            saleId,
            userId
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
        });
        const cardCopyIds = saleItems.map((item) => item.cardCopyId);
        await cardCopyRepository.switchCardsStatus({
          userId,
          cardIds: cardCopyIds,
          prevStatus: 'ON_SALE',
          newStatus: 'OWNED',
        });
      }

      //   //1. 기존의 CardCopy를 모두 OWNED처리
      //   // (saleId를 가진 saleItem을 찾아서, 거기에 소속된 cardCopyId를 가져와서 처리)
      //   const saleItems = await saleItemRepository.getSaleItemsBySaleId(saleId);
      //   const cardCopyIds = saleItems.map((item) => item.cardCopyId);
      //   const cards = await cardCopyRepository.switchCardsStatus(
      //     cardCopyIds,
      //     'OWNED'
      //   );

      //   //2.  quantity만큼 SaleItem을 만들고, 그 SaleItem들과 CardCopy를 연결해주기.
      //   const { saleItem, cardCopies } = await createSaleItemsAndCards(
      //     photoCardId,
      //     quantity,
      //     userId
      //   );
    }
  }

  //최종적으론 수정된 Sale만 반환. (굳이 cardCopy, saleItem 정보를 보낼 필요는 없을듯?)
  return await saleRepositioy.getSale(saleId);
};

export const cancelSale = async (saleId, userId) => {
  //1. Sale에 연결된 cardCopy의 상태는 ON_SALE -> OWNED로 변경
  const saleItems = await saleItemRepository.getSaleItems(saleId);
  const cardCopyIds = saleItems.map((item) => item.cardCopyId);
  await cardCopyRepository.switchCardsStatus({
    userId,
    cardIds: cardCopyIds,
    prevStatus: 'ON_SALE',
    newStatus: 'OWNED',
  });

  //2. 교환 대기 중이었던 cardCopy의 상태를 변경
  const exPro =
    await exchangeProposalRepository.getExchangeProposalBySaleId(saleId);
  const offeredCardIds = exPro.map((pro) => pro.offerdCardCopyId);
  cardCopyRepository.switchCardsStatus({
    userId,
    cardIds: offeredCardIds,
    prevStatus: 'EXCHANGING',
    newStatus: 'OWNED',
  });

  //3. ExchangeProposal의 상태를 변경
  const exProIds = exPro.map((pro) => pro.id);
  await exchangeProposalRepository.setProposalsStatus(
    exProIds,
    'PENDING',
    'CANCELED'
  );

  //3. Sale 삭제
  await saleRepositioy.cancelSale(saleId);
};

const createSaleItemsAndCards = async (
  photoCardId,
  quantity,
  saleId,
  userId
) => {
  //1. cardCopy 가져오기 : quantity개수만큼, 현재 OWNED상태인 cardCopy 데이터(id)를 가져온다.
  const availableCards = await cardCopyRepository.getCardCopys(
    quantity,
    photoCardId,
    userId,
    'OWNED'
  );
  const availableCardsIds = availableCards.map((card) => card.id);

  //2. saleItem 생성하기 : cardCopy의 데이터마다, saleItem을 생성한다.
  const saleItemsData = availableCardsIds.map((cardId) => {
    return { saleId: saleId, cardCopyId: cardId };
  });
  const saleItems = await saleItemRepository.createSaleItems(saleItemsData);

  //3. cardCopy 상태 변경 : 가져온 cardCopy에 대해, 상태를 ON_SALE로 변경한다.
  const onSaleCards = await cardCopyRepository.switchCardsStatus({
    userId,
    cardIds: availableCardsIds,
    newStatus: 'ON_SALE',
  });

  return { saleItems, onSaleCards };
};

const saleService = { createSale, modifySale, cancelSale };

export default saleService;
