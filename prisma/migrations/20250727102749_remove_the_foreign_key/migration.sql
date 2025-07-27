/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `MockInterviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MockInterviews" DROP CONSTRAINT "MockInterviews_candidateId_fkey";

-- DropIndex
DROP INDEX "MockInterviews_candidateId_key";

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviews_id_key" ON "MockInterviews"("id");

-- CreateIndex
CREATE INDEX "mock_interviews_candidate_id_idx" ON "MockInterviews"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
