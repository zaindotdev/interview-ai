/*
  Warnings:

  - A unique constraint covering the columns `[topic]` on the table `MockInterviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MockInterviews_topic_key" ON "MockInterviews"("topic");
