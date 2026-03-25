import { DeviceLinkStatus, SyncStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getLinkedDeviceFromRequest, resultValueMap } from "@/lib/device-auth";
import { prisma } from "@/lib/prisma";

const sessionSchema = z.object({
  clientSessionId: z.string().min(1),
  routineId: z.string().min(1),
  routineVersion: z.number().int().positive(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
  stepResults: z
    .array(
      z.object({
        routineStepId: z.string().min(1),
        result: z.enum(["done", "not_done"]),
        respondedAt: z.string().datetime(),
      }),
    )
    .min(1),
});

const payloadSchema = z.object({
  sessions: z.array(sessionSchema),
});

export async function POST(request: Request) {
  try {
    const linkedDevice = await getLinkedDeviceFromRequest(request);

    if (!linkedDevice || linkedDevice.status !== DeviceLinkStatus.LINKED) {
      return NextResponse.json({ error: "Unauthorized device." }, { status: 401 });
    }

    const json = await request.json();
    const parsed = payloadSchema.parse(json);
    let syncedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const session of parsed.sessions) {
        const existing = await tx.routineCompletionSession.findUnique({
          where: {
            clientSessionId: session.clientSessionId,
          },
        });

        if (existing) {
          continue;
        }

        const assignment = await tx.routineAssignment.findFirst({
          where: {
            routineId: session.routineId,
            supportedUserId: linkedDevice.supportedUserId,
            active: true,
          },
        });

        if (!assignment) {
          throw new Error("Routine is not assigned to this user.");
        }

        const routineStepIds = session.stepResults.map((step) => step.routineStepId);
        const validSteps = await tx.routineStep.count({
          where: {
            routineId: session.routineId,
            id: {
              in: routineStepIds,
            },
          },
        });

        if (validSteps !== routineStepIds.length) {
          throw new Error("Session contains invalid routine steps.");
        }

        const createdSession = await tx.routineCompletionSession.create({
          data: {
            clientSessionId: session.clientSessionId,
            supportedUserId: linkedDevice.supportedUserId,
            routineId: session.routineId,
            routineVersion: session.routineVersion,
            startedAt: new Date(session.startedAt),
            completedAt: session.completedAt ? new Date(session.completedAt) : null,
            sourceDeviceLinkId: linkedDevice.id,
            syncStatus: SyncStatus.SYNCED,
          },
        });

        await tx.routineCompletionStepResult.createMany({
          data: session.stepResults.map((step) => ({
            sessionId: createdSession.id,
            routineStepId: step.routineStepId,
            result: resultValueMap[step.result],
            respondedAt: new Date(step.respondedAt),
          })),
        });

        syncedCount += 1;
      }

      await tx.deviceLink.update({
        where: { id: linkedDevice.id },
        data: {
          lastSyncedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      ok: true,
      syncedCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to sync sessions." }, { status: 400 });
  }
}
