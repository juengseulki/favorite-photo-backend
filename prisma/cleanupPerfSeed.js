import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_PREFIX = '[PERF_TEST]';

async function main() {
  console.log('PERF TEST 데이터 삭제 시작');

  const seedUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'perf_test_',
      },
    },
    select: {
      id: true,
    },
  });

  const seedUserIds = seedUsers.map((user) => user.id);

  console.log(`삭제 대상 유저: ${seedUserIds.length}`);

  // 1. 판매 아이템
  const saleItems = await prisma.saleItem.deleteMany({
    where: {
      sale: {
        photoCard: {
          name: {
            startsWith: TEST_PREFIX,
          },
        },
      },
    },
  });

  console.log(`SaleItem 삭제: ${saleItems.count}`);

  // 2. 판매글
  const sales = await prisma.sale.deleteMany({
    where: {
      photoCard: {
        name: {
          startsWith: TEST_PREFIX,
        },
      },
    },
  });

  console.log(`Sale 삭제: ${sales.count}`);

  // 3. 카드 복사본
  const copies = await prisma.cardCopy.deleteMany({
    where: {
      photoCard: {
        name: {
          startsWith: TEST_PREFIX,
        },
      },
    },
  });

  console.log(`CardCopy 삭제: ${copies.count}`);

  // 4. 포토카드
  const cards = await prisma.photoCard.deleteMany({
    where: {
      name: {
        startsWith: TEST_PREFIX,
      },
    },
  });

  console.log(`PhotoCard 삭제: ${cards.count}`);

  // 5. 포인트
  const points = await prisma.point.deleteMany({
    where: {
      userId: {
        in: seedUserIds,
      },
    },
  });

  console.log(`Point 삭제: ${points.count}`);

  // 6. 테스트 유저
  const users = await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'perf_test_',
      },
    },
  });

  console.log(`User 삭제: ${users.count}`);

  console.log('PERF TEST 데이터 삭제 완료');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
