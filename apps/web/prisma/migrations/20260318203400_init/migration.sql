-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ORG_ADMIN', 'CAREGIVER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SupportedUserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RoutineStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ImageSourceType" AS ENUM ('UPLOADED', 'EXTERNAL_PUBLIC_DOMAIN');

-- CreateEnum
CREATE TYPE "DeviceLinkStatus" AS ENUM ('PENDING', 'LINKED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('QUEUED', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "StepResultValue" AS ENUM ('DONE', 'NOT_DONE');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "billingStatus" "BillingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'CAREGIVER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportedUser" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "status" "SupportedUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RoutineStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineStep" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageSourceType" "ImageSourceType" NOT NULL DEFAULT 'UPLOADED',
    "imageSourceMetadata" TEXT,
    "shortText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineAssignment" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "supportedUserId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RoutineAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supportedUserId" TEXT NOT NULL,
    "deviceName" TEXT,
    "pairingCode" TEXT,
    "pairingExpiresAt" TIMESTAMP(3),
    "authTokenHash" TEXT,
    "linkedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "status" "DeviceLinkStatus" NOT NULL DEFAULT 'PENDING',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineCompletionSession" (
    "id" TEXT NOT NULL,
    "clientSessionId" TEXT,
    "supportedUserId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "routineVersion" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "sourceDeviceLinkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineCompletionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineCompletionStepResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "routineStepId" TEXT NOT NULL,
    "result" "StepResultValue" NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineCompletionStepResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "organizationName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "estimatedUserCount" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "SupportedUser_organizationId_idx" ON "SupportedUser"("organizationId");

-- CreateIndex
CREATE INDEX "Routine_organizationId_status_idx" ON "Routine"("organizationId", "status");

-- CreateIndex
CREATE INDEX "RoutineStep_routineId_idx" ON "RoutineStep"("routineId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineStep_routineId_sortOrder_key" ON "RoutineStep"("routineId", "sortOrder");

-- CreateIndex
CREATE INDEX "RoutineAssignment_supportedUserId_active_idx" ON "RoutineAssignment"("supportedUserId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineAssignment_routineId_supportedUserId_key" ON "RoutineAssignment"("routineId", "supportedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceLink_pairingCode_key" ON "DeviceLink"("pairingCode");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceLink_authTokenHash_key" ON "DeviceLink"("authTokenHash");

-- CreateIndex
CREATE INDEX "DeviceLink_supportedUserId_status_idx" ON "DeviceLink"("supportedUserId", "status");

-- CreateIndex
CREATE INDEX "DeviceLink_organizationId_status_idx" ON "DeviceLink"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineCompletionSession_clientSessionId_key" ON "RoutineCompletionSession"("clientSessionId");

-- CreateIndex
CREATE INDEX "RoutineCompletionSession_supportedUserId_startedAt_idx" ON "RoutineCompletionSession"("supportedUserId", "startedAt");

-- CreateIndex
CREATE INDEX "RoutineCompletionSession_routineId_startedAt_idx" ON "RoutineCompletionSession"("routineId", "startedAt");

-- CreateIndex
CREATE INDEX "RoutineCompletionStepResult_sessionId_idx" ON "RoutineCompletionStepResult"("sessionId");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportedUser" ADD CONSTRAINT "SupportedUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineStep" ADD CONSTRAINT "RoutineStep_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineAssignment" ADD CONSTRAINT "RoutineAssignment_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineAssignment" ADD CONSTRAINT "RoutineAssignment_supportedUserId_fkey" FOREIGN KEY ("supportedUserId") REFERENCES "SupportedUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLink" ADD CONSTRAINT "DeviceLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLink" ADD CONSTRAINT "DeviceLink_supportedUserId_fkey" FOREIGN KEY ("supportedUserId") REFERENCES "SupportedUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineCompletionSession" ADD CONSTRAINT "RoutineCompletionSession_supportedUserId_fkey" FOREIGN KEY ("supportedUserId") REFERENCES "SupportedUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineCompletionSession" ADD CONSTRAINT "RoutineCompletionSession_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineCompletionSession" ADD CONSTRAINT "RoutineCompletionSession_sourceDeviceLinkId_fkey" FOREIGN KEY ("sourceDeviceLinkId") REFERENCES "DeviceLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineCompletionStepResult" ADD CONSTRAINT "RoutineCompletionStepResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RoutineCompletionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineCompletionStepResult" ADD CONSTRAINT "RoutineCompletionStepResult_routineStepId_fkey" FOREIGN KEY ("routineStepId") REFERENCES "RoutineStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoRequest" ADD CONSTRAINT "DemoRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
