import prisma from '../configs/prisma.js';

export const createSale = async ({
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
};

export const modifySale = async (saleId, data, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.sale.update({
    where: { id: saleId },
    data: data,
  });
};

export const cancelSale = async (saleId, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.sale.update({
    where: { id: saleId },
    data: { status: 'CANCELED' },
  });
};

export const getSale = async (saleId, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.sale.findUnique({
    where: { id: saleId },
  });
};

export const setStatus = async (saleId, status, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.sale.update({
    where: { id: saleId },
    data: { status: status },
  });
};

const saleRepository = {
  createSale,
  modifySale,
  cancelSale,
  setStatus,
  getSale,
};
export default saleRepository;
