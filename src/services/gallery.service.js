import prisma from '../configs/prisma.js';
import AppError from '../utils/AppError.js';

const GRADES = ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'];

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

  //등급 필터링(userId 조회)
  const countWhere = {
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
  const [cards, totalCount, allCardsForCount] = await Promise.all([
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

    prisma.photoCard.findMany({
      where: countWhere,
      select: {
        grade: true,
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
  ]);

  const counts = {};

  allCardsForCount.forEach((card) => {
    counts[card.grade] = (counts[card.grade] || 0) + card.cardCopies.length;
  });

  // 등급별 보유 수량
  const gradeCount = GRADES.map((grade) => ({
    grade,
    count: counts[grade] || 0,
  }));

  // 총 보유 수량
  const totalCopyCount = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

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

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;

  return {
    items: formattedCards,
    gradeCount,
    meta: {
      page,
      limit,
      totalCount,
      totalCopyCount,
      totalPages,
      hasNextPage,
    },
  };
};

export const postMyCardsService = async ({
  userId,
  name,
  description,
  imageUrl,
  grade,
  genre,
  initialPrice,
  totalQuantity,
}) => {
  if (!name) {
    throw new AppError(400, 'MISSING_NAME', '카드 이름을 입력해 주세요.');
  }

  if (!imageUrl) {
    throw new AppError(400, 'MISSING_IMAGE_URL', '이미지 URL을 입력해 주세요.');
  }

  if (!grade) {
    throw new AppError(400, 'MISSING_GRADE', '등급을 입력해 주세요.');
  }

  if (!['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'].includes(grade)) {
    throw new AppError(400, 'INVALID_GRADE', '유효하지 않은 등급입니다.');
  }

  if (!genre) {
    throw new AppError(400, 'MISSING_GENRE', '장르를 입력해 주세요.');
  }

  if (
    !['ALBUM', 'SPECIAL', 'FAN_SIGN', 'SEASON_GREETING', 'CONCERT'].includes(
      genre
    )
  ) {
    throw new AppError(400, 'INVALID_GENRE', '유효하지 않은 장르입니다.');
  }

  if (!totalQuantity) {
    throw new AppError(
      400,
      'MISSING_TOTAL_QUANTITY',
      '발행 수량을 입력해 주세요.'
    );
  }

  if (totalQuantity <= 0) {
    throw new AppError(
      400,
      'INVALID_TOTAL_QUANTITY',
      '발행 수량은 1개 이상이어야 합니다.'
    );
  }

  if (totalQuantity > 10) {
    throw new AppError(
      400,
      'TOTAL_QUANTITY_LIMIT_EXCEEDED',
      '카드는 최대 10장까지 발행할 수 있습니다.'
    );
  }

  if (!initialPrice) {
    throw new AppError(
      400,
      'MISSING_INITIAL_PRICE',
      '초기 가격을 입력해 주세요.'
    );
  }

  if (initialPrice <= 0) {
    throw new AppError(
      400,
      'INVALID_INITIAL_PRICE',
      '초기 가격은 1 이상이어야 합니다.'
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const photoCard = await tx.photoCard.create({
      data: {
        name,
        description,
        imageUrl,
        grade,
        genre,
        totalQuantity,
        initialPrice,
        creatorId: userId,
      },
    });

    const cardCopies = [];

    for (let i = 1; i <= totalQuantity; i++) {
      cardCopies.push({
        photoCardId: photoCard.id,
        ownerId: userId,
        serialNumber: `CARD-${photoCard.id}-${String(i).padStart(3, '0')}`,
      });
    }

    await tx.cardCopy.createMany({
      data: cardCopies,
    });

    return photoCard;
  });

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    imageUrl: result.imageUrl,
    grade: result.grade,
    genre: result.genre,
    totalQuantity: result.totalQuantity,
    initialPrice: result.initialPrice,
    creatorId: result.creatorId,
    createdAt: result.createdAt,
  };
};

export const getMyTradesService = async ({
  userId,
  keyword,
  grade,
  genre,
  tradeType,
  isSoldOut,
  page,
  limit,
  sort,
}) => {
  //페이지네이션에 이용할 skip
  const skip = (page - 1) * limit;

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

  //포토카드 전체 Where절 조건
  const photoCardWhere = {
    ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    ...(grade && grade),
    ...(genre && genre),
  };

  //----판매 목록 가져오기----
  //soldOut값에 따른 where절 조건
  const isSoldOutWhere =
    isSoldOut === undefined
      ? { in: ['ON_SALE', 'SOLD_OUT'] }
      : isSoldOut
        ? 'SOLD_OUT'
        : 'ON_SALE';

  //sale 가져오기
  const sales = [];
  //판매방법이 선택되지 않았거나, 판매 방법이 "SALE"이라면, SALE을 가져온다.
  if (!tradeType || tradeType === 'SALE') {
    sales = await prisma.sale.findMany({
      where: {
        sellerId: userId,
        status: isSoldOutWhere, //매진여부에 따라 가져온다.
        photoCard: photoCardWhere,
      },
      include: {
        //포토카드 정보 가져오기(실제로 표시할 내용이 대부분 담긴 것)
        photoCard: {
          //포토카드에 연결된 유저의 이름을 알아야 하므로
          creator: { select: { nickname: true } },
        },
        //수량을 세기 위함.
        saleItems: true,
      },
      orderBy,
    });
  }

  //----교환 목록 가져오기----
  let exchangeProposals = [];
  //판매 방법이 선택되지 않았거나, 판매 방법이 "EXCHANGE"라면, EXCHANGE를 가져온다.
  if (!tradeType || tradeType === 'EXCHANGE') {
    exchangeProposals = await prisma.exchangeProposal.findMany({
      where: {
        proposerId: userId,
        status: 'PENDING', //교환 대기 중인 카드만
        offeredCardCopy: {
          photoCard: photoCardWhere,
        },
      },
      include: {
        photoCard: {
          //포토카드 정보 가져오기(실제로 표시할 내용이 대부분 담긴 것)
          include: {
            //포토카드에 연결된 유저의 이름을 알아야 하므로
            creator: { select: { nickname: true } },
          },
        },
        //가격 정보를 가져오기 위함
        sale: { select: { price: true } },
      },
      orderBy,
    });
  }

  //----가져온 정보를, 예쁘게 넘겨주 수 있도록 포맷팅----
  const formattedSales = sales.map((sale) => ({
    saleId: sale.id,
    photoCardId: sale.photoCardId,
    name: sale.photoCard.name,
    imageUrl: sale.photoCard.imageUrl,
    grade: sale.photoCard.grade,
    genre: sale.photoCard.genre,
    creatorNickname: sale.photoCard.creator.nickname,
    quantity: sale.saleItems.length,
    status: 'ON_SALE',
    statusLabel: '판매 중',
    price: sale.price,
    createdAt: sale.createdAt,
  }));
  const formattedExchanges = exchangeProposals.map((ex) => {});
};
