import Link from "next/link";
import { SupportedUserStatus } from "@prisma/client";

import { createSupportedUserAction } from "@/app/(portal)/portal/actions";
import { PortalSelect } from "@/components/portal/portal-select";
import { PortalTabs } from "@/components/portal/portal-tabs";
import { requirePortalAccess } from "@/lib/auth/session";
import { listSupportedUsers } from "@/lib/services/portal";
import { formatLabel } from "@/lib/utils";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const user = await requirePortalAccess();
  const resolvedSearchParams = await searchParams;
  const supportedUsers = await listSupportedUsers(user);
  const requestedTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const currentTab =
    requestedTab === "create-profile" || requestedTab === "supported-users"
      ? requestedTab
      : "supported-users";
  const statusOptions = Object.values(SupportedUserStatus).map((status) => ({
    label: formatLabel(status),
    value: status,
  }));

  return (
    <div className="space-y-6">
      <section className="panel rounded-[1.6rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Supported Users</p>
            <h1 className="mt-2 text-3xl font-semibold">User Directory and Intake</h1>
            <p className="mt-2 text-sm text-muted">
              Manage patient profiles, review assigned routines, and prepare device-linked care.
            </p>
          </div>
          <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Total Profiles</p>
            <p className="mt-1 text-sm font-semibold">{supportedUsers.length}</p>
          </div>
        </div>
      </section>

      <PortalTabs
        basePath="/portal/users"
        currentTab={currentTab}
        tabs={[
          { id: "supported-users", label: "Supported Users" },
          { id: "create-profile", label: "Create a Profile" },
        ]}
      />

      {currentTab === "supported-users" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Directory</p>
              <h2 className="mt-2 text-2xl font-semibold">Supported Users</h2>
            </div>
            <p className="text-sm text-muted">{supportedUsers.length} Total</p>
          </div>

          <div className="table-wrap mt-5">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th className="table-numeric">Assigned Routines</th>
                  <th className="table-numeric">Linked Devices</th>
                  <th className="table-action" />
                </tr>
              </thead>
              <tbody>
                {supportedUsers.map((supportedUser) => (
                  <tr key={supportedUser.id}>
                    <td>
                      <div>
                        <p className="font-semibold">{supportedUser.displayName}</p>
                        <p className="text-sm text-muted">
                          {supportedUser.firstName} {supportedUser.lastName}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span
                        className={[
                          "status-badge",
                          supportedUser.status === SupportedUserStatus.ACTIVE
                            ? "status-badge--success"
                            : supportedUser.status === SupportedUserStatus.INACTIVE
                              ? "status-badge--warning"
                              : "status-badge--neutral",
                        ].join(" ")}
                      >
                        {formatLabel(supportedUser.status)}
                      </span>
                    </td>
                    <td className="table-numeric text-sm text-muted">{supportedUser.assignments.length}</td>
                    <td className="table-numeric text-sm text-muted">{supportedUser.deviceLinks.length}</td>
                    <td className="table-action">
                      <Link
                        href={`/portal/users/${supportedUser.id}`}
                        className="button-secondary !rounded-[0.95rem] !py-3"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {currentTab === "create-profile" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">New Supported User</p>
          <h2 className="mt-2 text-2xl font-semibold">Create a Profile</h2>
          <p className="mt-2 text-sm text-muted">
            Add a new patient profile for routine assignment, device pairing, and caregiver audio support.
          </p>

          <form action={createSupportedUserAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">
              <span>First Name</span>
              <input name="firstName" className="field" required />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Last Name</span>
              <input name="lastName" className="field" required />
            </label>
            <label className="space-y-2 text-sm font-semibold md:col-span-2">
              <span>Display Name</span>
              <input name="displayName" className="field" required />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Date of Birth</span>
              <input name="dateOfBirth" type="date" className="field" />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Status</span>
              <PortalSelect
                name="status"
                defaultValue={SupportedUserStatus.ACTIVE}
                options={statusOptions}
              />
            </label>
            <div className="pt-6 md:col-span-2">
              <button type="submit" className="button-primary w-full">
                Create User
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
