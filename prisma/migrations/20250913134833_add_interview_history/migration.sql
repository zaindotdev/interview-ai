-- CreateTable
CREATE TABLE "public"."MockInterviewsHistory" (
    "id" TEXT NOT NULL,
    "mockInterviewId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "duration" INTEGER,
    "transcripts" JSONB,
    "feedbackReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterviewsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "history_mock_interview_id_idx" ON "public"."MockInterviewsHistory"("mockInterviewId");

-- CreateIndex
CREATE INDEX "history_candidate_id_idx" ON "public"."MockInterviewsHistory"("candidateId");

-- CreateIndex
CREATE INDEX "mock_interviews_report_candidate_id_idx" ON "public"."MockInterviewsReport"("candidateId");

-- AddForeignKey
ALTER TABLE "public"."MockInterviewsHistory" ADD CONSTRAINT "MockInterviewsHistory_mockInterviewId_fkey" FOREIGN KEY ("mockInterviewId") REFERENCES "public"."MockInterviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MockInterviewsHistory" ADD CONSTRAINT "MockInterviewsHistory_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MockInterviewsHistory" ADD CONSTRAINT "MockInterviewsHistory_feedbackReportId_fkey" FOREIGN KEY ("feedbackReportId") REFERENCES "public"."MockInterviewsReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
