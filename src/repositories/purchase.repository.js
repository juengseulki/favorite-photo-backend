import prisma from '../configs/prisma';

const purchaseRepository = {
  createPurchase: async ({ buyerId, saleId, quantity, totalPrice, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchase.create({
      //혹시 string으로 들어올 경우를 대비해 Number을 해서 넣어줌.
      data: {
        buyerId,
        saleId: Number(saleId),
        quantity: Number(quantity),
        totalPrice: Number(totalPrice),
      },
    });
  },

  modifyPurchase: async ({ id, data }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchase.update({
      where: { id },
      data: data,
    });
  },

  //TODO: delete가 필요할까?
  deletePurchase: async ({ id }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchase.delete({
      where: { id },
    });
  },

  getPurchase: async ({ id }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchase.find({
      where: { id },
    });
  },
};

export default purchaseRepository;
