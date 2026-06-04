import saleRepositioy from '../repositories/saleRepository';

const saleService = { createSale };

export const createSale = async (
  photoCardId,
  price,
  exchangeInfo, //TODO: 교환 정보 받으면 그것도 추가해야 됨.
  userId
) => {
  try {
    //sale 생성
    const sale = await saleRepositioy.createSale(userId, photoCardId, price);
    return sale;
  } catch (e) {
    throw e;
  }
};

export default saleService;
