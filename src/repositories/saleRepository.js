import prisma from '../configs/prisma.js';

export const createSale = async ({
  userId,
  photoCardId,
  price,
  exchangeGrade,
  exchangeGenre,
  exchangeDescription,
}) => {
  return await prisma.sale.create({
    data: { sellerId: userId },
    photoCardId: Number(photoCardId),
    price,
    exchangeGrade,
    exchangeGenre,
    exchangeDescription,
  });
};

export const modifySale = async (saleId, data) => {
  return await prisma.sale.update({
    where: { id: saleId },
    data: data,
  });
};

export const deleteSale = async (saleId) => {
  return await prisma.sale.delete({
    where: { id: saleId },
  });
};

export const getSale = async (saleId) => {
  return await prisma.sale.find({
    where: { id: saleId },
  });
};

export const setStatus = async (saleId, status) => {
  return await prisma.sale.update({
    where: { id: saleId },
    data: { status: status },
  });
};

const saleRepositioy = {
  createSale,
  modifySale,
  deleteSale,
  setStatus,
  getSale,
};
export default saleRepositioy;
