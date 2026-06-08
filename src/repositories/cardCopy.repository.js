import prisma from '../configs/prisma.js';

export const getCardCopys = async ({
  quantity,
  photoCardId,
  userId,
  status,
  tx,
}) => {
  const dbClient = tx || prisma;
  return await dbClient.cardCopy.findMany({
    where: {
      photoCardId: photoCardId,
      ownerId: userId,
      status: status,
    },
    take: quantity,
  });
};

export const updateCardCopiesOwnerId = async ({ cardsIds, ownerId, tx }) => {
  const dbClient = tx || prisma;
  return await dbClient.cardCopy.updateMany({
    where: { id: { in: cardsIds } },
    data: { ownerId },
  });
};

export const switchCardsStatus = async ({
  userId,
  cardIds,
  prevStatus,
  newStatus,
  tx,
}) => {
  const dbClient = tx || prisma;
  return await dbClient.cardCopy.updateMany({
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
