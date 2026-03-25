import Link from "next/link";

import { requirePortalAccess } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/portal";
import { formatDateTime } from "@/lib/utils";

export default async function PortalDashboardPage() {
  const user = await requirePortalAccess();
  const data = await getDashboardData(user);
  const recentSessionCount = data.recentCompletions.length;

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
        <div className="panel rounded-[1.6rem] p-7">
          <p className="eyebrow">Dashboard</p>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="display text-4xl text-foreground xl:text-[2.8rem]">
                Clinical Routine Operations
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Monitor routine delivery, linked users, and completion activity from one
                administrative workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/portal/users" className="button-secondary">
                Manage Users
              </Link>
              <Link href="/portal/routines" className="button-primary">
                Manage Routines
              </Link>
            </div>
          </div>
        </div>

        <div className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Live Snapshot</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.15rem] border border-line bg-[#f4f7fa] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Recent Sessions
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{recentSessionCount}</p>
            </div>
            <div className="rounded-[1.15rem] border border-line bg-[#f4f7fa] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Linked Organizations
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {data.organizations.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="panel rounded-[1.35rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Organizations in Scope
          </p>
          <p className="mt-4 text-4xl font-bold">{data.organizations.length}</p>
          <p className="mt-2 text-sm text-muted">Administrative coverage currently available.</p>
        </div>
        <div className="panel rounded-[1.35rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Supported Users
          </p>
          <p className="mt-4 text-4xl font-bold">{data.supportedUserCount}</p>
          <p className="mt-2 text-sm text-muted">Profiles assigned to active care workflows.</p>
        </div>
        <div className="panel rounded-[1.35rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Published Routines
          </p>
          <p className="mt-4 text-4xl font-bold">{data.activeRoutineCount}</p>
          <p className="mt-2 text-sm text-muted">Available routine templates ready for assignment.</p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="panel rounded-[1.6rem] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Recent completion activity</p>
              <h2 className="mt-2 text-2xl font-semibold">Latest sessions</h2>
            </div>
            <Link href="/portal/reports" className="button-secondary !py-3">
              Open Reporting
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {data.recentCompletions.length ? (
              data.recentCompletions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-[1.15rem] border border-line bg-[#f7fafc] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.supportedUser.displayName}</p>
                      <p className="text-sm text-muted">{session.routine.title}</p>
                    </div>
                    <p className="text-sm text-muted">{formatDateTime(session.startedAt)}</p>
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    {session.stepResults.length} responses recorded for version{" "}
                    {session.routineVersion}.
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.15rem] border border-dashed border-line bg-[#f7fafc] p-5 text-sm text-muted">
                No completion sessions yet.
              </div>
            )}
          </div>
        </div>

        <div className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Quick links</p>
          <div className="mt-5 grid gap-3">
            <Link
              href="/portal/users"
              className="rounded-[1rem] border border-line bg-[#f7fafc] px-4 py-4 text-sm font-semibold"
            >
              Create or edit supported users
            </Link>
            <Link
              href="/portal/routines"
              className="rounded-[1rem] border border-line bg-[#f7fafc] px-4 py-4 text-sm font-semibold"
            >
              Build a new routine
            </Link>
            <Link
              href="/portal/assignments"
              className="rounded-[1rem] border border-line bg-[#f7fafc] px-4 py-4 text-sm font-semibold"
            >
              Assign routines to users
            </Link>
            <Link
              href="/portal/settings"
              className="rounded-[1rem] border border-line bg-[#f7fafc] px-4 py-4 text-sm font-semibold"
            >
              Review admins and billing status
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
