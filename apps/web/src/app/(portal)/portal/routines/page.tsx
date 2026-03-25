import Link from "next/link";
import { RoutineStatus } from "@prisma/client";

import { createRoutineAction } from "@/app/(portal)/portal/actions";
import { PortalTabs } from "@/components/portal/portal-tabs";
import { requirePortalAccess } from "@/lib/auth/session";
import {
  getRoutineLimitForTier,
  premiumFeatureMessages,
} from "@/lib/billing/subscription-plans";
import { prisma } from "@/lib/prisma";
import { listRoutines } from "@/lib/services/portal";
import { formatLabel } from "@/lib/utils";

function getRoutineStatusBadgeClass(status: RoutineStatus) {
  if (status === RoutineStatus.PUBLISHED) {
    return "status-badge status-badge--success";
  }

  if (status === RoutineStatus.DRAFT) {
    return "status-badge status-badge--warning";
  }

  return "status-badge status-badge--neutral";
}

export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; tab?: string | string[] }>;
}) {
  const user = await requirePortalAccess();
  const resolvedSearchParams = await searchParams;
  const routines = await listRoutines(user);
  const organization = user.organizationId
    ? await prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: {
          subscriptionTier: true,
        },
      })
    : null;
  const requestedTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const currentTab =
    requestedTab === "new-routine" || requestedTab === "routine-library"
      ? requestedTab
      : "routine-library";
  const searchQuery = (
    Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q
  )?.trim() ?? "";
  const normalizedSearchQuery = searchQuery.toLowerCase();

  const filteredRoutines = normalizedSearchQuery
    ? routines.filter((routine) => {
        const haystacks = [
          routine.title,
          routine.description ?? "",
          formatLabel(routine.status),
          ...routine.steps.map((step) => step.shortText ?? ""),
        ];

        return haystacks.some((value) => value.toLowerCase().includes(normalizedSearchQuery));
      })
    : routines;
  const activeRoutineCount = routines.filter((routine) => routine.status !== RoutineStatus.ARCHIVED).length;
  const routineLimit = getRoutineLimitForTier(organization?.subscriptionTier);
  const isRoutineLimitReached = routineLimit !== null && activeRoutineCount >= routineLimit;

  return (
    <div className="space-y-6">
      <section className="panel rounded-[1.6rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Routines</p>
            <h1 className="mt-2 text-3xl font-semibold">Routine Library and Builder</h1>
            <p className="mt-2 text-sm text-muted">
              Search the routine inventory, review status and assignment load, or create a new routine template.
            </p>
          </div>
          <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Routine Count</p>
            <p className="mt-1 text-sm font-semibold">
              {activeRoutineCount}
              {routineLimit !== null ? ` / ${routineLimit}` : ""}
            </p>
          </div>
        </div>
      </section>

      <PortalTabs
        basePath="/portal/routines"
        currentTab={currentTab}
        tabs={[
          {
            id: "routine-library",
            label: "Routine Library",
            href: searchQuery
              ? `/portal/routines?tab=routine-library&q=${encodeURIComponent(searchQuery)}`
              : "/portal/routines?tab=routine-library",
          },
          { id: "new-routine", label: "New Routine" },
        ]}
      />

      {currentTab === "routine-library" ? (
        <section className="space-y-6">
          <section className="panel rounded-[1.6rem] p-6">
            <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Routine Library</p>
                <h2 className="mt-2 text-2xl font-semibold">Search and Review Existing Routines</h2>
              </div>
              <p className="text-sm text-muted">
                {filteredRoutines.length} {filteredRoutines.length === 1 ? "Routine" : "Routines"}
              </p>
            </div>

            <form className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <input type="hidden" name="tab" value="routine-library" />
              <label className="space-y-2 text-sm font-semibold">
                <span>Search</span>
                <input
                  name="q"
                  className="field"
                  defaultValue={searchQuery}
                  placeholder="Search title, description, or step text"
                />
              </label>
              <div className="flex flex-wrap items-end gap-3">
                <button type="submit" className="button-primary">
                  Search
                </button>
                <a href="/portal/routines?tab=routine-library" className="button-secondary">
                  Clear
                </a>
              </div>
            </form>
          </section>

          <section className="panel rounded-[1.6rem] p-6">
            <div className="space-y-4">
              {filteredRoutines.length ? (
                filteredRoutines.map((routine) => (
                  <article key={routine.id} className="rounded-[1.2rem] border border-line bg-[#f7fafc] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xl font-semibold">{routine.title}</p>
                          <span className={getRoutineStatusBadgeClass(routine.status)}>
                            {formatLabel(routine.status)}
                          </span>
                        </div>
                        <p className="max-w-3xl text-sm leading-7 text-muted">
                          {routine.description || "No description yet."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="status-badge status-badge--neutral">
                            {routine.steps.length} Steps
                          </span>
                          <span className="status-badge status-badge--neutral">
                            {routine.assignments.length} Active Assignments
                          </span>
                          <span className="status-badge status-badge--neutral">
                            Version {routine.currentVersion}
                          </span>
                        </div>
                        {routine.steps.length ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {routine.steps.slice(0, 4).map((step) => (
                              <span key={step.id} className="rounded-full border border-line bg-white px-3 py-2 text-sm text-muted">
                                {step.shortText || `Step ${step.sortOrder}`}
                              </span>
                            ))}
                            {routine.steps.length > 4 ? (
                              <span className="rounded-full border border-line bg-white px-3 py-2 text-sm text-muted">
                                +{routine.steps.length - 4} More
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link href={`/portal/routines/${routine.id}`} className="button-secondary !py-3">
                          Open
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-5 text-sm text-muted">
                  No routines matched this search. Try a different title, description phrase, or step keyword.
                </div>
              )}
            </div>
          </section>
        </section>
      ) : null}

      {currentTab === "new-routine" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">New Routine</p>
          <h2 className="mt-2 text-2xl font-semibold">Build a Routine</h2>
          <p className="mt-2 text-sm text-muted">
            Start a new routine template with a clear title and optional description, then add steps and assignments.
          </p>
          {routineLimit !== null ? (
            <div className="mt-4 rounded-[1rem] border border-[#c7ddd5] bg-[#edf6f1] px-4 py-3 text-sm text-[#1f5f52]">
              <p className="font-semibold">{premiumFeatureMessages.freeRoutineCapReached}.</p>
              <p className="mt-1 text-[#41665d]">
                Your organization is currently using {activeRoutineCount} of {routineLimit} available routines.
                {isRoutineLimitReached ? ` ${premiumFeatureMessages.upgradeForMoreRoutines}.` : ""}
              </p>
            </div>
          ) : null}

          <form action={createRoutineAction} className="mt-6 space-y-4">
            <label className="space-y-2 text-sm font-semibold">
              <span>Title</span>
              <input name="title" className="field" required />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Description</span>
              <textarea name="description" className="field" />
            </label>
            <div className="pt-6">
              <button type="submit" className="button-primary w-full" disabled={isRoutineLimitReached}>
                Create Routine
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
