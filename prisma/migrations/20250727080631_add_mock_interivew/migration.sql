/*
  Warnings:

  - You are about to drop the `InterveiwQuestions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MockInterviewsDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- DropForeignKey
ALTER TABLE "InterveiwQuestions" DROP CONSTRAINT "InterveiwQuestions_jobId_fkey";

-- DropTable
DROP TABLE "InterveiwQuestions";

-- CreateTable
CREATE TABLE "MockInterviews" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "focus" TEXT[],
    "estimated_time" TEXT NOT NULL,
    "difficulty" "MockInterviewsDifficulty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterviews_pkey" PRIMARY KEY ("id")
);
