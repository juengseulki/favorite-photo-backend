import { PrismaClient, CardGrade, CardGenre, CardStatus } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'seulking@test.com';

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

const GRADES = [
  CardGrade.COMMON,
  CardGrade.RARE,
  CardGrade.SUPER_RARE,
  CardGrade.LEGENDARY,
];

const GENRES = [
  CardGenre.ALBUM,
  CardGenre.SPECIAL,
  CardGenre.FAN_SIGN,
  CardGenre.SEASON_GREETING,
  CardGenre.FAN_MEETING,
  CardGenre.CONCERT,
];

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: DEMO_EMAIL,
    },
  });

  if (!user) {
    throw new Error('테스트 계정을 찾을 수 없습니다.');
  }

  console.log('데모 유저:', user.nickname);

  for (let i = 1; i <= 30; i++) {
    const photoCard = await prisma.photoCard.create({
      data: {
        name: `DEMO 포토카드 ${i}`,
        description: '최애의 포토 발표 시연용 카드입니다.',
        imageUrl: SEED_IMAGE_URLS[i % SEED_IMAGE_URLS.length],

        grade: GRADES[i % GRADES.length],
        genre: GENRES[i % GENRES.length],

        totalQuantity: 5,
        initialPrice: (i + 1) * 100,

        creatorId: user.id,
      },
    });

    await prisma.cardCopy.createMany({
      data: Array.from({ length: 5 }).map((_, index) => ({
        photoCardId: photoCard.id,
        ownerId: user.id,
        status: CardStatus.OWNED,
        serialNumber: `DEMO-${Date.now()}-${photoCard.id}-${index + 1}`,
      })),
    });
  }

  console.log('🎉 데모 카드 생성 완료!');
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
