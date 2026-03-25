import { RoutineScheduleType } from "@prisma/client";

import {
  addRoutineStepAction,
  archiveRoutineAction,
  assignRoutineAction,
  deleteRoutineStepAction,
  duplicateRoutineAction,
  moveRoutineStepAction,
  publishRoutineAction,
  removeAssignmentAction,
  updateRoutineAudioAction,
  updateRoutineAction,
  updateRoutineStepAction,
} from "@/app/(portal)/portal/actions";
import { AssignmentScheduleFields } from "@/components/portal/assignment-schedule-fields";
import { AudioUploadField } from "@/components/portal/audio-upload-field";
import { PortalSelect } from "@/components/portal/portal-select";
import { PortalTabs } from "@/components/portal/portal-tabs";
import { VoicePromptUsageNotice } from "@/components/portal/voice-prompt-usage-notice";
import { requirePortalAccess } from "@/lib/auth/session";
import {
  getRoutineStepLimitForTier,
  premiumFeatureMessages,
} from "@/lib/billing/subscription-plans";
import { getRoutineDetail } from "@/lib/services/portal";
import { formatLabel, formatRoutineSchedule } from "@/lib/utils";

export default async function RoutineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ routineId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const user = await requirePortalAccess();
  const { routineId } = await params;
  const resolvedSearchParams = await searchParams;
  const { routine, supportedUsers, voicePromptUsage } = await getRoutineDetail(user, routineId);
  const assignedUserIds = new Set(
    routine.assignments.filter((assignment) => assignment.active).map((assignment) => assignment.supportedUserId),
  );
  const availableTabs = ["overview", "steps", "assignments"];
  const requestedTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const currentTab = requestedTab && availableTabs.includes(requestedTab) ? requestedTab : "overview";
  const supportedUserOptions = supportedUsers
    .filter((supportedUser) => !assignedUserIds.has(supportedUser.id))
    .map((supportedUser) => ({
      label: supportedUser.displayName,
      value: supportedUser.id,
    }));
  const stepLimit = getRoutineStepLimitForTier(routine.organization.subscriptionTier);
  const isStepLimitReached = stepLimit !== null && routine.steps.length >= stepLimit;
  return (
    <div className="space-y-6">
      <section className="panel rounded-[1.6rem] p-6">
        <p className="eyebrow">Routine</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{routine.title}</h1>
            <p className="mt-2 text-sm text-muted">
              Configure routine content, patient assignment, and delivery scheduling.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Status</p>
              <p className="mt-1 text-sm font-semibold">{formatLabel(routine.status)}</p>
            </div>
            <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Version</p>
              <p className="mt-1 text-sm font-semibold">{routine.currentVersion}</p>
            </div>
            <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Active Assignments</p>
              <p className="mt-1 text-sm font-semibold">
                {routine.assignments.filter((assignment) => assignment.active).length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <PortalTabs
        basePath={`/portal/routines/${routine.id}`}
        currentTab={currentTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "steps", label: "Steps" },
          { id: "assignments", label: "Assignments" },
        ]}
      />

      {currentTab === "overview" ? (
        <section className="space-y-6">
          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Routine Details</p>
            <form action={updateRoutineAction} className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <input type="hidden" name="routineId" value={routine.id} />
              <label className="space-y-2 text-sm font-semibold">
                <span>Title</span>
                <input name="title" className="field" defaultValue={routine.title} required />
              </label>
              <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Current Status</p>
                <p className="mt-1 text-sm font-semibold">{formatLabel(routine.status)}</p>
              </div>
              <label className="space-y-2 text-sm font-semibold md:col-span-2">
                <span>Description</span>
                <textarea name="description" className="field" defaultValue={routine.description ?? ""} />
              </label>
              <div className="pt-4 md:col-span-2">
                <button type="submit" className="button-primary">
                  Save Routine Details
                </button>
              </div>
            </form>
          </div>

          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Routine Voice Prompt</p>
            <h2 className="mt-2 text-2xl font-semibold">Recorded Routine Audio</h2>
            <p className="mt-3 text-sm text-muted">
              Caregivers can record or upload a spoken prompt for this routine. If no routine
              audio is saved, the mobile app will speak the routine title automatically when the
              patient taps the audio control.
            </p>
            <VoicePromptUsageNotice
              used={voicePromptUsage.used}
              limit={voicePromptUsage.limit}
              className="mt-4"
            />

            {routine.audioUrl ? (
              <audio controls className="mt-5 w-full">
                <source src={routine.audioUrl} />
              </audio>
            ) : (
              <div className="mt-5 rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-4 text-sm text-muted">
                No routine audio uploaded yet. Mobile playback will fall back to text-to-speech.
              </div>
            )}

            <form action={updateRoutineAudioAction} className="mt-5 space-y-4">
              <input type="hidden" name="routineId" value={routine.id} />
              <AudioUploadField
                name="audioFile"
                label="Upload or Record Routine Audio"
                inputClassName="field file-field"
              />
              {routine.audioUrl ? (
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" className="button-primary">
                    Save Routine Audio
                  </button>
                  <button
                    type="submit"
                    name="clearAudio"
                    value="true"
                    className="button-secondary !py-3"
                  >
                    Remove Audio
                  </button>
                </div>
              ) : (
                <div className="pt-4">
                  <button type="submit" className="button-primary w-full">
                    Save Routine Audio
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Publishing</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={publishRoutineAction}>
                <input type="hidden" name="routineId" value={routine.id} />
                <button type="submit" className="button-primary">
                  Publish Routine
                </button>
              </form>
              <form action={duplicateRoutineAction}>
                <input type="hidden" name="routineId" value={routine.id} />
                <button type="submit" className="button-secondary">
                  Duplicate
                </button>
              </form>
              <form action={archiveRoutineAction}>
                <input type="hidden" name="routineId" value={routine.id} />
                <button type="submit" className="button-secondary">
                  Archive
                </button>
              </form>
            </div>
          </div>
        </section>
      ) : null}

      {currentTab === "steps" ? (
        <section className="space-y-6">
          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Add a Step</p>
            <VoicePromptUsageNotice
              used={voicePromptUsage.used}
              limit={voicePromptUsage.limit}
              className="mt-4"
            />
            {stepLimit !== null ? (
              <div className="mt-4 rounded-[1rem] border border-[#c7ddd5] bg-[#edf6f1] px-4 py-3 text-sm text-[#1f5f52]">
                <p className="font-semibold">
                  {premiumFeatureMessages.freeRoutineStepCapReached}.
                </p>
                <p className="mt-1 text-[#41665d]">
                  This routine currently has {routine.steps.length} of {stepLimit} available steps.
                  {isStepLimitReached ? ` ${premiumFeatureMessages.upgradeForLongerRoutines}.` : ""}
                </p>
              </div>
            ) : null}
            <form action={addRoutineStepAction} className="mt-4 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="routineId" value={routine.id} />
              <label className="space-y-2 text-sm font-semibold md:col-span-2">
                <span>Short Text</span>
                <input name="shortText" className="field" />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                <span>Upload Image</span>
                <input name="imageFile" type="file" accept="image/*" className="field file-field" />
              </label>
              <AudioUploadField
                name="audioFile"
                label="Optional Step Audio"
                inputClassName="field file-field"
              />
              <label className="space-y-2 text-sm font-semibold md:col-span-2">
                <span>External Image URL</span>
                <input name="externalImageUrl" type="url" className="field" />
              </label>
              <div className="pt-4 md:col-span-2">
                <button type="submit" className="button-primary" disabled={isStepLimitReached}>
                  Add Step
                </button>
              </div>
            </form>
          </div>

          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Routine Steps</p>
            <div className="mt-5 space-y-4">
              {routine.steps.length ? (
                routine.steps.map((step) => (
                  <article key={step.id} className="rounded-[1.3rem] border border-line bg-[#f7fafc] p-5">
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                      <div className="aspect-[4/3] overflow-hidden rounded-[1.1rem] border border-line bg-[#edf3ee]">
                        <img
                          src={step.imageUrl}
                          alt={step.shortText || `Step ${step.sortOrder}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-muted">Step {step.sortOrder}</p>
                            <p className="text-lg font-semibold">{step.shortText || "Image-Only Step"}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <form action={moveRoutineStepAction}>
                              <input type="hidden" name="stepId" value={step.id} />
                              <input type="hidden" name="direction" value="up" />
                              <button type="submit" className="button-secondary !py-3">
                                Move Up
                              </button>
                            </form>
                            <form action={moveRoutineStepAction}>
                              <input type="hidden" name="stepId" value={step.id} />
                              <input type="hidden" name="direction" value="down" />
                              <button type="submit" className="button-secondary !py-3">
                                Move Down
                              </button>
                            </form>
                            <form action={deleteRoutineStepAction}>
                              <input type="hidden" name="stepId" value={step.id} />
                              <button type="submit" className="button-secondary !py-3">
                                Delete
                              </button>
                            </form>
                          </div>
                        </div>

                        <form action={updateRoutineStepAction} className="grid gap-3 md:grid-cols-2">
                          <input type="hidden" name="stepId" value={step.id} />
                          <label className="space-y-2 text-sm font-semibold md:col-span-2">
                            <span>Short Text</span>
                            <input name="shortText" className="field" defaultValue={step.shortText ?? ""} />
                          </label>
                          <label className="space-y-2 text-sm font-semibold">
                            <span>Replace Image</span>
                            <input
                              name="imageFile"
                              type="file"
                              accept="image/*"
                              className="field file-field"
                            />
                          </label>
                          <label className="space-y-2 text-sm font-semibold">
                            <span>External Image URL</span>
                            <input name="externalImageUrl" type="url" className="field" />
                          </label>
                          <div className="space-y-3 rounded-[1rem] border border-line bg-white/70 p-4 md:col-span-2">
                            <p className="text-sm font-semibold">Step Audio Prompt</p>
                            {step.audioUrl ? (
                              <audio controls className="w-full">
                                <source src={step.audioUrl} />
                              </audio>
                            ) : (
                              <p className="text-sm text-muted">No audio prompt uploaded for this step.</p>
                            )}
                            <AudioUploadField
                              name="audioFile"
                              label="Replace or Record Audio"
                              inputClassName="field file-field"
                            />
                            {step.audioUrl ? (
                              <label className="flex items-center gap-2 text-sm font-medium text-muted">
                                <input type="checkbox" name="clearAudio" value="true" />
                                <span>Remove current audio prompt</span>
                              </label>
                            ) : null}
                          </div>
                          <div className="pt-4 md:col-span-2">
                            <button type="submit" className="button-primary">
                              Save Step
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-5 text-sm text-muted">
                  Add the first step to begin building this routine.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {currentTab === "assignments" ? (
        <section className="space-y-6">
          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Assignments</p>
            <form action={assignRoutineAction} className="mt-4 space-y-4">
              <input type="hidden" name="routineId" value={routine.id} />
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <label className="space-y-2 text-sm font-semibold">
                  <span>Supported User</span>
                  <PortalSelect
                    name="supportedUserId"
                    defaultValue=""
                    placeholder="Choose Supported User"
                    options={supportedUserOptions}
                  />
                </label>
                <div className="rounded-[1rem] border border-line bg-[#f4f7fa] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Assignment Scope</p>
                  <p className="mt-1 text-sm font-semibold">
                    {routine.assignments.filter((assignment) => assignment.active).length} Active
                  </p>
                </div>
              </div>
              <AssignmentScheduleFields defaultScheduleType={RoutineScheduleType.DAILY} />
              <div className="pt-4">
                <button type="submit" className="button-primary">
                  Assign Routine
                </button>
              </div>
            </form>
          </div>

          <div className="panel rounded-[1.6rem] p-6">
            <p className="eyebrow">Assigned Users</p>
            <div className="mt-4 space-y-3">
              {routine.assignments.filter((assignment) => assignment.active).length ? (
                routine.assignments
                  .filter((assignment) => assignment.active)
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] border border-line bg-[#f7fafc] p-4"
                    >
                      <div>
                        <p className="font-semibold">{assignment.supportedUser.displayName}</p>
                        <p className="text-sm text-muted">
                          Assigned to {assignment.supportedUser.firstName} {assignment.supportedUser.lastName} ·{" "}
                          {formatRoutineSchedule(assignment)}
                        </p>
                      </div>
                      <form action={removeAssignmentAction}>
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                        <button type="submit" className="button-secondary !py-3">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-line bg-[#f7fafc] p-4 text-sm text-muted">
                  No active assignments yet.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
