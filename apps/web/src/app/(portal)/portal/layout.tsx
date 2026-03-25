import type { ReactNode } from "react";

import { requirePortalAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/portal/portal-shell";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requirePortalAccess();
  const currentAdmin = await prisma.adminUser.findUnique({
    where: { id: user.id },
    select: {
      firstName: true,
      lastName: true,
      role: true,
      profilePhotoUrl: true,
    },
  });

  return (
    <PortalShell
      user={{
        firstName: currentAdmin?.firstName ?? user.firstName,
        lastName: currentAdmin?.lastName ?? user.lastName,
        role: currentAdmin?.role ?? user.role,
        profilePhotoUrl: currentAdmin?.profilePhotoUrl ?? null,
      }}
    >
      {children}
    </PortalShell>
  );
}
