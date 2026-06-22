import { faker } from '@faker-js/faker';
import { PrismaClient, CardStatus, SaleStatus } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_PREFIX = '[PERF_TEST]';

const USER_COUNT = 10000;
const PHOTO_CARD_COUNT = 100000;
const SALE_COUNT = 30000;
const CHUNK_SIZE = 1000;
const SALE_CHUNK_SIZE = 100;

const GRADES = ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'];

const GENRES = [
  'ALBUM',
  'SPECIAL',
  'FAN_SIGN',
  'SEASON_GREETING',
  'FAN_MEETING',
  'CONCERT',
  'MD',
  'COLLAB',
  'FANCLUB',
  'ETC',
];

const SEED_IMAGE_URLS = [
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111310/ga_jbxzbz.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111309/coco_qhsswq.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111309/images_sudqtm.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111307/rnscp_m41wws.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111307/conan_om8c7f.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111307/jeong_ewpaab.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111307/spf_pq9v3f.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111306/light_xtjee6.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111306/lala_lsgmms.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111306/jiho_hrdxjr.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111306/sp_quyszp.jpg',
  'https://res.cloudinary.com/dc3b5aft1/image/upload/v1782111306/hunter_crqofm.jpg',
];

function getSeedImageUrl(index) {
  return SEED_IMAGE_URLS[index % SEED_IMAGE_URLS.length];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkArray(array, size) {
  const result = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

async function cleanupBrokenSales() {
  console.log('깨진 Sale 정리 시작');

  const result = await prisma.sale.deleteMany({
    where: {
      photoCard: {
        name: {
          startsWith: TEST_PREFIX,
        },
      },
      saleItems: {
        none: {},
      },
    },
  });

  console.log(`깨진 Sale 삭제 완료: ${result.count}건`);
}

async function createUsers() {
  console.log('유저 생성 시작');

  const users = Array.from({ length: USER_COUNT }).map((_, i) => ({
    email: `perf_test_${i}@test.com`,
    nickname: `perf_user_${i}`,
    password: '$argon2id$v=19$m=65536,t=3,p=4$dummy',
  }));

  for (const chunk of chunkArray(users, CHUNK_SIZE)) {
    await prisma.user.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  const createdUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'perf_test_',
      },
    },
    select: {
      id: true,
    },
  });

  const existingPoints = await prisma.point.findMany({
    where: {
      userId: {
        in: createdUsers.map((user) => user.id),
      },
    },
    select: {
      userId: true,
    },
  });

  const existingPointUserIds = new Set(
    existingPoints.map((point) => point.userId)
  );

  const points = createdUsers
    .filter((user) => !existingPointUserIds.has(user.id))
    .map((user) => ({
      userId: user.id,
      balance: faker.number.int({
        min: 1000,
        max: 100000,
      }),
    }));

  for (const chunk of chunkArray(points, CHUNK_SIZE)) {
    await prisma.point.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  console.log(`유저/포인트 생성 완료: ${createdUsers.length}명`);

  return createdUsers;
}

async function createPhotoCards(users) {
  console.log('포토카드 생성 시작');

  const existingCount = await prisma.photoCard.count({
    where: {
      name: {
        startsWith: TEST_PREFIX,
      },
    },
  });

  const remainCount = Math.max(PHOTO_CARD_COUNT - existingCount, 0);

  if (remainCount === 0) {
    console.log(`포토카드 이미 ${existingCount}장 존재, 추가 생성 생략`);
    return;
  }

  for (let i = 0; i < remainCount; i += CHUNK_SIZE) {
    const cards = [];

    for (let j = 0; j < CHUNK_SIZE && i + j < remainCount; j++) {
      const index = existingCount + i + j;
      const creator = faker.helpers.arrayElement(users);

      cards.push({
        name: `${TEST_PREFIX} ${faker.music.songName()} ${index}`,
        description: faker.lorem.sentence(),
        imageUrl: getSeedImageUrl(index),
        grade: faker.helpers.arrayElement(GRADES),
        genre: faker.helpers.arrayElement(GENRES),
        totalQuantity: 1,
        initialPrice: faker.number.int({
          min: 1000,
          max: 10000,
        }),
        creatorId: creator.id,
      });
    }

    await prisma.photoCard.createMany({
      data: cards,
    });

    await sleep(300);

    console.log(
      `PhotoCard ${Math.min(
        existingCount + i + CHUNK_SIZE,
        PHOTO_CARD_COUNT
      )}/${PHOTO_CARD_COUNT}`
    );
  }

  console.log('포토카드 생성 완료');
}

async function createCardCopies() {
  console.log('CardCopy 생성 시작');

  const cards = await prisma.photoCard.findMany({
    where: {
      name: {
        startsWith: TEST_PREFIX,
      },
      cardCopies: {
        none: {},
      },
    },
    select: {
      id: true,
      creatorId: true,
    },
  });

  await sleep(300);

  if (cards.length === 0) {
    console.log('CardCopy 생성 대상 없음');
    return;
  }

  for (const chunk of chunkArray(cards, CHUNK_SIZE)) {
    const copies = chunk.map((card) => ({
      photoCardId: card.id,
      ownerId: card.creatorId,
      status: Math.random() < 0.3 ? CardStatus.ON_SALE : CardStatus.OWNED,
      serialNumber: faker.string.uuid(),
    }));

    await prisma.cardCopy.createMany({
      data: copies,
      skipDuplicates: true,
    });
  }

  console.log(`CardCopy 생성 완료: ${cards.length}장`);
}

async function createSales() {
  console.log('Sale/SaleItem 생성 시작');

  const existingSaleCount = await prisma.sale.count({
    where: {
      photoCard: {
        name: {
          startsWith: TEST_PREFIX,
        },
      },
    },
  });

  const remainSaleCount = Math.max(SALE_COUNT - existingSaleCount, 0);

  if (remainSaleCount === 0) {
    console.log(`Sale 이미 ${existingSaleCount}건 존재, 추가 생성 생략`);
    return;
  }

  const onSaleCopies = await prisma.cardCopy.findMany({
    where: {
      status: CardStatus.ON_SALE,
      saleItems: {
        none: {},
      },
      photoCard: {
        name: {
          startsWith: TEST_PREFIX,
        },
      },
    },
    select: {
      id: true,
      photoCardId: true,
      ownerId: true,
      photoCard: {
        select: {
          initialPrice: true,
        },
      },
    },
    take: remainSaleCount,
  });

  if (onSaleCopies.length === 0) {
    console.log('Sale 생성 가능한 CardCopy 없음');
    return;
  }

  let createdCount = 0;

  for (const copy of onSaleCopies) {
    const sale = await prisma.sale.create({
      data: {
        sellerId: copy.ownerId,
        photoCardId: copy.photoCardId,
        price: copy.photoCard.initialPrice,
        status: SaleStatus.ON_SALE,
        exchangeGrade: null,
        exchangeGenre: null,
        exchangeDescription: null,
      },
    });

    await prisma.saleItem.create({
      data: {
        saleId: sale.id,
        cardCopyId: copy.id,
      },
    });

    createdCount++;

    if (createdCount % 20 === 0) {
      console.log(
        `Sale/SaleItem ${existingSaleCount + createdCount}/${SALE_COUNT}`
      );

      await sleep(300);
    }
  }

  console.log(`Sale/SaleItem 생성 완료: ${createdCount}건`);
}

async function main() {
  console.time('large seed');

  console.log('운영용 대용량 seed 시작');
  console.log('기존 데이터는 삭제하지 않습니다.');

  // 이전 실패로 생긴 Sale 제거
  await cleanupBrokenSales();

  const users = await createUsers();

  await createPhotoCards(users);

  await createCardCopies();

  await createSales();

  console.timeEnd('large seed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
