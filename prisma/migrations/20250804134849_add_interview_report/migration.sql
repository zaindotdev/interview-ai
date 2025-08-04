-- CreateTable
CREATE TABLE "MockInterviewsReport" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterviewsReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewsReport_id_key" ON "MockInterviewsReport"("id");
