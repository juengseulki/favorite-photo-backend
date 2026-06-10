import prisma from '../configs/prisma.js';

const cardCopyRepository = {
  getCardCopy: async ({ cardCopyId, photoCardId, userId, status, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.cardCopy.findFirst({
      where: {
        id: cardCopyId,
        photoCardId: photoCardId,
        ownerId: userId,
        status: status,
      },
      orderBy: {
        id: 'desc',
      },
    });
  },
  getCardCopys: async ({ quantity, photoCardId, userId, status, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.cardCopy.findMany({
      where: {
        photoCardId: photoCardId,
        ownerId: userId,
        status: status,
      },
      take: quantity,
    });
  },
  updateCardCopiesOwnerId: async ({ cardsIds, ownerId, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.cardCopy.updateMany({
      where: { id: { in: cardsIds } },
      data: { ownerId },
    });
  },
  switchCardsStatus: async ({ userId, cardIds, prevStatus, newStatus, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.cardCopy.updateMany({
      where: {
        id: { in: cardIds },
        status: prevStatus,
        ownerId: userId,
      },
      data: { status: newStatus },
    });
  },
};

export default cardCopyRepository;
