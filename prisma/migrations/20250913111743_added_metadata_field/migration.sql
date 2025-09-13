/*
  Warnings:

  - Added the required column `metaData` to the `MockInterviewsReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MockInterviewsReport" ADD COLUMN     "metaData" JSONB NOT NULL;
