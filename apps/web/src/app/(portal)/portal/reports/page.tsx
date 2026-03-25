import { StepResultValue } from "@prisma/client";

import { PortalTabs } from "@/components/portal/portal-tabs";
import { PortalSelect } from "@/components/portal/portal-select";
import { requirePortalAccess } from "@/lib/auth/session";
import { getReportsView } from "@/lib/services/portal";
import { formatDate, formatDateTime } from "@/lib/utils";

type ReportOutcome = "all" | "complete" | "partial" | "needs-review";
type ReportView = "activity" | "analytics";
type AnalyticsView = "daily-trend" | "supported-user-summary" | "routine-summary";

function getSessionOutcome(stepResults: Array<{ result: StepResultValue }>): Exclude<ReportOutcome, "all"> {
  const doneCount = stepResults.filter((stepResult) => stepResult.result === StepResultValue.DONE).length;

  if (!stepResults.length || doneCount === 0) {
    return "needs-review";
  }

  if (doneCount === stepResults.length) {
    return "complete";
  }

  return "partial";
}

function getOutcomeLabel(outcome: Exclude<ReportOutcome, "all">) {
  if (outcome === "complete") {
    return "Complete";
  }

  if (outcome === "partial") {
    return "Partial";
  }

  return "Needs Review";
}

function getOutcomeClasses(outcome: Exclude<ReportOutcome, "all">) {
  if (outcome === "complete") {
    return "status-badge status-badge--success";
  }

  if (outcome === "partial") {
    return "status-badge status-badge--warning";
  }

  return "status-badge status-badge--danger";
}

function getStepResultClasses(result: StepResultValue) {
  return result === StepResultValue.DONE
    ? "status-badge status-badge--success"
    : "status-badge status-badge--danger";
}

function buildReportsHref(filters: {
  supportedUserId?: string;
  routineId?: string;
  from?: string;
  to?: string;
  outcome?: string;
  view?: string;
  analyticsView?: string;
}) {
  const searchParams = new URLSearchParams();

  if (filters.supportedUserId) {
    searchParams.set("supportedUserId", filters.supportedUserId);
  }

  if (filters.routineId) {
    searchParams.set("routineId", filters.routineId);
  }

  if (filters.from) {
    searchParams.set("from", filters.from);
  }

  if (filters.to) {
    searchParams.set("to", filters.to);
  }

  if (filters.outcome && filters.outcome !== "all") {
    searchParams.set("outcome", filters.outcome);
  }

  if (filters.view && filters.view !== "activity") {
    searchParams.set("view", filters.view);
  }

  if (filters.analyticsView && filters.analyticsView !== "daily-trend") {
    searchParams.set("analyticsView", filters.analyticsView);
  }

  const query = searchParams.toString();
  return query ? `/portal/reports?${query}` : "/portal/reports";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    supportedUserId?: string;
    routineId?: string;
    from?: string;
    to?: string;
    outcome?: string;
    view?: string;
    analyticsView?: string;
  }>;
}) {
  const user = await requirePortalAccess();
  const filters = await searchParams;
  const { supportedUsers, routines, sessions } = await getReportsView(user, filters);
  const currentView: ReportView = filters.view === "analytics" ? "analytics" : "activity";
  const currentAnalyticsView: AnalyticsView =
    filters.analyticsView === "supported-user-summary" ||
    filters.analyticsView === "routine-summary"
      ? filters.analyticsView
      : "daily-trend";

  const outcomeFilter =
    filters.outcome === "complete" || filters.outcome === "partial" || filters.outcome === "needs-review"
      ? (filters.outcome as Exclude<ReportOutcome, "all">)
      : "all";

  const supportedUserOptions = [
    { label: "All Users", value: "" },
    ...supportedUsers.map((supportedUser) => ({
      label: supportedUser.displayName,
      value: supportedUser.id,
    })),
  ];

  const routineOptions = [
    { label: "All Routines", value: "" },
    ...routines.map((routine) => ({
      label: routine.title,
      value: routine.id,
    })),
  ];

  const outcomeOptions = [
    { label: "All Outcomes", value: "all" },
    { label: "Complete", value: "complete", description: "Every step recorded as done." },
    { label: "Partial", value: "partial", description: "Mixed done and not-done steps." },
    { label: "Needs Review", value: "needs-review", description: "No completed steps or all steps missed." },
  ];

  const sessionsWithOutcome = sessions.map((session) => {
    const outcome = getSessionOutcome(session.stepResults);
    const completedSteps = session.stepResults.filter(
      (stepResult) => stepResult.result === StepResultValue.DONE,
    ).length;

    return {
      ...session,
      completedSteps,
      outcome,
      totalSteps: session.stepResults.length,
    };
  });

  const filteredSessions =
    outcomeFilter === "all"
      ? sessionsWithOutcome
      : sessionsWithOutcome.filter((session) => session.outcome === outcomeFilter);

  const summary = filteredSessions.reduce(
    (acc, session) => {
      acc.total += 1;
      acc[session.outcome] += 1;
      return acc;
    },
    { total: 0, complete: 0, partial: 0, "needs-review": 0 },
  );

  const mostRecentActivity = filteredSessions[0]?.startedAt ?? sessionsWithOutcome[0]?.startedAt ?? null;

  const groupedSessions = filteredSessions.reduce<
    Array<{
      dateLabel: string;
      items: typeof filteredSessions;
    }>
  >((groups, session) => {
    const dateLabel = formatDate(session.startedAt);
    const currentGroup = groups.at(-1);

    if (currentGroup && currentGroup.dateLabel === dateLabel) {
      currentGroup.items.push(session);
      return groups;
    }

    groups.push({
      dateLabel,
      items: [session],
    });
    return groups;
  }, []);

  const dailyTrendRows = groupedSessions.map((group) => {
    const totals = group.items.reduce(
      (acc, session) => {
        acc.total += 1;
        acc[session.outcome] += 1;
        return acc;
      },
      { total: 0, complete: 0, partial: 0, "needs-review": 0 },
    );

    return {
      ...totals,
      dateLabel: group.dateLabel,
    };
  });

  const supportedUserSummary = Array.from(
    filteredSessions.reduce<
      Map<
        string,
        {
          complete: number;
          name: string;
          "needs-review": number;
          partial: number;
          total: number;
        }
      >
    >((summaryMap, session) => {
      const existing = summaryMap.get(session.supportedUser.id) ?? {
        complete: 0,
        name: session.supportedUser.displayName,
        "needs-review": 0,
        partial: 0,
        total: 0,
      };

      existing.total += 1;
      existing[session.outcome] += 1;
      summaryMap.set(session.supportedUser.id, existing);
      return summaryMap;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  const routineSummary = Array.from(
    filteredSessions.reduce<
      Map<
        string,
        {
          complete: number;
          lastActivity: Date;
          name: string;
          "needs-review": number;
          partial: number;
          total: number;
        }
      >
    >((summaryMap, session) => {
      const existing = summaryMap.get(session.routine.id) ?? {
        complete: 0,
        lastActivity: session.startedAt,
        name: session.routine.title,
        "needs-review": 0,
        partial: 0,
        total: 0,
      };

      existing.total += 1;
      existing[session.outcome] += 1;
      if (session.startedAt > existing.lastActivity) {
        existing.lastActivity = session.startedAt;
      }
      summaryMap.set(session.routine.id, existing);
      return summaryMap;
    }, new Map()).values(),
  ).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <section className="panel rounded-[1.6rem] p-6">
        <p className="eyebrow">Reporting</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Routine Activity and Follow-Up</h1>
            <p className="mt-2 text-sm text-muted">
              Review recent sessions, spot incomplete routines quickly, and drill into step-level outcomes only when needed.
            </p>
          </div>
          <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Latest Activity</p>
            <p className="mt-1 text-sm font-semibold">
              {mostRecentActivity ? formatDateTime(mostRecentActivity) : "No sessions yet"}
            </p>
          </div>
        </div>
      </section>

      <PortalTabs
        basePath="/portal/reports"
        currentTab={currentView}
        tabs={[
          {
            id: "activity",
            label: "Activity Feed",
            href: buildReportsHref({ ...filters, view: "activity" }),
          },
          {
            id: "analytics",
            label: "Chart and Tables",
            href: buildReportsHref({ ...filters, view: "analytics" }),
          },
        ]}
      />

      <section className="grid gap-5 lg:grid-cols-4">
        <div className="panel rounded-[1.35rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Sessions</p>
          <p className="mt-3 text-4xl font-bold">{summary.total}</p>
          <p className="mt-2 text-sm text-muted">Sessions in the current filtered view.</p>
        </div>
        <div className="panel rounded-[1.35rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Complete</p>
          <p className="mt-3 text-4xl font-bold text-[#1d5955]">{summary.complete}</p>
          <p className="mt-2 text-sm text-muted">All steps were marked done.</p>
        </div>
        <div className="panel rounded-[1.35rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Partial</p>
          <p className="mt-3 text-4xl font-bold text-[#8d6a2f]">{summary.partial}</p>
          <p className="mt-2 text-sm text-muted">A mix of completed and missed steps.</p>
        </div>
        <div className="panel rounded-[1.35rem] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Needs Review</p>
          <p className="mt-3 text-4xl font-bold text-[#8d3a30]">{summary["needs-review"]}</p>
          <p className="mt-2 text-sm text-muted">Sessions with no completed steps.</p>
        </div>
      </section>

      <section className="panel rounded-[1.6rem] p-6">
        <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Filters</p>
            <h2 className="mt-2 text-2xl font-semibold">Focus the Activity Feed</h2>
          </div>
        </div>

        <form className="mt-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="space-y-2 text-sm font-semibold">
              <span>Supported User</span>
              <PortalSelect
                name="supportedUserId"
                defaultValue={filters.supportedUserId ?? ""}
                options={supportedUserOptions}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Routine</span>
              <PortalSelect
                name="routineId"
                defaultValue={filters.routineId ?? ""}
                options={routineOptions}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Outcome</span>
              <PortalSelect
                name="outcome"
                defaultValue={outcomeFilter}
                options={outcomeOptions}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <label className="space-y-2 text-sm font-semibold">
              <span>From</span>
              <input name="from" type="date" defaultValue={filters.from ?? ""} className="field" />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>To</span>
              <input name="to" type="date" defaultValue={filters.to ?? ""} className="field" />
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="view" value={currentView} />
              <button type="submit" className="button-primary">
                Apply Filters
              </button>
              <a href="/portal/reports" className="button-secondary">
                Reset
              </a>
            </div>
          </div>
        </form>
      </section>

      {currentView === "activity" ? (
        <section className="space-y-5">
          {groupedSessions.length ? (
            groupedSessions.map((group) => (
              <div key={group.dateLabel} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {group.dateLabel}
                  </p>
                  <div className="h-px flex-1 bg-line" />
                </div>

                <div className="space-y-4">
                  {group.items.map((session) => (
                    <article key={session.id} className="panel rounded-[1.35rem] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xl font-semibold">{session.supportedUser.displayName}</p>
                            <span
                              className={[
                                getOutcomeClasses(session.outcome),
                              ].join(" ")}
                            >
                              {getOutcomeLabel(session.outcome)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                            <span>{session.routine.title}</span>
                            <span>Version {session.routineVersion}</span>
                            <span>{formatDateTime(session.startedAt)}</span>
                          </div>
                        </div>

                        <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Completion</p>
                          <p className="mt-1 text-sm font-semibold">
                            {session.completedSteps} of {session.totalSteps} steps done
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {session.stepResults.map((stepResult) => (
                          <span
                            key={stepResult.id}
                            className={[
                              "inline-flex items-center gap-2",
                              getStepResultClasses(stepResult.result),
                            ].join(" ")}
                          >
                            <span>{stepResult.result === StepResultValue.DONE ? "✓" : "×"}</span>
                            <span>
                              {stepResult.routineStep.shortText || `Step ${stepResult.routineStep.sortOrder}`}
                            </span>
                          </span>
                        ))}
                      </div>

                      <details className="mt-5 rounded-[1rem] border border-line bg-[#f7fafc]">
                        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground">
                          View Step Detail
                        </summary>
                        <div className="border-t border-line px-4 py-4">
                          <div className="space-y-3">
                            {session.stepResults.map((stepResult) => (
                              <div
                                key={stepResult.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-[0.95rem] border border-line bg-white px-4 py-3"
                              >
                                <div>
                                  <p className="font-semibold">
                                    {stepResult.routineStep.shortText || `Step ${stepResult.routineStep.sortOrder}`}
                                  </p>
                                  <p className="text-sm text-muted">
                                    Step {stepResult.routineStep.sortOrder}
                                  </p>
                                </div>
                                <span
                                  className={[
                                    getStepResultClasses(stepResult.result),
                                  ].join(" ")}
                                >
                                  {stepResult.result === StepResultValue.DONE ? "Done" : "Not Done"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    </article>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <section className="panel rounded-[1.6rem] p-6">
              <p className="eyebrow">No Results</p>
              <h2 className="mt-2 text-2xl font-semibold">No Sessions Match These Filters</h2>
              <p className="mt-2 text-sm text-muted">
                Adjust the current filters or clear them to return to the full activity feed.
              </p>
            </section>
          )}
        </section>
      ) : null}

      {currentView === "analytics" ? (
        <section className="space-y-6">
          <PortalTabs
            basePath="/portal/reports"
            currentTab={currentAnalyticsView}
            tabs={[
              {
                id: "daily-trend",
                label: "Daily Trend",
                href: buildReportsHref({
                  ...filters,
                  view: "analytics",
                  analyticsView: "daily-trend",
                }),
              },
              {
                id: "supported-user-summary",
                label: "Supported User Summary",
                href: buildReportsHref({
                  ...filters,
                  view: "analytics",
                  analyticsView: "supported-user-summary",
                }),
              },
              {
                id: "routine-summary",
                label: "Routine Summary",
                href: buildReportsHref({
                  ...filters,
                  view: "analytics",
                  analyticsView: "routine-summary",
                }),
              },
            ]}
          />

          {currentAnalyticsView === "daily-trend" ? (
            <div className="panel rounded-[1.6rem] p-6">
              <p className="eyebrow">Daily Trend</p>
              <h2 className="mt-2 text-2xl font-semibold">Outcome Mix Over Time</h2>
              <div className="mt-5 space-y-4">
                {dailyTrendRows.length ? (
                  dailyTrendRows.map((row) => (
                    <div key={row.dateLabel} className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_140px] lg:items-center">
                      <div>
                        <p className="font-semibold">{row.dateLabel}</p>
                        <p className="text-sm text-muted">{row.total} sessions</p>
                      </div>
                      <div className="overflow-hidden rounded-full border border-line bg-[#edf3f8]">
                        <div className="flex h-4 w-full">
                          <div
                            className="bg-[#1d5955]"
                            style={{ width: `${row.total ? (row.complete / row.total) * 100 : 0}%` }}
                          />
                          <div
                            className="bg-[#c9a55a]"
                            style={{ width: `${row.total ? (row.partial / row.total) * 100 : 0}%` }}
                          />
                          <div
                            className="bg-[#b45a4e]"
                            style={{ width: `${row.total ? (row["needs-review"] / row.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                        <span className="text-[#1d5955]">{row.complete} Complete</span>
                        <span className="text-[#8d6a2f]">{row.partial} Partial</span>
                        <span className="text-[#8d3a30]">{row["needs-review"]} Review</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1rem] border border-dashed border-line bg-[#f7fafc] p-4 text-sm text-muted">
                    No sessions available for the selected filters.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {currentAnalyticsView === "supported-user-summary" ? (
            <div className="panel rounded-[1.6rem] p-6">
              <p className="eyebrow">Supported User Summary</p>
              <h2 className="mt-2 text-2xl font-semibold">Outcome Totals by Supported User</h2>
              <div className="table-wrap mt-5">
                <table>
                  <thead>
                    <tr>
                      <th>Supported User</th>
                      <th className="table-numeric">Sessions</th>
                      <th className="table-numeric">Complete</th>
                      <th className="table-numeric">Partial</th>
                      <th className="table-numeric">Needs Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportedUserSummary.length ? (
                      supportedUserSummary.map((item) => (
                        <tr key={item.name}>
                          <td className="font-semibold">{item.name}</td>
                          <td className="table-numeric text-sm text-muted">{item.total}</td>
                          <td className="table-numeric text-sm text-[#1d5955]">{item.complete}</td>
                          <td className="table-numeric text-sm text-[#8d6a2f]">{item.partial}</td>
                          <td className="table-numeric text-sm text-[#8d3a30]">{item["needs-review"]}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-sm text-muted">
                          No sessions available for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {currentAnalyticsView === "routine-summary" ? (
            <div className="panel rounded-[1.6rem] p-6">
              <p className="eyebrow">Routine Summary</p>
              <h2 className="mt-2 text-2xl font-semibold">Completion Rate by Routine</h2>
              <div className="table-wrap mt-5">
                <table>
                  <thead>
                    <tr>
                      <th>Routine</th>
                      <th className="table-numeric">Sessions</th>
                      <th className="table-numeric">Complete Rate</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routineSummary.length ? (
                      routineSummary.map((item) => (
                        <tr key={item.name}>
                          <td className="font-semibold">{item.name}</td>
                          <td className="table-numeric text-sm text-muted">{item.total}</td>
                          <td className="table-numeric text-sm text-muted">
                            {item.total ? Math.round((item.complete / item.total) * 100) : 0}%
                          </td>
                          <td className="text-sm text-muted">{formatDateTime(item.lastActivity)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-sm text-muted">
                          No sessions available for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
