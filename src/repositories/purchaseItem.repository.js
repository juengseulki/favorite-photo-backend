const purchaseItemRepository = {
  //단일생성
  createPurchaseItem: async ({ purchaseId, saleItemId, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchaseItem.create({
      data: { purchaseId, saleItemId },
    });
  },
  //다수생성
  createPurchaseItems: async ({ purchaseId, saleItemsIds, tx }) => {
    const dbClient = tx || prisma;

    const rowsData = saleItemsIds.map((sId) => {
      return { purchaseId, saleItemId: sId };
    });

    return await dbClient.purchaseItem.createMany({ data: rowsData });
  },

  getPurchaseItem: async ({ id, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchaseItem.findUnique({
      where: { id },
    });
  },

  getPurchaseItemsByPurchseId: async ({ purchaseId, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchaseItem.findMany({
      where: { purchaseId },
    });
  },

  countPurchasItemsByPurchaseId: async ({ purchaseId, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchaseItem.count({
      where: { purchaseId },
    });
  },

  //TODO: modify가 필요할까?
  modifyPurchaseItem: async ({ id, data, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchaseItem.update({
      where: { id },
      data: data,
    });
  },
  //TODO: delete가 필요할까?
  deletePurchaseItem: async ({ id, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.purchaseItem.delete({
      where: { id },
    });
  },
};

export default purchaseItemRepository;
