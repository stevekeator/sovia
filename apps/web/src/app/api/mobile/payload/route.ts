import { NextResponse } from "next/server";

import { buildMobilePayload, getLinkedDeviceFromRequest } from "@/lib/device-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const linkedDevice = await getLinkedDeviceFromRequest(request);

  if (!linkedDevice) {
    return NextResponse.json({ error: "Unauthorized device." }, { status: 401 });
  }

  await prisma.deviceLink.update({
    where: { id: linkedDevice.id },
    data: { lastSyncedAt: new Date() },
  });

  const payload = await buildMobilePayload(
    prisma,
    linkedDevice.supportedUserId,
    linkedDevice.id,
    origin,
  );

  return NextResponse.json(payload);
}
