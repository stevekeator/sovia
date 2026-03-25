"use server";

import {
  AdminRole,
  BillingStatus,
  DeviceLinkStatus,
  ImageSourceType,
  RoutineScheduleType,
  RoutineStatus,
  SubscriptionCycle,
  SubscriptionTier,
  SupportedUserStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signOut } from "@/auth";
import { hashPassword } from "@/lib/auth/password";
import {
  getRoutineLimitForTier,
  getRoutineStepLimitForTier,
  getVoicePromptLimitForTier,
  premiumFeatureMessages,
} from "@/lib/billing/subscription-plans";
import { isPlatformAdmin, requirePortalAccess } from "@/lib/auth/session";
import { createPairingCode } from "@/lib/device-auth";
import { prisma } from "@/lib/prisma";
import { persistAudioUpload, persistImageUpload } from "@/lib/storage";
import { buildDefaultScheduledTimes, routineScheduleDayOptions } from "@/lib/utils";

function ensureActorOrganizationId(user: Awaited<ReturnType<typeof requirePortalAccess>>) {
  if (!user.organizationId) {
    throw new Error("This action requires an organization-scoped admin.");
  }

  return user.organizationId;
}

async function getScopedSupportedUser(
  user: Awaited<ReturnType<typeof requirePortalAccess>>,
  supportedUserId: string,
) {
  const supportedUser = await prisma.supportedUser.findFirst({
    where: {
      id: supportedUserId,
      ...(isPlatformAdmin(user.role)
        ? {}
        : {
            organizationId: ensureActorOrganizationId(user),
          }),
    },
  });

  if (!supportedUser) {
    throw new Error("Supported user not found.");
  }

  return supportedUser;
}

async function getScopedRoutine(
  user: Awaited<ReturnType<typeof requirePortalAccess>>,
  routineId: string,
) {
  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      ...(isPlatformAdmin(user.role)
        ? {}
        : {
            organizationId: ensureActorOrganizationId(user),
          }),
    },
  });

  if (!routine) {
    throw new Error("Routine not found.");
  }

  return routine;
}

async function assertRoutineStepLimit(
  organizationId: string,
  routineId: string,
  pendingStepCount = 1,
) {
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: {
      subscriptionTier: true,
    },
  });
  const maxStepsPerRoutine = getRoutineStepLimitForTier(organization.subscriptionTier);

  if (!maxStepsPerRoutine) {
    return;
  }

  const existingStepCount = routineId
    ? await prisma.routineStep.count({
        where: {
          routineId,
        },
      })
    : 0;

  if (existingStepCount + pendingStepCount > maxStepsPerRoutine) {
    throw new Error(
      `${premiumFeatureMessages.freeRoutineStepCapReached}. ${premiumFeatureMessages.upgradeForLongerRoutines}.`,
    );
  }
}

async function assertRoutineCountLimit(organizationId: string, pendingRoutineCount = 1) {
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: {
      subscriptionTier: true,
    },
  });
  const maxRoutines = getRoutineLimitForTier(organization.subscriptionTier);

  if (!maxRoutines) {
    return;
  }

  const existingRoutineCount = await prisma.routine.count({
    where: {
      organizationId,
      status: {
        not: RoutineStatus.ARCHIVED,
      },
    },
  });

  if (existingRoutineCount + pendingRoutineCount > maxRoutines) {
    throw new Error(
      `${premiumFeatureMessages.freeRoutineCapReached}. ${premiumFeatureMessages.upgradeForMoreRoutines}.`,
    );
  }
}

async function assertVoicePromptLimit(organizationId: string, pendingVoicePromptCount = 1) {
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: {
      subscriptionTier: true,
    },
  });
  const maxVoicePromptsTotal = getVoicePromptLimitForTier(organization.subscriptionTier);

  if (!maxVoicePromptsTotal) {
    return;
  }

  const [helperPromptCount, routinePromptCount, stepPromptCount] = await Promise.all([
    prisma.supportedUser.count({
      where: {
        organizationId,
        helperAudioUrl: {
          not: null,
        },
      },
    }),
    prisma.routine.count({
      where: {
        organizationId,
        audioUrl: {
          not: null,
        },
      },
    }),
    prisma.routineStep.count({
      where: {
        audioUrl: {
          not: null,
        },
        routine: {
          organizationId,
        },
      },
    }),
  ]);

  if (helperPromptCount + routinePromptCount + stepPromptCount + pendingVoicePromptCount > maxVoicePromptsTotal) {
    throw new Error(
      `${premiumFeatureMessages.freeVoicePromptCapReached}. ${premiumFeatureMessages.upgradeForUnlimitedVoice}.`,
    );
  }
}

async function bumpRoutineVersionIfPublished(routineId: string) {
  const routine = await prisma.routine.findUniqueOrThrow({
    where: { id: routineId },
    select: {
      status: true,
    },
  });

  if (routine.status === RoutineStatus.PUBLISHED) {
    await prisma.routine.update({
      where: { id: routineId },
      data: {
        currentVersion: {
          increment: 1,
        },
      },
    });
  }
}

const demoRequestSchema = z.object({
  organizationName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  estimatedUserCount: z.string().optional(),
  message: z.string().min(10),
});

const supportedUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  displayName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  status: z.nativeEnum(SupportedUserStatus).default(SupportedUserStatus.ACTIVE),
});

const routineSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
});

const routineStepSchema = z.object({
  routineId: z.string().min(1),
  shortText: z.string().optional(),
  externalImageUrl: z.string().url().optional().or(z.literal("")),
});

const createAdminSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(AdminRole),
});

const assignmentScheduleSchema = z.object({
  scheduleType: z.nativeEnum(RoutineScheduleType).default(RoutineScheduleType.DAILY),
  timesPerDay: z.coerce.number().int().min(1).max(12).optional(),
  daysOfWeek: z.array(z.enum(routineScheduleDayOptions)).default([]),
  scheduledTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).default([]),
});

function parseAssignmentSchedule(formData: FormData) {
  const schedule = assignmentScheduleSchema.parse({
    scheduleType: formData.get("scheduleType") || RoutineScheduleType.DAILY,
    timesPerDay: formData.get("timesPerDay") || undefined,
    daysOfWeek: formData.getAll("daysOfWeek"),
    scheduledTimes: formData
      .getAll("scheduledTimes")
      .map((value) => (typeof value === "string" ? value.trim() : "")),
  });

  const scheduledTimes = Array.from(
    new Set(schedule.scheduledTimes.filter((value) => value.length > 0)),
  ).sort();
  const normalizedScheduledTimes = scheduledTimes.length
    ? scheduledTimes
    : buildDefaultScheduledTimes(schedule.timesPerDay ?? 1);

  return {
    ...schedule,
    daysOfWeek: schedule.scheduleType === RoutineScheduleType.WEEKLY ? schedule.daysOfWeek : [],
    scheduledTimes: normalizedScheduledTimes,
    timesPerDay: normalizedScheduledTimes.length,
  };
}

function parseRequestedSubscriptionTier(value: FormDataEntryValue | null) {
  switch (value) {
    case "free":
    case "Free":
      return SubscriptionTier.FREE;
    case "individual":
    case "Individual":
      return SubscriptionTier.INDIVIDUAL;
    case "family-care-team":
    case "Family / Care Team":
      return SubscriptionTier.FAMILY_CARE_TEAM;
    case "enterprise":
    case "Enterprise":
      return SubscriptionTier.ENTERPRISE;
    default:
      return undefined;
  }
}

function parseRequestedSubscriptionCycle(value: FormDataEntryValue | null) {
  switch (value) {
    case "monthly":
      return SubscriptionCycle.MONTHLY;
    case "yearly":
      return SubscriptionCycle.YEARLY;
    case "custom":
      return SubscriptionCycle.CUSTOM;
    default:
      return undefined;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function submitDemoRequestAction(formData: FormData) {
  const parsed = demoRequestSchema.parse({
    organizationName: formData.get("organizationName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    estimatedUserCount: formData.get("estimatedUserCount") || undefined,
    message: formData.get("message"),
  });
  const redirectTo = z.string().optional().parse(
    (formData.get("redirectTo") as string | null) || undefined,
  );
  const subscriptionPlan = z.string().optional().parse(
    (formData.get("subscriptionPlan") as string | null) || undefined,
  );
  const billingCycle = z.string().optional().parse(
    (formData.get("billingCycle") as string | null) || undefined,
  );
  const checkoutNotes = z.string().optional().parse(
    (formData.get("checkoutNotes") as string | null) || undefined,
  );
  const requestedSubscriptionTier = parseRequestedSubscriptionTier(formData.get("subscriptionPlan"));
  const requestedSubscriptionCycle = parseRequestedSubscriptionCycle(formData.get("billingCycle"));
  const messageParts = [
    parsed.message,
    subscriptionPlan ? `Plan: ${subscriptionPlan}` : null,
    billingCycle ? `Billing: ${billingCycle}` : null,
    checkoutNotes ? `Notes: ${checkoutNotes}` : null,
  ].filter(Boolean);

  await prisma.demoRequest.create({
    data: {
      organizationName: parsed.organizationName,
      contactName: parsed.contactName,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone,
      estimatedUserCount: parsed.estimatedUserCount
        ? Number(parsed.estimatedUserCount)
        : undefined,
      requestedSubscriptionTier,
      requestedSubscriptionCycle,
      message: messageParts.join("\n"),
    },
  });

  redirect(redirectTo ?? "/contact?submitted=1");
}

export async function createSupportedUserAction(formData: FormData) {
  const user = await requirePortalAccess();
  const organizationId = ensureActorOrganizationId(user);
  const parsed = supportedUserSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    displayName: formData.get("displayName"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    status: formData.get("status") || SupportedUserStatus.ACTIVE,
  });

  await prisma.supportedUser.create({
    data: {
      organizationId,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      displayName: parsed.displayName,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : undefined,
      status: parsed.status,
    },
  });

  revalidatePath("/portal/users");
}

export async function updateSupportedUserAction(formData: FormData) {
  const user = await requirePortalAccess();
  const supportedUserId = z.string().parse(formData.get("supportedUserId"));
  const supportedUser = await getScopedSupportedUser(user, supportedUserId);
  const parsed = supportedUserSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    displayName: formData.get("displayName"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    status: formData.get("status") || supportedUser.status,
  });

  await prisma.supportedUser.update({
    where: {
      id: supportedUser.id,
    },
    data: {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      displayName: parsed.displayName,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      status: parsed.status,
    },
  });

  revalidatePath("/portal/users");
  revalidatePath(`/portal/users/${supportedUser.id}`);
}

export async function updateSupportedUserHelperAudioAction(formData: FormData) {
  const user = await requirePortalAccess();
  const supportedUserId = z.string().parse(formData.get("supportedUserId"));
  const supportedUser = await getScopedSupportedUser(user, supportedUserId);
  const audioFile = formData.get("helperAudioFile");
  const clearAudio = formData.get("clearHelperAudio") === "true";

  let helperAudioUrl = supportedUser.helperAudioUrl;

  if (clearAudio) {
    helperAudioUrl = null;
  } else if (audioFile instanceof File && audioFile.size > 0) {
    if (!supportedUser.helperAudioUrl) {
      await assertVoicePromptLimit(supportedUser.organizationId);
    }
    helperAudioUrl = await persistAudioUpload(audioFile);
  }

  await prisma.supportedUser.update({
    where: { id: supportedUser.id },
    data: {
      helperAudioUrl,
    },
  });

  revalidatePath("/portal/users");
  revalidatePath(`/portal/users/${supportedUser.id}`);
}

export async function createRoutineAction(formData: FormData) {
  const user = await requirePortalAccess();
  const organizationId = ensureActorOrganizationId(user);
  const parsed = routineSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  await assertRoutineCountLimit(organizationId);

  const routine = await prisma.routine.create({
    data: {
      organizationId,
      title: parsed.title,
      description: parsed.description,
      createdById: user.id,
    },
  });

  redirect(`/portal/routines/${routine.id}`);
}

export async function updateRoutineAction(formData: FormData) {
  const user = await requirePortalAccess();
  const routineId = z.string().parse(formData.get("routineId"));
  const routine = await getScopedRoutine(user, routineId);
  const parsed = routineSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  await prisma.routine.update({
    where: { id: routine.id },
    data: {
      title: parsed.title,
      description: parsed.description,
    },
  });

  revalidatePath("/portal/routines");
  revalidatePath(`/portal/routines/${routine.id}`);
}

export async function updateRoutineAudioAction(formData: FormData) {
  const user = await requirePortalAccess();
  const routineId = z.string().parse(formData.get("routineId"));
  const routine = await getScopedRoutine(user, routineId);
  const audioFile = formData.get("audioFile");
  const clearAudio = formData.get("clearAudio") === "true";

  let audioUrl = routine.audioUrl;

  if (clearAudio) {
    audioUrl = null;
  } else if (audioFile instanceof File && audioFile.size > 0) {
    if (!routine.audioUrl) {
      await assertVoicePromptLimit(routine.organizationId);
    }
    audioUrl = await persistAudioUpload(audioFile);
  }

  await prisma.routine.update({
    where: { id: routine.id },
    data: {
      audioUrl,
    },
  });

  await bumpRoutineVersionIfPublished(routine.id);
  revalidatePath("/portal/routines");
  revalidatePath(`/portal/routines/${routine.id}`);
}

export async function addRoutineStepAction(formData: FormData) {
  const user = await requirePortalAccess();
  const parsed = routineStepSchema.parse({
    routineId: formData.get("routineId"),
    shortText: formData.get("shortText") || undefined,
    externalImageUrl: formData.get("externalImageUrl") || "",
  });
  const routine = await getScopedRoutine(user, parsed.routineId);
  await assertRoutineStepLimit(routine.organizationId, routine.id);
  const imageFile = formData.get("imageFile");
  const audioFile = formData.get("audioFile");
  let imageUrl: string | null = null;
  let imageSourceType: ImageSourceType = ImageSourceType.UPLOADED;
  const audioUrl = audioFile instanceof File && audioFile.size > 0
    ? (await assertVoicePromptLimit(routine.organizationId), await persistAudioUpload(audioFile))
    : null;

  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await persistImageUpload(imageFile);
  } else if (parsed.externalImageUrl) {
    imageUrl = parsed.externalImageUrl;
    imageSourceType = ImageSourceType.EXTERNAL_PUBLIC_DOMAIN;
  }

  if (!imageUrl) {
    throw new Error("A step image is required.");
  }

  const lastStep = await prisma.routineStep.findFirst({
    where: {
      routineId: routine.id,
    },
    orderBy: {
      sortOrder: "desc",
    },
  });

  await prisma.routineStep.create({
    data: {
      routineId: routine.id,
      sortOrder: (lastStep?.sortOrder ?? 0) + 1,
      shortText: parsed.shortText,
      imageUrl,
      audioUrl,
      imageSourceType,
      imageSourceMetadata:
        imageSourceType === ImageSourceType.EXTERNAL_PUBLIC_DOMAIN
          ? JSON.stringify({ sourceUrl: parsed.externalImageUrl })
          : null,
    },
  });

  await bumpRoutineVersionIfPublished(routine.id);
  revalidatePath(`/portal/routines/${routine.id}`);
}

export async function updateRoutineStepAction(formData: FormData) {
  const user = await requirePortalAccess();
  const stepId = z.string().parse(formData.get("stepId"));
  const step = await prisma.routineStep.findUnique({
    where: { id: stepId },
    include: { routine: true },
  });

  if (!step) {
    throw new Error("Routine step not found.");
  }

  await getScopedRoutine(user, step.routineId);

  const imageFile = formData.get("imageFile");
  const audioFile = formData.get("audioFile");
  const clearAudio = formData.get("clearAudio") === "true";
  const externalImageUrl = z.string().optional().parse(
    (formData.get("externalImageUrl") as string | null) || undefined,
  );

  let imageUrl = step.imageUrl;
  let imageSourceType: ImageSourceType = step.imageSourceType;
  let imageSourceMetadata = step.imageSourceMetadata;
  let audioUrl = step.audioUrl;

  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = (await persistImageUpload(imageFile)) ?? step.imageUrl;
    imageSourceType = ImageSourceType.UPLOADED;
    imageSourceMetadata = null;
  } else if (externalImageUrl) {
    imageUrl = externalImageUrl;
    imageSourceType = ImageSourceType.EXTERNAL_PUBLIC_DOMAIN;
    imageSourceMetadata = JSON.stringify({ sourceUrl: externalImageUrl });
  }

  if (clearAudio) {
    audioUrl = null;
  } else if (audioFile instanceof File && audioFile.size > 0) {
    if (!step.audioUrl) {
      await assertVoicePromptLimit(step.routine.organizationId);
    }
    audioUrl = await persistAudioUpload(audioFile);
  }

  await prisma.routineStep.update({
    where: { id: step.id },
    data: {
      shortText: (formData.get("shortText") as string | null) || null,
      imageUrl,
      audioUrl,
      imageSourceType,
      imageSourceMetadata,
    },
  });

  await bumpRoutineVersionIfPublished(step.routineId);
  revalidatePath(`/portal/routines/${step.routineId}`);
}

export async function deleteRoutineStepAction(formData: FormData) {
  const user = await requirePortalAccess();
  const stepId = z.string().parse(formData.get("stepId"));
  const step = await prisma.routineStep.findUnique({
    where: { id: stepId },
  });

  if (!step) {
    throw new Error("Routine step not found.");
  }

  await getScopedRoutine(user, step.routineId);

  await prisma.$transaction(async (tx) => {
    await tx.routineStep.delete({
      where: { id: step.id },
    });

    const remaining = await tx.routineStep.findMany({
      where: { routineId: step.routineId },
      orderBy: { sortOrder: "asc" },
    });

    await Promise.all(
      remaining.map((item, index) =>
        tx.routineStep.update({
          where: { id: item.id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
  });

  await bumpRoutineVersionIfPublished(step.routineId);
  revalidatePath(`/portal/routines/${step.routineId}`);
}

export async function moveRoutineStepAction(formData: FormData) {
  const user = await requirePortalAccess();
  const stepId = z.string().parse(formData.get("stepId"));
  const direction = z.enum(["up", "down"]).parse(formData.get("direction"));
  const step = await prisma.routineStep.findUnique({
    where: { id: stepId },
  });

  if (!step) {
    throw new Error("Routine step not found.");
  }

  await getScopedRoutine(user, step.routineId);

  const target = await prisma.routineStep.findFirst({
    where: {
      routineId: step.routineId,
      sortOrder: direction === "up" ? { lt: step.sortOrder } : { gt: step.sortOrder },
    },
    orderBy: {
      sortOrder: direction === "up" ? "desc" : "asc",
    },
  });

  if (!target) {
    return;
  }

  await prisma.$transaction([
    prisma.routineStep.update({
      where: { id: step.id },
      data: { sortOrder: target.sortOrder },
    }),
    prisma.routineStep.update({
      where: { id: target.id },
      data: { sortOrder: step.sortOrder },
    }),
  ]);

  await bumpRoutineVersionIfPublished(step.routineId);
  revalidatePath(`/portal/routines/${step.routineId}`);
}

export async function publishRoutineAction(formData: FormData) {
  const user = await requirePortalAccess();
  const routineId = z.string().parse(formData.get("routineId"));
  const routine = await getScopedRoutine(user, routineId);

  await prisma.routine.update({
    where: { id: routine.id },
    data: {
      status: RoutineStatus.PUBLISHED,
      currentVersion: {
        increment: 1,
      },
    },
  });

  revalidatePath("/portal/routines");
  revalidatePath(`/portal/routines/${routine.id}`);
}

export async function archiveRoutineAction(formData: FormData) {
  const user = await requirePortalAccess();
  const routineId = z.string().parse(formData.get("routineId"));
  const routine = await getScopedRoutine(user, routineId);

  await prisma.routine.update({
    where: { id: routine.id },
    data: {
      status: RoutineStatus.ARCHIVED,
    },
  });

  revalidatePath("/portal/routines");
  revalidatePath(`/portal/routines/${routine.id}`);
}

export async function duplicateRoutineAction(formData: FormData) {
  const user = await requirePortalAccess();
  const routineId = z.string().parse(formData.get("routineId"));
  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      ...(isPlatformAdmin(user.role)
        ? {}
        : { organizationId: ensureActorOrganizationId(user) }),
    },
    include: {
      steps: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!routine) {
    throw new Error("Routine not found.");
  }

  await assertRoutineCountLimit(routine.organizationId);
  await assertRoutineStepLimit(routine.organizationId, "", routine.steps.length);
  const duplicatedVoicePromptCount =
    (routine.audioUrl ? 1 : 0) + routine.steps.filter((step) => step.audioUrl).length;

  if (duplicatedVoicePromptCount > 0) {
    await assertVoicePromptLimit(routine.organizationId, duplicatedVoicePromptCount);
  }

  const copy = await prisma.routine.create({
    data: {
      organizationId: routine.organizationId,
      createdById: user.id,
      title: `${routine.title} Copy`,
      description: routine.description,
      status: RoutineStatus.DRAFT,
      currentVersion: 1,
      steps: {
        create: routine.steps.map((step) => ({
          sortOrder: step.sortOrder,
          imageUrl: step.imageUrl,
          audioUrl: step.audioUrl,
          imageSourceType: step.imageSourceType,
          imageSourceMetadata: step.imageSourceMetadata,
          shortText: step.shortText,
        })),
      },
    },
  });

  redirect(`/portal/routines/${copy.id}`);
}

export async function assignRoutineAction(formData: FormData) {
  const user = await requirePortalAccess();
  const routineId = z.string().parse(formData.get("routineId"));
  const supportedUserId = z.string().parse(formData.get("supportedUserId"));
  const schedule = parseAssignmentSchedule(formData);

  const [routine, supportedUser] = await Promise.all([
    getScopedRoutine(user, routineId),
    getScopedSupportedUser(user, supportedUserId),
  ]);

  await prisma.routineAssignment.upsert({
    where: {
      routineId_supportedUserId: {
        routineId: routine.id,
        supportedUserId: supportedUser.id,
      },
    },
    update: {
      active: true,
      assignedAt: new Date(),
      scheduleType: schedule.scheduleType,
      timesPerDay: schedule.timesPerDay,
      daysOfWeek: schedule.daysOfWeek,
      scheduledTimes: schedule.scheduledTimes,
    },
    create: {
      routineId: routine.id,
      supportedUserId: supportedUser.id,
      active: true,
      scheduleType: schedule.scheduleType,
      timesPerDay: schedule.timesPerDay,
      daysOfWeek: schedule.daysOfWeek,
      scheduledTimes: schedule.scheduledTimes,
    },
  });

  revalidatePath("/portal/assignments");
  revalidatePath(`/portal/routines/${routine.id}`);
  revalidatePath(`/portal/users/${supportedUser.id}`);
}

export async function updateAssignmentScheduleAction(formData: FormData) {
  const user = await requirePortalAccess();
  const assignmentId = z.string().parse(formData.get("assignmentId"));
  const schedule = parseAssignmentSchedule(formData);

  const assignment = await prisma.routineAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      routine: true,
      supportedUser: true,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  await getScopedRoutine(user, assignment.routineId);

  await prisma.routineAssignment.update({
    where: { id: assignment.id },
    data: {
      scheduleType: schedule.scheduleType,
      timesPerDay: schedule.timesPerDay,
      daysOfWeek: schedule.daysOfWeek,
      scheduledTimes: schedule.scheduledTimes,
    },
  });

  revalidatePath("/portal/assignments");
  revalidatePath(`/portal/routines/${assignment.routineId}`);
  revalidatePath(`/portal/users/${assignment.supportedUserId}`);
}

export async function removeAssignmentAction(formData: FormData) {
  const user = await requirePortalAccess();
  const assignmentId = z.string().parse(formData.get("assignmentId"));
  const assignment = await prisma.routineAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      routine: true,
      supportedUser: true,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  await getScopedRoutine(user, assignment.routineId);
  await prisma.routineAssignment.update({
    where: { id: assignment.id },
    data: {
      active: false,
    },
  });

  revalidatePath("/portal/assignments");
  revalidatePath(`/portal/routines/${assignment.routineId}`);
  revalidatePath(`/portal/users/${assignment.supportedUserId}`);
}

export async function createPairingCodeAction(formData: FormData) {
  const user = await requirePortalAccess();
  const supportedUserId = z.string().parse(formData.get("supportedUserId"));
  const supportedUser = await getScopedSupportedUser(user, supportedUserId);

  await prisma.deviceLink.deleteMany({
    where: {
      supportedUserId: supportedUser.id,
      status: DeviceLinkStatus.PENDING,
    },
  });

  let pairingCode = createPairingCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await prisma.deviceLink.findUnique({
      where: { pairingCode },
    });

    if (!existing) {
      break;
    }

    pairingCode = createPairingCode();
  }

  await prisma.deviceLink.create({
    data: {
      organizationId: supportedUser.organizationId,
      supportedUserId: supportedUser.id,
      pairingCode,
      pairingExpiresAt: new Date(Date.now() + 1000 * 60 * 15),
      status: DeviceLinkStatus.PENDING,
    },
  });

  revalidatePath(`/portal/users/${supportedUser.id}`);
}

export async function revokeDeviceLinkAction(formData: FormData) {
  const user = await requirePortalAccess();
  const deviceLinkId = z.string().parse(formData.get("deviceLinkId"));
  const deviceLink = await prisma.deviceLink.findUnique({
    where: { id: deviceLinkId },
  });

  if (!deviceLink) {
    throw new Error("Device link not found.");
  }

  await getScopedSupportedUser(user, deviceLink.supportedUserId);
  await prisma.deviceLink.update({
    where: { id: deviceLink.id },
    data: {
      status: DeviceLinkStatus.REVOKED,
      revokedAt: new Date(),
      pairingCode: null,
      pairingExpiresAt: null,
      authTokenHash: null,
    },
  });

  revalidatePath(`/portal/users/${deviceLink.supportedUserId}`);
}

export async function createAdminAction(formData: FormData) {
  const user = await requirePortalAccess();
  const organizationId = ensureActorOrganizationId(user);
  const profilePhotoFile = formData.get("profilePhotoFile");
  const parsed = createAdminSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (parsed.role === AdminRole.SUPER_ADMIN && !isPlatformAdmin(user.role)) {
    throw new Error("Only platform admins can create platform admin accounts.");
  }

  const profilePhotoUrl =
    profilePhotoFile instanceof File && profilePhotoFile.size > 0
      ? await persistImageUpload(profilePhotoFile)
      : null;

  await prisma.adminUser.create({
    data: {
      organizationId,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email.toLowerCase(),
      profilePhotoUrl,
      passwordHash: await hashPassword(parsed.password),
      role: parsed.role,
    },
  });

  revalidatePath("/portal/settings");
}

export async function updateAdminProfilePhotoAction(formData: FormData) {
  const user = await requirePortalAccess();
  const adminUserId = z.string().parse(formData.get("adminUserId"));
  const photoFile = formData.get("profilePhotoFile");
  const clearPhoto = formData.get("clearProfilePhoto") === "true";

  const admin = await prisma.adminUser.findFirst({
    where: {
      id: adminUserId,
      ...(isPlatformAdmin(user.role)
        ? {}
        : {
            organizationId: ensureActorOrganizationId(user),
          }),
    },
  });

  if (!admin) {
    throw new Error("Admin user not found.");
  }

  let profilePhotoUrl = admin.profilePhotoUrl;

  if (clearPhoto) {
    profilePhotoUrl = null;
  } else if (photoFile instanceof File && photoFile.size > 0) {
    profilePhotoUrl = await persistImageUpload(photoFile);
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      profilePhotoUrl,
    },
  });

  revalidatePath("/portal/settings");
  revalidatePath("/portal");
}

export async function updateOrganizationStatusAction(formData: FormData) {
  const user = await requirePortalAccess();

  if (!isPlatformAdmin(user.role)) {
    throw new Error("Only platform admins can change subscription controls.");
  }

  const organizationId = z.string().parse(formData.get("organizationId"));
  const billingStatus = z.nativeEnum(BillingStatus).parse(formData.get("billingStatus"));
  const subscriptionTier = z.nativeEnum(SubscriptionTier).parse(formData.get("subscriptionTier"));
  const subscriptionCycle = z.nativeEnum(SubscriptionCycle).parse(formData.get("subscriptionCycle"));

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      billingStatus,
      subscriptionTier,
      subscriptionCycle,
    },
  });

  revalidatePath("/portal/settings");
  revalidatePath("/portal");
}
