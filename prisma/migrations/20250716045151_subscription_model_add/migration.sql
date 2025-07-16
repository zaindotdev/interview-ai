-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'FAILED');

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "behavioralScore" INTEGER,
ADD COLUMN     "communicationScore" INTEGER,
ADD COLUMN     "technicalScore" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionId" TEXT;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paymentId_key" ON "Subscription"("paymentId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
