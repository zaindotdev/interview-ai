/*
  Warnings:

  - A unique constraint covering the columns `[autoLoginToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "autoLoginToken" TEXT,
ADD COLUMN     "autoLoginTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_autoLoginToken_key" ON "User"("autoLoginToken");
