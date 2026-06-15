import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const GRADE_MAP = {
  common: 'COMMON',
  rare: 'RARE',
  'super rare': 'SUPER_RARE',
  legendary: 'LEGENDARY',
};

const GENRE_MAP = {
  앨범: 'ALBUM',
  특전: 'SPECIAL',
  팬싸: 'FAN_SIGN',
  시즌그리팅: 'SEASON_GREETING',
  팬미팅: 'FAN_MEETING',
  콘서트: 'CONCERT',
  MD: 'MD',
  콜라보: 'COLLAB',
  팬클럽: 'FANCLUB',
  기타: 'ETC',
};

async function readJson(fileName) {
  const filePath = path.join(process.cwd(), 'prisma', 'seed-data', fileName);
  const data = await fs.readFile(filePath, 'utf-8');

  return JSON.parse(data);
}

async function resetDatabase() {
  await prisma.notification.deleteMany();
  await prisma.exchangeProposal.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.cardCopy.deleteMany();
  await prisma.photoCard.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.pointHistory.deleteMany();
  await prisma.point.deleteMany();
  await prisma.user.deleteMany();
}

function validateCardSeed(card) {
  if (!GRADE_MAP[card.grade]) {
    throw new Error(`지원하지 않는 등급입니다: ${card.grade}`);
  }

  if (!GENRE_MAP[card.genre]) {
    throw new Error(`지원하지 않는 장르입니다: ${card.genre}`);
  }

  if (card.remainingQuantity > card.totalQuantity) {
    throw new Error(
      `remainingQuantity가 totalQuantity보다 큽니다: ${card.name}`
    );
  }
}

async function createUsers(users) {
  const userIdMap = new Map();

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        nickname: user.nickname,
        point: {
          create: {
            balance: user.points,
          },
        },
        pointHistories: {
          create: {
            amount: user.points,
            reason: 'SIGN_UP',
            description: '초기 가입 포인트 지급',
          },
        },
      },
    });

    userIdMap.set(user.id, createdUser.id);
  }

  return userIdMap;
}

async function createPhotoCards(cards, userIdMap) {
  for (const card of cards) {
    validateCardSeed(card);

    const creatorId = userIdMap.get(card.userId);

    if (!creatorId) {
      throw new Error(`존재하지 않는 userId입니다: ${card.userId}`);
    }

    await prisma.$transaction(async (tx) => {
      const photoCard = await tx.photoCard.create({
        data: {
          name: card.name,
          description: card.description,
          imageUrl: card.imageUrl,
          grade: GRADE_MAP[card.grade],
          genre: GENRE_MAP[card.genre],
          totalQuantity: card.totalQuantity,
          initialPrice: card.price,
          creatorId,
        },
      });

      const createdCopies = [];

      for (let i = 1; i <= card.totalQuantity; i++) {
        const copy = await tx.cardCopy.create({
          data: {
            photoCardId: photoCard.id,
            ownerId: creatorId,
            status: 'OWNED',
            serialNumber: `CARD-${photoCard.id}-${String(i).padStart(3, '0')}`,
          },
        });

        createdCopies.push(copy);
      }

      const saleQuantity = Number(card.remainingQuantity) || 0;

      if (saleQuantity <= 0) {
        return;
      }

      const sale = await tx.sale.create({
        data: {
          sellerId: creatorId,
          photoCardId: photoCard.id,
          price: card.price,
          status: 'ON_SALE',
          exchangeGrade: null,
          exchangeGenre: null,
          exchangeDescription: null,
        },
      });

      const saleCopies = createdCopies.slice(0, saleQuantity);

      await tx.saleItem.createMany({
        data: saleCopies.map((copy) => ({
          saleId: sale.id,
          cardCopyId: copy.id,
        })),
      });

      await tx.cardCopy.updateMany({
        where: {
          id: {
            in: saleCopies.map((copy) => copy.id),
          },
          ownerId: creatorId,
          status: 'OWNED',
        },
        data: {
          status: 'ON_SALE',
        },
      });
    });
  }
}

async function main() {
  const users = await readJson('users.json');
  const cards = await readJson('cards.json');

  await resetDatabase();

  const userIdMap = await createUsers(users);

  await createPhotoCards(cards, userIdMap);

  console.log('Seed 완료!');
}

main()
  .catch((error) => {
    console.error('Seed 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
