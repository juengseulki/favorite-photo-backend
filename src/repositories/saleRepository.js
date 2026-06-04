import prisma from '../configs/prisma';

const saleRepositioy = {};

export const createSale = async (userId, photoCardId, price) => {
  return await prisma.sale.create({
    data: { sellerId: userId },
    photoCardId: Number(photoCardId),
    price,
  });
};

export const setCopyCardStatus = async (status) => {};

export default saleRepositioy;
