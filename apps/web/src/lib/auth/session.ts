import { AdminRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

export async function requirePortalAccess() {
  const user = await requireSession();

  if (![AdminRole.ORG_ADMIN, AdminRole.CAREGIVER, AdminRole.SUPER_ADMIN].includes(user.role)) {
    redirect("/login");
  }

  return user;
}

export function isPlatformAdmin(role: AdminRole) {
  return role === AdminRole.SUPER_ADMIN;
}

export function isSuperAdmin(role: AdminRole) {
  return isPlatformAdmin(role);
}
