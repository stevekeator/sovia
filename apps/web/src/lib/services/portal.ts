import { AdminRole, RoutineStatus, SupportedUserStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/session";
import { getVoicePromptLimitForTier } from "@/lib/billing/subscription-plans";
import { prisma } from "@/lib/prisma";

type PortalUser = {
  id: string;
  role: AdminRole;
  organizationId: string | null;
};

function organizationWhere(user: PortalUser) {
  if (isPlatformAdmin(user.role)) {
    return {};
  }

  if (!user.organizationId) {
    return { id: "__missing_org__" };
  }

  return { id: user.organizationId };
}

function organizationIdWhere(user: PortalUser) {
  if (isPlatformAdmin(user.role)) {
    return {};
  }

  if (!user.organizationId) {
    return { organizationId: "__missing_org__" };
  }

  return { organizationId: user.organizationId };
}

async function deleteStalePendingDeviceLinks(user: PortalUser, supportedUserId?: string) {
  await prisma.deviceLink.deleteMany({
    where: {
      status: "PENDING",
      pairingExpiresAt: {
        lt: new Date(),
      },
      ...(supportedUserId ? { supportedUserId } : {}),
      ...(isPlatformAdmin(user.role)
        ? {}
        : {
            supportedUser: {
              organizationId: user.organizationId ?? "__missing_org__",
            },
          }),
    },
  });
}

async function getOrganizationVoicePromptUsage(organizationId: string) {
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: {
      subscriptionTier: true,
    },
  });

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

  return {
    used: helperPromptCount + routinePromptCount + stepPromptCount,
    limit: getVoicePromptLimitForTier(organization.subscriptionTier),
  };
}

export async function getOrganizations() {
  return prisma.organization.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getDashboardData(user: PortalUser) {
  const [organizations, supportedUserCount, activeRoutineCount, recentCompletions] =
    await Promise.all([
      prisma.organization.findMany({
        where: organizationWhere(user),
        orderBy: {
          name: "asc",
        },
      }),
      prisma.supportedUser.count({
        where: {
          ...organizationIdWhere(user),
          status: {
            not: SupportedUserStatus.ARCHIVED,
          },
        },
      }),
      prisma.routine.count({
        where: {
          ...organizationIdWhere(user),
          status: RoutineStatus.PUBLISHED,
        },
      }),
      prisma.routineCompletionSession.findMany({
        where:
          isPlatformAdmin(user.role)
            ? {}
            : {
                supportedUser: {
                  organizationId: user.organizationId ?? "__missing_org__",
                },
              },
        orderBy: {
          startedAt: "desc",
        },
        take: 6,
        include: {
          routine: true,
          supportedUser: true,
          stepResults: true,
        },
      }),
    ]);

  return {
    organizations,
    supportedUserCount,
    activeRoutineCount,
    recentCompletions,
  };
}

export async function listSupportedUsers(user: PortalUser) {
  await deleteStalePendingDeviceLinks(user);

  return prisma.supportedUser.findMany({
    where: organizationIdWhere(user),
    orderBy: [{ status: "asc" }, { displayName: "asc" }],
    include: {
      assignments: {
        where: {
          active: true,
        },
        include: {
          routine: true,
        },
      },
      deviceLinks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function getSupportedUserDetail(user: PortalUser, supportedUserId: string) {
  await deleteStalePendingDeviceLinks(user, supportedUserId);

  const supportedUser = await prisma.supportedUser.findFirst({
    where: {
      id: supportedUserId,
      ...organizationIdWhere(user),
    },
    include: {
      assignments: {
        include: {
          routine: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
      },
      deviceLinks: {
        orderBy: {
          createdAt: "desc",
        },
      },
      sessions: {
        orderBy: {
          startedAt: "desc",
        },
        take: 8,
        include: {
          routine: true,
          stepResults: true,
        },
      },
    },
  });

  if (!supportedUser) {
    notFound();
  }

  const voicePromptUsage = await getOrganizationVoicePromptUsage(supportedUser.organizationId);

  return {
    supportedUser,
    voicePromptUsage,
  };
}

export async function listRoutines(user: PortalUser) {
  return prisma.routine.findMany({
    where: organizationIdWhere(user),
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      steps: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      assignments: {
        where: {
          active: true,
        },
        include: {
          supportedUser: true,
        },
      },
      createdBy: true,
    },
  });
}

export async function getRoutineDetail(user: PortalUser, routineId: string) {
  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      ...organizationIdWhere(user),
    },
    include: {
      organization: {
        select: {
          subscriptionTier: true,
        },
      },
      steps: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      assignments: {
        include: {
          supportedUser: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
      },
      createdBy: true,
    },
  });

  if (!routine) {
    notFound();
  }

  const [supportedUsers, voicePromptUsage] = await Promise.all([
    prisma.supportedUser.findMany({
      where: organizationIdWhere(user),
      orderBy: {
        displayName: "asc",
      },
    }),
    getOrganizationVoicePromptUsage(routine.organizationId),
  ]);

  return {
    routine,
    supportedUsers,
    voicePromptUsage,
  };
}

export async function getAssignmentsView(user: PortalUser) {
  const [routines, supportedUsers, assignments] = await Promise.all([
    prisma.routine.findMany({
      where: {
        ...organizationIdWhere(user),
        status: {
          not: RoutineStatus.ARCHIVED,
        },
      },
      orderBy: {
        title: "asc",
      },
    }),
    prisma.supportedUser.findMany({
      where: {
        ...organizationIdWhere(user),
        status: {
          not: SupportedUserStatus.ARCHIVED,
        },
      },
      orderBy: {
        displayName: "asc",
      },
    }),
    prisma.routineAssignment.findMany({
      where:
        isPlatformAdmin(user.role)
          ? { active: true }
          : {
              active: true,
              supportedUser: {
                organizationId: user.organizationId ?? "__missing_org__",
              },
            },
      orderBy: {
        assignedAt: "desc",
      },
      include: {
        routine: true,
        supportedUser: true,
      },
    }),
  ]);

  return { routines, supportedUsers, assignments };
}

export async function getReportsView(
  user: PortalUser,
  filters: {
    supportedUserId?: string;
    routineId?: string;
    from?: string;
    to?: string;
  },
) {
  const [supportedUsers, routines, sessions] = await Promise.all([
    prisma.supportedUser.findMany({
      where: organizationIdWhere(user),
      orderBy: {
        displayName: "asc",
      },
    }),
    prisma.routine.findMany({
      where: organizationIdWhere(user),
      orderBy: {
        title: "asc",
      },
    }),
    prisma.routineCompletionSession.findMany({
      where: {
        ...(isPlatformAdmin(user.role)
          ? {}
          : {
              supportedUser: {
                organizationId: user.organizationId ?? "__missing_org__",
              },
            }),
        ...(filters.supportedUserId ? { supportedUserId: filters.supportedUserId } : {}),
        ...(filters.routineId ? { routineId: filters.routineId } : {}),
        ...(filters.from || filters.to
          ? {
              startedAt: {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
              },
            }
          : {}),
      },
      orderBy: {
        startedAt: "desc",
      },
      include: {
        routine: true,
        supportedUser: true,
        stepResults: {
          include: {
            routineStep: true,
          },
        },
      },
      take: 50,
    }),
  ]);

  return { supportedUsers, routines, sessions };
}

export async function getSettingsView(user: PortalUser) {
  const [organization, admins, organizations] = await Promise.all([
    user.organizationId
      ? prisma.organization.findUnique({
          where: {
            id: user.organizationId,
          },
        })
      : null,
    prisma.adminUser.findMany({
      where: organizationIdWhere(user),
      orderBy: [{ role: "asc" }, { lastName: "asc" }],
    }),
    getOrganizations(),
  ]);

  return {
    organization,
    admins,
    organizations,
  };
}
