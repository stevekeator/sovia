import crypto from "node:crypto";
import { DeviceLinkStatus, Prisma, PrismaClient, RoutineStatus, StepResultValue } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getNormalizedScheduledTimes } from "@/lib/utils";

type MobileAssignment = Prisma.RoutineAssignmentGetPayload<{
  include: {
    routine: {
      include: {
        steps: true;
      };
    };
  };
}>;

function getLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function createPairingCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createDeviceToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function hashDeviceToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getAppUrl() {
  return process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export function toAbsoluteUrl(url: string, baseUrl = getAppUrl()) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return new URL(url, baseUrl).toString();
}

export async function getLinkedDeviceFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return null;
  }

  return prisma.deviceLink.findFirst({
    where: {
      authTokenHash: hashDeviceToken(token),
      status: DeviceLinkStatus.LINKED,
      revokedAt: null,
    },
    include: {
      supportedUser: true,
      organization: true,
    },
  });
}

type MobileDbClient = Prisma.TransactionClient | PrismaClient;

export async function buildMobilePayload(
  db: MobileDbClient,
  supportedUserId: string,
  deviceLinkId: string,
  baseUrl?: string,
) {
  const supportedUser = await db.supportedUser.findUniqueOrThrow({
    where: { id: supportedUserId },
  });

  const assignments: MobileAssignment[] = await db.routineAssignment.findMany({
    where: {
      supportedUserId,
      active: true,
      routine: {
        status: RoutineStatus.PUBLISHED,
      },
    },
    orderBy: {
      assignedAt: "asc",
    },
    include: {
      routine: {
        include: {
          steps: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });

  const routineIds = assignments.map((assignment) => assignment.routineId);
  const completionCounts = routineIds.length
    ? await db.routineCompletionSession.groupBy({
        by: ["routineId"],
        where: {
          supportedUserId,
          routineId: {
            in: routineIds,
          },
        },
        _count: {
          routineId: true,
        },
      })
    : ([] as Array<{ routineId: string; _count: { routineId: number } }>);

  const completionMap = new Map(
    completionCounts.map((item) => [item.routineId, item._count.routineId]),
  );

  const todayKey = getLocalDateKey(new Date());
  const todaySessions = routineIds.length
    ? await db.routineCompletionSession.findMany({
        where: {
          supportedUserId,
          routineId: {
            in: routineIds,
          },
          OR: [
            {
              completedAt: {
                gte: startOfLocalDay(),
              },
            },
            {
              startedAt: {
                gte: startOfLocalDay(),
              },
            },
          ],
        },
        select: {
          routineId: true,
          startedAt: true,
          completedAt: true,
        },
      })
    : [];

  const completionTodayMap = new Map<string, number>();

  for (const session of todaySessions) {
    const dateKey = getLocalDateKey(session.completedAt ?? session.startedAt);

    if (dateKey !== todayKey) {
      continue;
    }

    completionTodayMap.set(
      session.routineId,
      (completionTodayMap.get(session.routineId) ?? 0) + 1,
    );
  }

  return {
    linkedAt: new Date().toISOString(),
    deviceLinkId,
    supportedUser: {
      id: supportedUser.id,
      displayName: supportedUser.displayName,
      firstName: supportedUser.firstName,
      lastName: supportedUser.lastName,
      helperAudioUrl: supportedUser.helperAudioUrl
        ? toAbsoluteUrl(supportedUser.helperAudioUrl, baseUrl)
        : null,
      status: supportedUser.status,
    },
    routines: assignments.map((assignment) => ({
      assignmentId: assignment.id,
      routineId: assignment.routine.id,
      title: assignment.routine.title,
      description: assignment.routine.description,
      audioUrl: assignment.routine.audioUrl
        ? toAbsoluteUrl(assignment.routine.audioUrl, baseUrl)
        : null,
      status: assignment.routine.status,
      currentVersion: assignment.routine.currentVersion,
      completionCount: completionMap.get(assignment.routine.id) ?? 0,
      schedule: {
        type: assignment.scheduleType.toLowerCase(),
        timesPerDay: assignment.timesPerDay,
        daysOfWeek: assignment.daysOfWeek,
        scheduledTimes: getNormalizedScheduledTimes(assignment),
        completedDate:
          (completionTodayMap.get(assignment.routine.id) ?? 0) > 0 ? todayKey : null,
        completedCount: completionTodayMap.get(assignment.routine.id) ?? 0,
        completedSlots: getNormalizedScheduledTimes(assignment).slice(
          0,
          completionTodayMap.get(assignment.routine.id) ?? 0,
        ),
      },
      steps: assignment.routine.steps.map((step) => ({
        id: step.id,
        sortOrder: step.sortOrder,
        imageUrl: toAbsoluteUrl(step.imageUrl, baseUrl),
        audioUrl: step.audioUrl ? toAbsoluteUrl(step.audioUrl, baseUrl) : null,
        shortText: step.shortText,
      })),
    })),
  };
}

export const resultValueMap = {
  done: StepResultValue.DONE,
  not_done: StepResultValue.NOT_DONE,
} as const;
