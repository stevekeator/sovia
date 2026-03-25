import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AdminRole } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as AdminRole | undefined) ?? AdminRole.CAREGIVER;
        session.user.organizationId =
          (token.organizationId as string | null | undefined) ?? null;
        session.user.firstName = (token.firstName as string | undefined) ?? "";
        session.user.lastName = (token.lastName as string | undefined) ?? "";
      }

      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!admin) {
          return null;
        }

        const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: admin.id,
          email: admin.email,
          name: `${admin.firstName} ${admin.lastName}`.trim(),
          role: admin.role,
          organizationId: admin.organizationId,
          firstName: admin.firstName,
          lastName: admin.lastName,
        };
      },
    }),
  ],
});
