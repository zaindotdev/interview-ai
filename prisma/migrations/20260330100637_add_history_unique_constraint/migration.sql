-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CANDIDATE', 'RECRUITER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYPAL', 'STRIPE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN,
    "phone_number" TEXT,
    "image" TEXT,
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CANDIDATE',
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "mockInterviewId" TEXT,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vapiAssistantId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Nora - Technical Interviewer',
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "focus" TEXT[],
    "difficulty" TEXT NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "configuration" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "parsedJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviews" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "focus" TEXT[],
    "estimated_time" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviewsReport" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "metaData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterviewsReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviewsHistory" (
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
    "method" "PaymentMethod" NOT NULL DEFAULT 'STRIPE',
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_otp_key" ON "User"("otp");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_role_key" ON "User"("email", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_id_key" ON "Assistant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_vapiAssistantId_key" ON "Assistant"("vapiAssistantId");

-- CreateIndex
CREATE INDEX "assistant_user_id_idx" ON "Assistant"("userId");

-- CreateIndex
CREATE INDEX "assistant_vapi_id_idx" ON "Assistant"("vapiAssistantId");

-- CreateIndex
CREATE INDEX "resume_user_id_idx" ON "Resume"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviews_id_key" ON "MockInterviews"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviews_topic_key" ON "MockInterviews"("topic");

-- CreateIndex
CREATE INDEX "mock_interviews_candidate_id_idx" ON "MockInterviews"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewsReport_id_key" ON "MockInterviewsReport"("id");

-- CreateIndex
CREATE INDEX "mock_interviews_report_candidate_id_idx" ON "MockInterviewsReport"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewsHistory_id_key" ON "MockInterviewsHistory"("id");

-- CreateIndex
CREATE INDEX "history_mock_interview_id_idx" ON "MockInterviewsHistory"("mockInterviewId");

-- CreateIndex
CREATE INDEX "history_candidate_id_idx" ON "MockInterviewsHistory"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "MockInterviewsHistory_candidateId_mockInterviewId_key" ON "MockInterviewsHistory"("candidateId", "mockInterviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paymentId_key" ON "Subscription"("paymentId");

-- CreateIndex
CREATE INDEX "subscription_user_id_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "subscription_payment_id_idx" ON "Subscription"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_paymentId_key" ON "Subscription"("userId", "paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "payment_method_idx" ON "Payment"("method");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "verification_token_token_idx" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewsHistory" ADD CONSTRAINT "MockInterviewsHistory_mockInterviewId_fkey" FOREIGN KEY ("mockInterviewId") REFERENCES "MockInterviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewsHistory" ADD CONSTRAINT "MockInterviewsHistory_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewsHistory" ADD CONSTRAINT "MockInterviewsHistory_feedbackReportId_fkey" FOREIGN KEY ("feedbackReportId") REFERENCES "MockInterviewsReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
