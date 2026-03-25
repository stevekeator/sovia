import { DeviceLinkStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildMobilePayload, createDeviceToken, hashDeviceToken } from "@/lib/device-auth";
import { prisma } from "@/lib/prisma";

const linkSchema = z.object({
  pairingCode: z.string().trim().length(6),
  deviceName: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const json = await request.json();
    const parsed = linkSchema.parse(json);
    const pairingCode = parsed.pairingCode;

    const deviceLink = await prisma.deviceLink.findFirst({
      where: {
        pairingCode,
        status: DeviceLinkStatus.PENDING,
        pairingExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!deviceLink) {
      return NextResponse.json(
        { error: "Pairing code is invalid or has expired." },
        { status: 404 },
      );
    }

    const rawDeviceToken = createDeviceToken();
    const authTokenHash = hashDeviceToken(rawDeviceToken);

    const linkedDevice = await prisma.deviceLink.update({
      where: {
        id: deviceLink.id,
      },
      data: {
        deviceName: parsed.deviceName || "Linked mobile device",
        authTokenHash,
        linkedAt: new Date(),
        lastSyncedAt: new Date(),
        pairingCode: null,
        pairingExpiresAt: null,
        status: DeviceLinkStatus.LINKED,
      },
    });

    const payload = await buildMobilePayload(
      prisma,
      linkedDevice.supportedUserId,
      linkedDevice.id,
      origin,
    );

    return NextResponse.json({
      deviceToken: rawDeviceToken,
      payload,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to link device." }, { status: 400 });
  }
}
