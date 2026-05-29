import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

const GRADE_MAP = {
  common: "COMMON",
  rare: "RARE",
  "super rare": "SUPER_RARE",
  legendary: "LEGENDARY",
};

const GENRE_MAP = {
  앨범: "ALBUM",
  특전: "SPECIAL",
  팬싸: "FAN_SIGN",
  시즌그리팅: "SEASON_GREETING",
  팬미팅: "FAN_MEETING",
  콘서트: "CONCERT",
  MD: "MD",
  콜라보: "COLLAB",
  팬클럽: "FANCLUB",
  기타: "ETC",
};

async function readJson(fileName) {
  const filePath = path.join(process.cwd(), "prisma", "seed-data", fileName);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

async function main() {
  const users = await readJson("users.json");
  const cards = await readJson("cards.json");

  await prisma.notification.deleteMany();
  await prisma.pointHistory.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.exchangeProposal.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.cardCopy.deleteMany();
  await prisma.photoCard.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.oAuthAccount?.deleteMany?.();
  await prisma.point.deleteMany();
  await prisma.user.deleteMany();

  const userIdMap = new Map();

  for (const user of users) {
    const hashedPassword = await argon2.hash(user.password);

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
            reason: "SIGN_UP",
            description: "초기 가입 포인트 지급",
          },
        },
      },
    });

    userIdMap.set(user.id, createdUser.id);
  }

  for (const card of cards) {
    const creatorId = userIdMap.get(card.userId);

    const photoCard = await prisma.photoCard.create({
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

    const cardCopies = [];

    for (let i = 1; i <= card.totalQuantity; i++) {
      const isOnSale = i <= card.remainingQuantity;

      const copy = await prisma.cardCopy.create({
        data: {
          photoCardId: photoCard.id,
          ownerId: creatorId,
          status: isOnSale ? "ON_SALE" : "OWNED",
          serialNumber: `CARD-${photoCard.id}-${String(i).padStart(3, "0")}`,
        },
      });

      if (isOnSale) {
        cardCopies.push(copy);
      }
    }

    const sale = await prisma.sale.create({
      data: {
        sellerId: creatorId,
        photoCardId: photoCard.id,
        price: card.price,
        status: card.remainingQuantity > 0 ? "ON_SALE" : "SOLD_OUT",
      },
    });

    for (const copy of cardCopies) {
      await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          cardCopyId: copy.id,
        },
      });
    }
  }

  console.log("Seed 완료!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
