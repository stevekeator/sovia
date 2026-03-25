-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'INDIVIDUAL', 'FAMILY_CARE_TEAM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionCycle" AS ENUM ('MONTHLY', 'YEARLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "DemoRequest" ADD COLUMN     "requestedSubscriptionCycle" "SubscriptionCycle",
ADD COLUMN     "requestedSubscriptionTier" "SubscriptionTier";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "subscriptionCycle" "SubscriptionCycle",
ADD COLUMN     "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE';
