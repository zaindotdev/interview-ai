/*
  Warnings:

  - The `method` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYPAL', 'STRIPE');

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'STRIPE';
