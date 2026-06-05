import prisma from '../configs/prisma.js';

export const getCardCopys = async (quantity, photoCardId, userId, status) => {
  return await prisma.cardCopy.findMany({
    where: {
      photoCardId: photoCardId,
      ownerId: userId,
      status: status,
    },
    take: quantity,
  });
};

export const switchCardsStatus = async ({
  userId,
  cardIds,
  prevStatus,
  newStatus,
}) => {
  return await prisma.cardCopy.updateMany({
    where: {
      id: { in: cardIds },
      status: prevStatus,
      ownerId: userId,
    },
    data: { status: newStatus },
  });
};

const cardCopyRepository = { getCardCopys, switchCardsStatus };
export default cardCopyRepository;
