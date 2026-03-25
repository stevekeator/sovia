-- CreateEnum
CREATE TYPE "RoutineScheduleType" AS ENUM ('DAILY', 'WEEKLY');

-- AlterTable
ALTER TABLE "RoutineAssignment" ADD COLUMN     "daysOfWeek" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "scheduleType" "RoutineScheduleType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "timesPerDay" INTEGER NOT NULL DEFAULT 1;
