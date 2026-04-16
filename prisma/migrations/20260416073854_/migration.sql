/*
  Warnings:

  - You are about to drop the column `otp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiry` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."User_otp_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "otp",
DROP COLUMN "otpExpiry",
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "public"."User"("verificationToken");
