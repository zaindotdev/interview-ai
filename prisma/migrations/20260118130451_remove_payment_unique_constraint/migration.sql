/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Payment_status_method_key";

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "stripePaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "public"."Payment"("stripePaymentId");
