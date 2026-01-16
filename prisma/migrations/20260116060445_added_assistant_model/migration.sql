-- CreateTable
CREATE TABLE "public"."Assistant" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_id_key" ON "public"."Assistant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_vapiAssistantId_key" ON "public"."Assistant"("vapiAssistantId");

-- CreateIndex
CREATE INDEX "assistant_user_id_idx" ON "public"."Assistant"("userId");

-- CreateIndex
CREATE INDEX "assistant_vapi_id_idx" ON "public"."Assistant"("vapiAssistantId");

-- AddForeignKey
ALTER TABLE "public"."Assistant" ADD CONSTRAINT "Assistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
