/*
  Warnings:

  - You are about to drop the `JobListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobListing" DROP CONSTRAINT "JobListing_recruiterId_fkey";

-- DropTable
DROP TABLE "JobListing";
