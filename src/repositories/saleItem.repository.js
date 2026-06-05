import prisma from '../configs/prisma.js';

export const createSaleItems = async (datas, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.saleItem.createMany({
    data: datas,
  });
};

//update는 status 변경 외엔 해야 할 사항 없음.
//delete도 일어나지 않음. (그저 sale이 종료가 되고, cardcopy는 OWNED상태로 바뀌는 것 뿐.)

export const getSaleItems = async ({
  saleId,
  quantity,
  status,
  userId,
  tx,
}) => {
  const dbClient = tx || prisma;
  return await dbClient.saleItem.findMany({
    where: {
      saleId: saleId,
      cardCopy: {
        status: status || undefined,
        ownerId: userId || undefined,
      },
    },
    take: quantity ?? undefined,
  });
};

export const countActiveSaleItemsForSale = async (saleId, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.saleItem.count({
    where: {
      saleId: saleId,
      cardCopy: {
        status: 'ON_SALE',
      },
    },
  });
};

//TODO: SaleItem의 status를 판매 중 -> 판매 완료로 바꾸는 함수 필요. (나중에 SaleItem에 status항목 추가 된 후에 구현)

const saleItemRepository = {
  createSaleItems,
  countActiveSaleItemsForSale,
  getSaleItems,
};
export default saleItemRepository;
