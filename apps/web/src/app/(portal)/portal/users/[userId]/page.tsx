import { DeviceLinkStatus, SupportedUserStatus } from "@prisma/client";

import {
  createPairingCodeAction,
  revokeDeviceLinkAction,
  updateSupportedUserHelperAudioAction,
  updateSupportedUserAction,
} from "@/app/(portal)/portal/actions";
import { AudioUploadField } from "@/components/portal/audio-upload-field";
import { PairDeviceHelpModal } from "@/components/portal/pair-device-help-modal";
import { PortalSelect } from "@/components/portal/portal-select";
import { PortalTabs } from "@/components/portal/portal-tabs";
import { VoicePromptUsageNotice } from "@/components/portal/voice-prompt-usage-notice";
import { requirePortalAccess } from "@/lib/auth/session";
import { getSupportedUserDetail } from "@/lib/services/portal";
import { formatDateTime, formatLabel, formatRoutineSchedule } from "@/lib/utils";

export default async function SupportedUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const user = await requirePortalAccess();
  const { userId } = await params;
  const resolvedSearchParams = await searchParams;
  const { supportedUser, voicePromptUsage } = await getSupportedUserDetail(user, userId);
  const pendingCode = supportedUser.deviceLinks.find(
    (deviceLink) =>
      deviceLink.status === DeviceLinkStatus.PENDING &&
      deviceLink.pairingCode &&
      deviceLink.pairingExpiresAt &&
      deviceLink.pairingExpiresAt > new Date(),
  );
  const availableTabs = ["profile", "helper-audio", "devices", "assignments", "history"];
  const requestedTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const currentTab = requestedTab && availableTabs.includes(requestedTab) ? requestedTab : "profile";
  const statusOptions = Object.values(SupportedUserStatus).map((status) => ({
    label: formatLabel(status),
    value: status,
  }));

  return (
    <div className="space-y-6">
      <section className="panel rounded-[1.6rem] p-6">
        <p className="eyebrow">Supported User</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{supportedUser.displayName}</h1>
            <p className="mt-2 text-sm text-muted">
              Profile, device access, assignments, and patient-facing audio controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Status</p>
              <p className="mt-1 text-sm font-semibold">{formatLabel(supportedUser.status)}</p>
            </div>
            <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Linked Devices</p>
              <p className="mt-1 text-sm font-semibold">{supportedUser.deviceLinks.length}</p>
            </div>
          </div>
        </div>
      </section>

      <PortalTabs
        basePath={`/portal/users/${supportedUser.id}`}
        currentTab={currentTab}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "helper-audio", label: "Helper Audio" },
          { id: "devices", label: "Devices" },
          { id: "assignments", label: "Assignments" },
          { id: "history", label: "History" },
        ]}
      />

      {currentTab === "profile" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Profile</p>
          <form action={updateSupportedUserAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="supportedUserId" value={supportedUser.id} />
            <label className="space-y-2 text-sm font-semibold">
              <span>First Name</span>
              <input name="firstName" className="field" defaultValue={supportedUser.firstName} required />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Last Name</span>
              <input name="lastName" className="field" defaultValue={supportedUser.lastName} required />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Display Name</span>
              <input name="displayName" className="field" defaultValue={supportedUser.displayName} required />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Date of Birth</span>
              <input
                name="dateOfBirth"
                type="date"
                className="field"
                defaultValue={
                  supportedUser.dateOfBirth
                    ? supportedUser.dateOfBirth.toISOString().slice(0, 10)
                    : ""
                }
              />
            </label>
            <label className="space-y-2 text-sm font-semibold md:col-span-2">
              <span>Status</span>
              <PortalSelect
                name="status"
                defaultValue={supportedUser.status}
                options={statusOptions}
              />
            </label>
            <div className="pt-6 md:col-span-2">
              <button type="submit" className="button-primary w-full">
                Save Profile
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {currentTab === "helper-audio" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Helper Audio</p>
          <h2 className="mt-2 text-2xl font-semibold">Home Screen Voice Prompt</h2>
          <p className="mt-3 text-sm text-muted">
            Add a short caregiver recording the patient can replay from the main routines screen.
          </p>
          <VoicePromptUsageNotice
            used={voicePromptUsage.used}
            limit={voicePromptUsage.limit}
            className="mt-4"
          />

          {supportedUser.helperAudioUrl ? (
            <audio controls className="mt-5 w-full">
              <source src={supportedUser.helperAudioUrl} />
            </audio>
          ) : (
            <div className="mt-5 rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-4 text-sm text-muted">
              No helper audio uploaded yet.
            </div>
          )}

          <form action={updateSupportedUserHelperAudioAction} className="mt-5 space-y-4">
            <input type="hidden" name="supportedUserId" value={supportedUser.id} />
            <AudioUploadField
              name="helperAudioFile"
              label="Upload or Record Audio"
              inputClassName="field file-field"
            />
            {supportedUser.helperAudioUrl ? (
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" className="button-primary">
                  Save Helper Audio
                </button>
                <button
                  type="submit"
                  name="clearHelperAudio"
                  value="true"
                  className="button-secondary !py-3"
                >
                  Remove Audio
                </button>
              </div>
            ) : (
              <div className="pt-4">
                <button type="submit" className="button-primary w-full">
                  Save Helper Audio
                </button>
              </div>
            )}
          </form>
        </section>
      ) : null}

      {currentTab === "devices" ? (
        <section className="space-y-6">
          <div className="panel rounded-[1.6rem] p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="eyebrow">Device Linking</p>
                <h2 className="mt-2 text-2xl font-semibold">Pair This User to a Mobile Device</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <PairDeviceHelpModal hasPendingCode={Boolean(pendingCode)} />
                <form action={createPairingCodeAction}>
                  <input type="hidden" name="supportedUserId" value={supportedUser.id} />
                  <button type="submit" className="button-primary">
                    Generate Code
                  </button>
                </form>
              </div>
            </div>

            {pendingCode ? (
              <div className="mt-5 rounded-[1.2rem] border border-[#b7d4cf] bg-[#e0efeb] p-5">
                <p className="text-sm font-semibold text-accent">Current Pairing Code</p>
                <p className="mt-3 text-5xl font-black tracking-[0.28em] text-accent">
                  {pendingCode.pairingCode}
                </p>
                <p className="mt-3 text-sm text-accent">
                  Expires {formatDateTime(pendingCode.pairingExpiresAt)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Generate a short-lived pairing code, then enter it on the mobile device during setup.
              </p>
            )}
          </div>

          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Linked Devices</p>
            <div className="mt-4 space-y-3">
              {supportedUser.deviceLinks.length ? (
                supportedUser.deviceLinks.map((deviceLink) => (
                  <div key={deviceLink.id} className="rounded-[1.1rem] border border-line bg-[#f7fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{deviceLink.deviceName ?? "Pending Device"}</p>
                        <p className="text-sm text-muted">
                          {formatLabel(deviceLink.status)} · Created {formatDateTime(deviceLink.createdAt)}
                        </p>
                      </div>
                      {deviceLink.status !== DeviceLinkStatus.REVOKED ? (
                        <form action={revokeDeviceLinkAction}>
                          <input type="hidden" name="deviceLinkId" value={deviceLink.id} />
                          <button type="submit" className="button-secondary !py-3">
                            Revoke
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-4 text-sm text-muted">
                  No linked devices yet.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {currentTab === "assignments" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Assigned Routines</p>
          <div className="mt-4 space-y-3">
            {supportedUser.assignments.filter((assignment) => assignment.active).length ? (
              supportedUser.assignments
                .filter((assignment) => assignment.active)
                .map((assignment) => (
                  <div key={assignment.id} className="rounded-[1.1rem] border border-line bg-[#f7fafc] p-4">
                    <p className="font-semibold">{assignment.routine.title}</p>
                    <p className="text-sm text-muted">
                      {formatLabel(assignment.routine.status)} · {formatRoutineSchedule(assignment)} · Assigned{" "}
                      {formatDateTime(assignment.assignedAt)}
                    </p>
                  </div>
                ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-4 text-sm text-muted">
                No active assignments yet.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {currentTab === "history" ? (
        <section className="panel rounded-[1.6rem] p-6">
          <p className="eyebrow">Recent Sessions</p>
          <div className="mt-4 space-y-3">
            {supportedUser.sessions.length ? (
              supportedUser.sessions.map((session) => (
                <div key={session.id} className="rounded-[1.1rem] border border-line bg-[#f7fafc] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.routine.title}</p>
                      <p className="text-sm text-muted">{session.stepResults.length} responses</p>
                    </div>
                    <p className="text-sm text-muted">{formatDateTime(session.startedAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-4 text-sm text-muted">
                No sessions recorded yet.
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
