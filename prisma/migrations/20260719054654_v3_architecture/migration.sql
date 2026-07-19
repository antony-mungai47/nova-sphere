-- CreateTable
CREATE TABLE "ShoppingMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextVectors" JSONB,
    "recentItems" JSONB,
    "lastInteraction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalsLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalsLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizationProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandAffinities" JSONB,
    "categoryScores" JSONB,
    "priceTier" TEXT NOT NULL DEFAULT 'STANDARD',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIBudget" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "monthlyLimit" INTEGER NOT NULL,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "alertThreshold" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEvaluation" (
    "id" TEXT NOT NULL,
    "promptLogId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "evaluatorModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowState" (
    "id" TEXT NOT NULL,
    "workflowType" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "payload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromState" TEXT NOT NULL,
    "toState" TEXT NOT NULL,
    "actorId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeQuestion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingMemory_userId_key" ON "ShoppingMemory"("userId");

-- CreateIndex
CREATE INDEX "ShoppingMemory_expiresAt_idx" ON "ShoppingMemory"("expiresAt");

-- CreateIndex
CREATE INDEX "SignalsLedger_userId_createdAt_idx" ON "SignalsLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SignalsLedger_sessionId_idx" ON "SignalsLedger"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalizationProfile_userId_key" ON "PersonalizationProfile"("userId");

-- CreateIndex
CREATE INDEX "PersonalizationProfile_priceTier_idx" ON "PersonalizationProfile"("priceTier");

-- CreateIndex
CREATE UNIQUE INDEX "AIBudget_tenantId_key" ON "AIBudget"("tenantId");

-- CreateIndex
CREATE INDEX "AIBudget_tenantId_idx" ON "AIBudget"("tenantId");

-- CreateIndex
CREATE INDEX "PromptLog_provider_model_idx" ON "PromptLog"("provider", "model");

-- CreateIndex
CREATE INDEX "AIEvaluation_promptLogId_idx" ON "AIEvaluation"("promptLogId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowState_correlationId_key" ON "WorkflowState"("correlationId");

-- CreateIndex
CREATE INDEX "WorkflowState_correlationId_idx" ON "WorkflowState"("correlationId");

-- CreateIndex
CREATE INDEX "WorkflowState_status_idx" ON "WorkflowState"("status");

-- CreateIndex
CREATE INDEX "AuditTrail_workflowId_idx" ON "AuditTrail"("workflowId");

-- CreateIndex
CREATE INDEX "KnowledgeQuestion_productId_idx" ON "KnowledgeQuestion"("productId");

-- CreateIndex
CREATE INDEX "KnowledgeAnswer_questionId_idx" ON "KnowledgeAnswer"("questionId");

-- AddForeignKey
ALTER TABLE "AIEvaluation" ADD CONSTRAINT "AIEvaluation_promptLogId_fkey" FOREIGN KEY ("promptLogId") REFERENCES "PromptLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAnswer" ADD CONSTRAINT "KnowledgeAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "KnowledgeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

