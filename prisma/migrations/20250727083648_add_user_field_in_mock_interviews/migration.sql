/*
  Warnings:

  - A unique constraint covering the columns `[candidateId]` on the table `MockInterviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `candidateId` to the `MockInterviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MockInterviews" ADD COLUMN     "candidateId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mockInterviewId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviews_candidateId_key" ON "MockInterviews"("candidateId");

-- AddForeignKey
ALTER TABLE "MockInterviews" ADD CONSTRAINT "MockInterviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
