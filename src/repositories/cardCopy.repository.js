import prisma from '../configs/prisma.js';

export const getCardCopys = async (quantity, photoCardId, userId) => {
  return await prisma.cardCopy.findMany({
    where: {
      photoCardId: photoCardId,
      ownerId: userId,
      status: 'OWNED',
    },
    take: quantity,
  });
};

export const switchCardsStatus = async (cardIds, status) => {
  return await prisma.cardCopy.updateMany({
    where: {
      id: { in: cardIds },
    },
    data: { status: status },
  });
};

const cardCopyRepository = { getCardCopys, switchCardsStatus };
export default cardCopyRepository;
