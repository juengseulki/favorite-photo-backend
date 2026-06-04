import cardCopyRepository from '../repositories/cardCopyRepository.js';
import saleItemRepository from '../repositories/saleItemRepository.js';
import saleRepositioy from '../repositories/saleRepository.js';

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
    //0. sale 생성
    const sale = await saleRepositioy.createSale({
      userId,
      photoCardId,
      price,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
    });
    const saleId = sale.id;

    const { saleItems, cardCopies } = createSaleItemsAndCards(
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

  //실제로 들어온 값만 업데이트 대상.
  const modifyData = {};
  if (price) modifyData.price = price;
  if (exchangeGrade) modifyData.exchangeGrade = exchangeGrade;
  if (exchangeGenre) modifyData.exchangeGenre = exchangeGenre;
  if (exchangeDescription) modifyData.exchangeDescription = exchangeDescription;
  if (Object.keys(modifyData).length > 0)
    await saleRepositioy.modifySale(saleId, modifyData);

  //quantity의 경우에는, 변경이 되었을 시, SaleItem의 변경이 필요해짐.
  //기존 quantity 정보 가져오기
  if (quantity) {
    const prevQuantity = await saleItemRepository.countSaleItemsForSale(saleId);

    if (quantity !== prevQuantity) {
      //원래 기존의 카드를 모두 OWNED처리 후, 새로운 SaleItem을만들으려 했으나, 이 방식은 이전에 사용됐던 카드가 재 사용될 경우, 한 카드가 두 SaleItem에 등록되면서, 실제로 판매 중인 카드의 수량을 셀 때, 한 카드가 두번 세어지는 문제상황이 발생함.
      //카드의 늘어난/줄어든 수량만큼만 처리하도록 수정함.

      //카드 수량이 늘어난 경우
      if (quantity > prevQuantity) {
        const addCount = quantity - prevQuantity;
        //이전에 SaleItem에 포함된 적이 있는 카드를 우선적으로 ON_SALE로 바꾼 뒤, 나머지 개수만 새로 추가한다.
        //SaleItem에 포함된 적 있던 카드를 OWNED-> ON_SALE로
        const usedSaleItems =
          await saleItemRepository.getSaleItemsForSaleOwned(saleId);
        const usedCopyCardsId = usedSaleItems.map((item) => item.cardCopyId);

        //개수만큼 cardCopyId의 상태를 ON_SALE로 바꾸고, 남은 개수는 saleItem을 새로 추가하기.
        let remainedCount = 0;
        if (addCount === usedCopyCardsId.length)
          await cardCopyRepository.switchCardsStatus(
            usedCopyCardsId,
            'ON_SALE'
          );
        else if (addCount > usedCopyCardsId.length) {
          await cardCopyRepository.switchCardsStatus(
            usedCopyCardsId,
            'ON_SALE'
          );
          remainedCount = addCount - usedCopyCardsId.length;
        } else if (addCount < usedCopyCardsId.length) {
          const slicedCopyCardsId = usedCopyCardsId.slice(0, addCount);
          await cardCopyRepository.switchCardsStatus(
            slicedCopyCardsId,
            'ON_SALE'
          );
        }
        //개수만큼 새로운 카드 추가 -
        if (remainedCount > 0) {
          await createSaleItemsAndCards(
            photoCardId,
            remainedCount,
            saleId,
            userId
          );
        }
      }

      //카드 수량이 줄어든 경우
      if (quantity < prevQuantity) {
        const subCount = prevQuantity - quantity;
        const saleItems = await saleItemRepository.getSaleItemsBySaleId(
          saleId,
          subCount
        );
        const cardCopyIds = saleItems.map((item) => item.cardCopyId);
        const cards = await cardCopyRepository.switchCardsStatus(
          cardCopyIds,
          'OWNED'
        );
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

export const cancelSale = async () => {
  //1. Sale 삭제
  //2. Sale에 연결된 SaleItem의 status를 안 파는 걸로 처리
  //3. Sale에 연결된 cardCopy의 상태는 ON_SALE -> OWNED로 변경
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
    userId
  );
  const availableCardsIds = availableCards.map((card) => card.id);

  //2. saleItem 생성하기 : cardCopy의 데이터마다, saleItem을 생성한다.
  const saleItemsData = availableCardsIds.map((cardId) => {
    return { saleId: saleId, cardCopyId: cardId };
  });
  const saleItems = await saleItemRepository.createSaleItems(saleItemsData);

  //3. cardCopy 상태 변경 : 가져온 cardCopy에 대해, 상태를 ON_SALE로 변경한다.
  const onSaleCards = await cardCopyRepository.switchCardsStatus(
    availableCardsIds,
    'ON_SALE'
  );

  return { saleItems, onSaleCards };
};

const saleService = { createSale, modifySale, cancelSale };

export default saleService;
