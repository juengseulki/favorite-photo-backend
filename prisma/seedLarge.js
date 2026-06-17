import { faker } from '@faker-js/faker';
import { PrismaClient, CardStatus, SaleStatus } from '@prisma/client';

const prisma = new PrismaClient();

const USER_COUNT = 10000;
const PHOTO_CARD_COUNT = 200000;
const SALE_COUNT = 50000;
const CHUNK_SIZE = 5000;

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

function chunkArray(array, size) {
  const result = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

async function createUsers() {
  console.log('유저 생성 시작');

  const users = Array.from({ length: USER_COUNT }).map((_, i) => ({
    email: `test${i}@test.com`,
    nickname: `user${i}`,
    password: '$argon2id$v=19$m=65536,t=3,p=4$dummy',
  }));

  for (const chunk of chunkArray(users, CHUNK_SIZE)) {
    await prisma.user.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  const createdUsers = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  const points = createdUsers.map((user) => ({
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

  console.log('유저/포인트 생성 완료');

  return createdUsers;
}

async function createPhotoCards(users) {
  console.log('포토카드 생성 시작');

  for (let i = 0; i < PHOTO_CARD_COUNT; i += CHUNK_SIZE) {
    const cards = [];

    for (let j = 0; j < CHUNK_SIZE && i + j < PHOTO_CARD_COUNT; j++) {
      const creator = faker.helpers.arrayElement(users);

      cards.push({
        name: `${faker.music.songName()} ${i + j}`,
        description: faker.lorem.sentence(),
        imageUrl: 'https://picsum.photos/300/400',
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

    console.log(
      `PhotoCard ${Math.min(i + CHUNK_SIZE, PHOTO_CARD_COUNT)}/${PHOTO_CARD_COUNT}`
    );
  }

  console.log('포토카드 생성 완료');
}

async function createCardCopies() {
  console.log('CardCopy 생성 시작');

  const cards = await prisma.photoCard.findMany({
    select: {
      id: true,
      creatorId: true,
    },
  });

  for (const chunk of chunkArray(cards, CHUNK_SIZE)) {
    const copies = chunk.map((card) => ({
      photoCardId: card.id,
      ownerId: card.creatorId,
      status: Math.random() < 0.3 ? CardStatus.ON_SALE : CardStatus.OWNED,
      serialNumber: faker.string.uuid(),
    }));

    await prisma.cardCopy.createMany({
      data: copies,
    });
  }

  console.log('CardCopy 생성 완료');
}

async function createSales() {
  console.log('Sale/SaleItem 생성 시작');

  const onSaleCopies = await prisma.cardCopy.findMany({
    where: {
      status: CardStatus.ON_SALE,
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
    take: SALE_COUNT,
  });

  let createdCount = 0;

  for (const chunk of chunkArray(onSaleCopies, 1000)) {
    for (const copy of chunk) {
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
    }

    console.log(`Sale/SaleItem ${createdCount}/${onSaleCopies.length}`);
  }

  console.log('Sale/SaleItem 생성 완료');
}

async function main() {
  console.time('large seed');

  const users = await createUsers();

  await createPhotoCards(users);

  await createCardCopies();

  await createSales();

  console.timeEnd('large seed');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
