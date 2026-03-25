import type { ReactNode } from "react";

import { logoutAction } from "@/app/(portal)/portal/actions";
import { PortalAvatar } from "@/components/portal/portal-avatar";
import { PortalNav } from "@/components/portal/portal-nav";
import { ProductWordmark } from "@/components/product-wordmark";
import { formatAdminRoleLabel } from "@/lib/utils";

export function PortalShell({
  children,
  user,
}: {
  children: ReactNode;
  user: {
    firstName: string;
    lastName: string;
    role: string;
    profilePhotoUrl?: string | null;
  };
}) {
  return (
    <div className="portal-theme min-h-screen">
      <div className="mx-auto flex w-[min(1280px,calc(100vw-2rem))] flex-col gap-6 py-6 lg:flex-row lg:items-start">
        <aside className="rounded-[1.6rem] border border-white/8 bg-[#163d4a] p-5 text-white shadow-[0_18px_34px_rgba(18,40,47,0.14)] lg:sticky lg:top-6 lg:w-[17.5rem]">
          <div className="rounded-[1.2rem] border border-white/8 bg-[#143744] px-5 py-5">
            <ProductWordmark
              href="/"
              theme="dark"
              compact
              descriptor="Care-ready routines and reporting"
            />
            <p className="mt-4 text-2xl font-semibold text-[#d9e6e2]">Admin Portal</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Routine management, device access, and outcome review.
            </p>
          </div>

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
              Operations
            </p>
          </div>

          <PortalNav />

          <div className="mt-6 rounded-[1.15rem] border border-white/8 bg-white/[0.045] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
              Signed in
            </p>
            <div className="mt-3 flex items-center gap-3">
              <PortalAvatar
                name={`${user.firstName} ${user.lastName}`.trim()}
                photoUrl={user.profilePhotoUrl}
                sizeClassName="h-12 w-12"
                textClassName="text-sm"
                className="border-white/10 bg-white/[0.08] text-white"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/54">
                  {formatAdminRoleLabel(user.role)}
                </p>
              </div>
            </div>
            <form action={logoutAction} className="mt-4">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-[0.95rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:max-w-[1020px]">
          <div className="mb-5 flex flex-col gap-3 rounded-[1.3rem] border border-line bg-[rgba(247,248,248,0.88)] px-5 py-4 shadow-[0_8px_20px_rgba(18,40,47,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#355d64]">
                Clinical Operations Workspace
              </p>
              <p className="mt-1 text-sm text-muted">
                Structured tools for routines, schedules, and device-linked care.
              </p>
            </div>
            <p className="inline-flex items-center rounded-full border border-[#d2dade] bg-[#eef3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#355d64]">
              {formatAdminRoleLabel(user.role)}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
