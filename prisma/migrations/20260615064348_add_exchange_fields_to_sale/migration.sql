-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('SALE', 'PURCHASE', 'EXCHANGE', 'CARD', 'USER');

-- DropIndex
DROP INDEX "SaleItem_cardCopyId_key";

-- AlterTable
ALTER TABLE "ExchangeProposal" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "linkUrl" TEXT,
ADD COLUMN     "targetId" INTEGER,
ADD COLUMN     "targetType" "NotificationTargetType";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "exchangeDescription" TEXT,
ADD COLUMN     "exchangeGenre" "CardGenre",
ADD COLUMN     "exchangeGrade" "CardGrade";

-- CreateTable
CREATE TABLE "RandomBoxHistory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RandomBoxHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "saleItemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RandomBoxHistory_userId_idx" ON "RandomBoxHistory"("userId");

-- CreateIndex
CREATE INDEX "RandomBoxHistory_createdAt_idx" ON "RandomBoxHistory"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_tableName_recordId_idx" ON "AuditLog"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_changedById_idx" ON "AuditLog"("changedById");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseItem_saleItemId_key" ON "PurchaseItem"("saleItemId");

-- CreateIndex
CREATE INDEX "Purchase_saleId_idx" ON "Purchase"("saleId");

-- AddForeignKey
ALTER TABLE "RandomBoxHistory" ADD CONSTRAINT "RandomBoxHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "SaleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
