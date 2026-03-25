import {
  AdminRole,
  BillingStatus,
  SubscriptionCycle,
  SubscriptionTier,
} from "@prisma/client";

import {
  createAdminAction,
  updateAdminProfilePhotoAction,
  updateOrganizationStatusAction,
} from "@/app/(portal)/portal/actions";
import { PortalAvatar } from "@/components/portal/portal-avatar";
import { PortalSelect } from "@/components/portal/portal-select";
import { PortalTabs } from "@/components/portal/portal-tabs";
import { isPlatformAdmin, requirePortalAccess } from "@/lib/auth/session";
import { subscriptionPlans } from "@/lib/billing/subscription-plans";
import { getSettingsView } from "@/lib/services/portal";
import {
  formatAdminRoleLabel,
  formatLabel,
  formatSubscriptionTierLabel,
} from "@/lib/utils";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const user = await requirePortalAccess();
  const resolvedSearchParams = await searchParams;
  const { organization, admins, organizations } = await getSettingsView(user);
  const availableTabs = isPlatformAdmin(user.role)
    ? ["organization", "admins", "billing"]
    : ["organization", "admins"];
  const requestedTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const currentTab =
    requestedTab && availableTabs.includes(requestedTab) ? requestedTab : "organization";
  const adminRoleOptions = [
    { label: "Caregiver", value: AdminRole.CAREGIVER },
    { label: "Org Admin", value: AdminRole.ORG_ADMIN },
    ...(isPlatformAdmin(user.role)
      ? [{ label: "Platform Admin", value: AdminRole.SUPER_ADMIN }]
      : []),
  ];
  const billingStatusOptions = Object.values(BillingStatus).map((status) => ({
    label: formatLabel(status),
    value: status,
  }));
  const subscriptionTierOptions = subscriptionPlans.map((plan) => ({
    label: plan.label,
    value:
      plan.id === "family-care-team"
        ? SubscriptionTier.FAMILY_CARE_TEAM
        : (plan.id.toUpperCase() as SubscriptionTier),
  }));
  const subscriptionCycleOptions = [
    { label: "Monthly", value: SubscriptionCycle.MONTHLY },
    { label: "Yearly", value: SubscriptionCycle.YEARLY },
    { label: "Custom", value: SubscriptionCycle.CUSTOM },
  ];

  return (
    <div className="space-y-6">
      <section className="panel rounded-[1.6rem] p-6">
        <p className="eyebrow">Settings</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {organization?.name ?? "Global Admin View"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Administrative controls for organization setup, roster access, and billing status.
            </p>
          </div>
          <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Current Role</p>
            <p className="mt-1 text-sm font-semibold">{formatAdminRoleLabel(user.role)}</p>
          </div>
        </div>
      </section>

      <PortalTabs
        basePath="/portal/settings"
        currentTab={currentTab}
        tabs={[
          { id: "organization", label: "Organization" },
          { id: "admins", label: "Admins" },
          ...(isPlatformAdmin(user.role) ? [{ id: "billing", label: "Billing" }] : []),
        ]}
      />

      {currentTab === "organization" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Organization</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1rem] border border-line bg-[#f7fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Name</p>
              <p className="mt-2 text-lg font-semibold">
                {organization?.name ?? "Global Admin View"}
              </p>
            </div>
            <div className="rounded-[1rem] border border-line bg-[#f7fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Slug</p>
              <p className="mt-2 text-lg font-semibold">
                {organization?.slug ?? "Not scoped to a single organization"}
              </p>
            </div>
            <div className="rounded-[1rem] border border-line bg-[#f7fafc] p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Billing Status</p>
              <p className="mt-2 text-lg font-semibold">
                {organization?.billingStatus ? formatLabel(organization.billingStatus) : "Varies"}
              </p>
            </div>
            <div className="rounded-[1rem] border border-line bg-[#f7fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Subscription Tier</p>
              <p className="mt-2 text-lg font-semibold">
                {formatSubscriptionTierLabel(organization?.subscriptionTier)}
              </p>
            </div>
            <div className="rounded-[1rem] border border-line bg-[#f7fafc] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Billing Cycle</p>
              <p className="mt-2 text-lg font-semibold">
                {organization?.subscriptionCycle ? formatLabel(organization.subscriptionCycle) : "Not set"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {currentTab === "admins" ? (
        <section className="space-y-6">
          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Create Admin</p>
            <form action={createAdminAction} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">
                <span>First Name</span>
                <input name="firstName" className="field" required />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                <span>Last Name</span>
                <input name="lastName" className="field" required />
              </label>
              <label className="space-y-2 text-sm font-semibold md:col-span-2">
                <span>Email</span>
                <input name="email" type="email" className="field" required />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                <span>Password</span>
                <input name="password" type="password" className="field" required />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                <span>Role</span>
                <PortalSelect
                  name="role"
                  defaultValue={AdminRole.CAREGIVER}
                  options={adminRoleOptions}
                />
              </label>
              <label className="space-y-2 text-sm font-semibold md:col-span-2">
                <span>Profile Photo</span>
                <input
                  name="profilePhotoFile"
                  type="file"
                  accept="image/*"
                  className="field file-field"
                />
              </label>
              <div className="pt-6 md:col-span-2">
                <button type="submit" className="button-primary w-full">
                  Create Admin
                </button>
              </div>
            </form>
          </div>

          <section className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Admin Roster</p>
            <div className="table-wrap mt-5">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <PortalAvatar
                            name={`${admin.firstName} ${admin.lastName}`.trim()}
                            photoUrl={admin.profilePhotoUrl}
                            sizeClassName="h-11 w-11"
                            textClassName="text-xs"
                          />
                          <div>
                            <p className="font-semibold">
                              {admin.firstName} {admin.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-muted">{admin.email}</td>
                      <td>
                        <span
                          className={[
                            "status-badge",
                            admin.role === AdminRole.SUPER_ADMIN
                              ? "status-badge--danger"
                              : admin.role === AdminRole.ORG_ADMIN
                                ? "status-badge--warning"
                              : "status-badge--neutral",
                          ].join(" ")}
                        >
                          {formatAdminRoleLabel(admin.role)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Profile Photos</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {admins.map((admin) => (
                <form
                  key={`${admin.id}-photo`}
                  action={updateAdminProfilePhotoAction}
                  className="rounded-[1.15rem] border border-line bg-[#f7fafc] p-4"
                >
                  <input type="hidden" name="adminUserId" value={admin.id} />
                  <div className="flex items-center gap-4">
                    <PortalAvatar
                      name={`${admin.firstName} ${admin.lastName}`.trim()}
                      photoUrl={admin.profilePhotoUrl}
                      sizeClassName="h-14 w-14"
                      textClassName="text-sm"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {admin.firstName} {admin.lastName}
                      </p>
                      <p className="truncate text-sm text-muted">{admin.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <input
                      name="profilePhotoFile"
                      type="file"
                      accept="image/*"
                      className="field file-field"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className="button-secondary !py-3">
                        Save Photo
                      </button>
                      {admin.profilePhotoUrl ? (
                        <button
                          type="submit"
                          name="clearProfilePhoto"
                          value="true"
                          className="button-secondary !py-3"
                        >
                          Remove Photo
                        </button>
                      ) : null}
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </section>
        </section>
      ) : null}

      {currentTab === "billing" && isPlatformAdmin(user.role) ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Billing Controls</p>
          <div className="mt-4 space-y-3">
            {organizations.map((org) => (
              <form
                key={org.id}
                action={updateOrganizationStatusAction}
                className="rounded-[1rem] border border-line bg-[#f7fafc] p-4"
              >
                <input type="hidden" name="organizationId" value={org.id} />
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{org.name}</p>
                    <p className="text-sm text-muted">{org.slug}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <PortalSelect
                      name="billingStatus"
                      defaultValue={org.billingStatus}
                      options={billingStatusOptions}
                      className="min-w-[11rem]"
                    />
                    <PortalSelect
                      name="subscriptionTier"
                      defaultValue={org.subscriptionTier}
                      options={subscriptionTierOptions}
                      className="min-w-[14rem]"
                    />
                    <PortalSelect
                      name="subscriptionCycle"
                      defaultValue={org.subscriptionCycle ?? SubscriptionCycle.MONTHLY}
                      options={subscriptionCycleOptions}
                      className="min-w-[11rem]"
                    />
                    <button type="submit" className="button-secondary !py-3">
                      Update
                    </button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
