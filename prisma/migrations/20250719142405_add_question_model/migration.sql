/*
  Warnings:

  - A unique constraint covering the columns `[candidateId,jobId]` on the table `InterviewSession` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recruiterId,title]` on the table `JobListing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[status,method]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,paymentId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "InterveiwQuestions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answers" TEXT[],
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterveiwQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_job_id_idx" ON "InterveiwQuestions"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "InterveiwQuestions_jobId_question_key" ON "InterveiwQuestions"("jobId", "question");

-- CreateIndex
CREATE INDEX "session_candidate_id_idx" ON "InterviewSession"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewSession_candidateId_jobId_key" ON "InterviewSession"("candidateId", "jobId");

-- CreateIndex
CREATE INDEX "job_recruiter_id_idx" ON "JobListing"("recruiterId");

-- CreateIndex
CREATE UNIQUE INDEX "JobListing_recruiterId_title_key" ON "JobListing"("recruiterId", "title");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "payment_method_idx" ON "Payment"("method");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_status_method_key" ON "Payment"("status", "method");

-- CreateIndex
CREATE INDEX "resume_user_id_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "subscription_user_id_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "subscription_payment_id_idx" ON "Subscription"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_paymentId_key" ON "Subscription"("userId", "paymentId");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_role_key" ON "User"("email", "role");

-- AddForeignKey
ALTER TABLE "InterveiwQuestions" ADD CONSTRAINT "InterveiwQuestions_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
