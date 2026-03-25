import { AdminRole, BillingStatus, DeviceLinkStatus, ImageSourceType, RoutineScheduleType, RoutineStatus, StepResultValue, SupportedUserStatus, SyncStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  await prisma.routineCompletionStepResult.deleteMany();
  await prisma.routineCompletionSession.deleteMany();
  await prisma.deviceLink.deleteMany();
  await prisma.routineAssignment.deleteMany();
  await prisma.routineStep.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.supportedUser.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.demoRequest.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      name: "Sunrise Support Collective",
      slug: "sunrise-support",
      billingStatus: BillingStatus.ACTIVE,
    },
  });

  const [adminPassword, caregiverPassword, superAdminPassword] = await Promise.all([
    hashPassword("demo-admin-123"),
    hashPassword("demo-caregiver-123"),
    hashPassword("super-admin-123"),
  ]);

  const admin = await prisma.adminUser.create({
    data: {
      organizationId: organization.id,
      firstName: "Avery",
      lastName: "Morgan",
      email: "avery@sunrisecare.test",
      passwordHash: adminPassword,
      role: AdminRole.ORG_ADMIN,
    },
  });

  await prisma.adminUser.create({
    data: {
      organizationId: organization.id,
      firstName: "Jordan",
      lastName: "Lee",
      email: "jordan@sunrisecare.test",
      passwordHash: caregiverPassword,
      role: AdminRole.CAREGIVER,
    },
  });

  await prisma.adminUser.create({
    data: {
      firstName: "Morgan",
      lastName: "Quinn",
      email: "super@visualroutine.test",
      passwordHash: superAdminPassword,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const supportedUsers = await Promise.all([
    prisma.supportedUser.create({
      data: {
        organizationId: organization.id,
        firstName: "Elliot",
        lastName: "Stone",
        displayName: "Elliot",
        status: SupportedUserStatus.ACTIVE,
      },
    }),
    prisma.supportedUser.create({
      data: {
        organizationId: organization.id,
        firstName: "Maya",
        lastName: "Brooks",
        displayName: "Maya",
        status: SupportedUserStatus.ACTIVE,
      },
    }),
  ]);

  const morningRoutine = await prisma.routine.create({
    data: {
      organizationId: organization.id,
      title: "Morning Reset",
      description: "A calm, image-led start to the day.",
      status: RoutineStatus.PUBLISHED,
      currentVersion: 3,
      createdById: admin.id,
      steps: {
        create: [
          {
            sortOrder: 1,
            imageUrl: "/demo-images/brush-teeth.jpg",
            imageSourceType: ImageSourceType.UPLOADED,
            shortText: "Brush teeth",
          },
          {
            sortOrder: 2,
            imageUrl: "/demo-images/wash-face.svg",
            imageSourceType: ImageSourceType.UPLOADED,
            shortText: "Wash face",
          },
          {
            sortOrder: 3,
            imageUrl: "/demo-images/get-dressed.svg",
            imageSourceType: ImageSourceType.UPLOADED,
            shortText: "Get dressed",
          },
        ],
      },
    },
    include: {
      steps: true,
    },
  });

  const lunchRoutine = await prisma.routine.create({
    data: {
      organizationId: organization.id,
      title: "Lunch Clean-Up",
      description: "A short post-meal routine with simple visual prompts.",
      status: RoutineStatus.PUBLISHED,
      currentVersion: 2,
      createdById: admin.id,
      steps: {
        create: [
          {
            sortOrder: 1,
            imageUrl: "/demo-images/clear-table.svg",
            imageSourceType: ImageSourceType.UPLOADED,
            shortText: "Clear the table",
          },
          {
            sortOrder: 2,
            imageUrl: "/demo-images/throw-away.svg",
            imageSourceType: ImageSourceType.UPLOADED,
            shortText: "Throw trash away",
          },
          {
            sortOrder: 3,
            imageUrl: "/demo-images/wash-hands.svg",
            imageSourceType: ImageSourceType.UPLOADED,
            shortText: "Wash hands",
          },
        ],
      },
    },
  });

  await prisma.routineAssignment.createMany({
    data: [
      {
        routineId: morningRoutine.id,
        supportedUserId: supportedUsers[0].id,
        active: true,
        scheduleType: RoutineScheduleType.DAILY,
        timesPerDay: 1,
        daysOfWeek: [],
      },
      {
        routineId: lunchRoutine.id,
        supportedUserId: supportedUsers[0].id,
        active: true,
        scheduleType: RoutineScheduleType.WEEKLY,
        timesPerDay: 1,
        daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      },
      {
        routineId: morningRoutine.id,
        supportedUserId: supportedUsers[1].id,
        active: true,
        scheduleType: RoutineScheduleType.DAILY,
        timesPerDay: 2,
        daysOfWeek: [],
      },
    ],
  });

  await prisma.deviceLink.create({
    data: {
      organizationId: organization.id,
      supportedUserId: supportedUsers[0].id,
      deviceName: "Elliot iPad",
      pairingCode: "482913",
      status: DeviceLinkStatus.LINKED,
      linkedAt: new Date(),
      authTokenHash: "demo-linked-device",
      lastSyncedAt: new Date(),
    },
  });

  const completionSession = await prisma.routineCompletionSession.create({
    data: {
      supportedUserId: supportedUsers[0].id,
      routineId: morningRoutine.id,
      routineVersion: morningRoutine.currentVersion,
      startedAt: new Date(Date.now() - 1000 * 60 * 45),
      completedAt: new Date(Date.now() - 1000 * 60 * 40),
      syncStatus: SyncStatus.SYNCED,
    },
  });

  await prisma.routineCompletionStepResult.createMany({
    data: morningRoutine.steps.map((step, index) => ({
      sessionId: completionSession.id,
      routineStepId: step.id,
      result: index === 1 ? StepResultValue.NOT_DONE : StepResultValue.DONE,
      respondedAt: new Date(Date.now() - 1000 * 60 * (44 - index)),
    })),
  });

  await prisma.demoRequest.create({
    data: {
      organizationId: organization.id,
      organizationName: "Cedar Grove Services",
      contactName: "Nina Patel",
      email: "nina@cedargrove.test",
      estimatedUserCount: 24,
      message: "Looking for a routine tool that works across multiple homes.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
