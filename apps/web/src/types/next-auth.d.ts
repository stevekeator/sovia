import { AdminRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AdminRole;
      organizationId: string | null;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: AdminRole;
    organizationId: string | null;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AdminRole;
    organizationId?: string | null;
    firstName?: string;
    lastName?: string;
  }
}
