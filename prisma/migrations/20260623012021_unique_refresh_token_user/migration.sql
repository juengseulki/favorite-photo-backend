/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "CardCopy_status_idx" ON "CardCopy"("status");

-- CreateIndex
CREATE INDEX "CardCopy_ownerId_status_idx" ON "CardCopy"("ownerId", "status");

-- CreateIndex
CREATE INDEX "CardCopy_photoCardId_ownerId_status_idx" ON "CardCopy"("photoCardId", "ownerId", "status");

-- CreateIndex
CREATE INDEX "ExchangeProposal_status_idx" ON "ExchangeProposal"("status");

-- CreateIndex
CREATE INDEX "ExchangeProposal_proposerId_status_idx" ON "ExchangeProposal"("proposerId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PhotoCard_creatorId_idx" ON "PhotoCard"("creatorId");

-- CreateIndex
CREATE INDEX "PhotoCard_grade_idx" ON "PhotoCard"("grade");

-- CreateIndex
CREATE INDEX "PhotoCard_genre_idx" ON "PhotoCard"("genre");

-- CreateIndex
CREATE INDEX "PhotoCard_createdAt_idx" ON "PhotoCard"("createdAt");

-- CreateIndex
CREATE INDEX "PointHistory_userId_createdAt_idx" ON "PointHistory"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_key" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Sale_status_idx" ON "Sale"("status");

-- CreateIndex
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");

-- CreateIndex
CREATE INDEX "Sale_price_idx" ON "Sale"("price");

-- CreateIndex
CREATE INDEX "Sale_status_id_idx" ON "Sale"("status", "id");

-- CreateIndex
CREATE INDEX "Sale_price_id_idx" ON "Sale"("price", "id");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_cardCopyId_idx" ON "SaleItem"("cardCopyId");
