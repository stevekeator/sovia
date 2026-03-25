-- AlterTable
ALTER TABLE "RoutineAssignment" ADD COLUMN     "scheduledTimes" TEXT[] DEFAULT ARRAY[]::TEXT[];
