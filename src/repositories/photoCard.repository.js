import prisma from '../configs/prisma.js';

const photoCardRepository = {
  getPhotoCard: async ({ photoCardId, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.photoCard.findUnique({
      where: {
        id: Number(photoCardId),
      },
    });
  },
};

export default photoCardRepository;
