import prisma from '../configs/prisma.js';

export const getMyCardsService = async ({
  userId,
  keyword,
  grade,
  genre,
  page,
  limit,
  sort,
}) => {
  const skip = (page - 1) * limit;

  //필터링
  const where = {
    ...(keyword && {
      name: {
        contains: keyword,
        mode: 'insensitive',
      },
    }),
    ...(grade && { grade }),
    ...(genre && { genre }),

    cardCopies: {
      some: {
        ownerId: userId,
      },
    },
  };

  //정렬
  let orderBy;

  switch (sort) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;

    case 'latest':
      orderBy = { createdAt: 'desc' };
      break;

    case 'priceAsc':
      orderBy = { initialPrice: 'asc' };
      break;

    case 'priceDesc':
      orderBy = { initialPrice: 'desc' };
      break;

    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  //DB 조회
  const [cards, totalCount] = await Promise.all([
    prisma.photoCard.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        grade: true,
        genre: true,
        initialPrice: true,
        createdAt: true,
        creator: {
          select: {
            nickname: true,
          },
        },
        cardCopies: {
          where: {
            ownerId: userId,
          },
          select: {
            id: true,
          },
        },
      },
    }),

    prisma.photoCard.count({ where }),
  ]);

  const formattedCards = cards.map((card) => ({
    id: card.id,
    name: card.name,
    imageUrl: card.imageUrl,
    grade: card.grade,
    genre: card.genre,
    creatorNickname: card.creator.nickname,
    initialPrice: card.initialPrice,
    createdAt: card.createdAt,
    quantity: card.cardCopies.length,
  }));

  return {
    cards: formattedCards,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  };
};
