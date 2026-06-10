import prisma from '../configs/prisma.js';

const saleRepository = {
  createSale: async ({
    userId,
    photoCardId,
    price,
    exchangeGrade,
    exchangeGenre,
    exchangeDescription,
    tx,
  }) => {
    const dbClient = tx || prisma;
    return await dbClient.sale.create({
      data: {
        sellerId: userId,
        photoCardId: Number(photoCardId),
        price: Number(price),
        exchangeGrade,
        exchangeGenre,
        exchangeDescription,
      },
    });
  },

  modifySale: async ({ saleId, data, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.sale.update({
      where: { id: Number(saleId) },
      data: data,
    });
  },

  cancelSale: async ({ saleId, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.sale.update({
      where: { id: Number(saleId) },
      data: { status: 'CANCELED' },
    });
  },

  getSale: async ({ saleId, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.sale.findUnique({
      where: { id: Number(saleId) },
    });
  },

  setStatus: async ({ saleId, status, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.sale.update({
      where: { id: Number(saleId) },
      data: { status: status },
    });
  },

  isExist: async ({ saleId, tx }) => {
    const dbClient = tx || prisma;
    const isExist = await dbClient.sale.findUnique({
      where: { id: Number(saleId) },
    });
    return isExist ? true : false;
  },

  isOnSale: async ({ saleId, tx }) => {
    const dbClient = tx || prisma;
    const isOnSale = await dbClient.sale.findUnique({
      where: { id: Number(saleId), status: 'ON_SALE' },
    });
    return isOnSale ? true : false;
  },
};

export default saleRepository;
