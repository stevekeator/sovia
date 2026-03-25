import { RoutineScheduleType } from "@prisma/client";

import {
  assignRoutineAction,
  removeAssignmentAction,
  updateAssignmentScheduleAction,
} from "@/app/(portal)/portal/actions";
import { AssignmentScheduleFields } from "@/components/portal/assignment-schedule-fields";
import { PortalSelect } from "@/components/portal/portal-select";
import { requirePortalAccess } from "@/lib/auth/session";
import { getAssignmentsView } from "@/lib/services/portal";
import { formatDateTime, formatRoutineSchedule } from "@/lib/utils";

export default async function AssignmentsPage() {
  const user = await requirePortalAccess();
  const { routines, supportedUsers, assignments } = await getAssignmentsView(user);
  const routineOptions = routines.map((routine) => ({
    label: routine.title,
    value: routine.id,
  }));
  const supportedUserOptions = supportedUsers.map((supportedUser) => ({
    label: supportedUser.displayName,
    value: supportedUser.id,
  }));

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6">
        <p className="eyebrow">Assign Routine</p>
        <h1 className="mt-3 text-3xl font-semibold">Link a Routine to a Supported User</h1>
        <form action={assignRoutineAction} className="mt-6 space-y-4">
          <label className="space-y-2 text-sm font-semibold">
            <span>Routine</span>
            <PortalSelect
              name="routineId"
              defaultValue=""
              placeholder="Choose Routine"
              options={routineOptions}
            />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Supported User</span>
            <PortalSelect
              name="supportedUserId"
              defaultValue=""
              placeholder="Choose Supported User"
              options={supportedUserOptions}
            />
          </label>
          <AssignmentScheduleFields />
          <div className="pt-6">
            <button type="submit" className="button-primary w-full">
              Create Assignment
            </button>
          </div>
        </form>
      </section>

      <section className="panel rounded-[2rem] p-6">
        <p className="eyebrow">Current Assignments</p>
        <div className="mt-5 space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-[1.4rem] border border-line bg-white/75 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {assignment.routine.title} → {assignment.supportedUser.displayName}
                  </p>
                  <p className="text-sm text-muted">
                    {formatRoutineSchedule(assignment)} · Assigned{" "}
                    {formatDateTime(assignment.assignedAt)}
                  </p>
                </div>
                <form action={removeAssignmentAction}>
                  <input type="hidden" name="assignmentId" value={assignment.id} />
                  <button type="submit" className="button-secondary !py-3">
                    Remove
                  </button>
                </form>
              </div>

              <form action={updateAssignmentScheduleAction} className="mt-4 space-y-4">
                <input type="hidden" name="assignmentId" value={assignment.id} />
                <AssignmentScheduleFields
                  defaultScheduleType={assignment.scheduleType}
                  defaultTimesPerDay={assignment.timesPerDay}
                  defaultDaysOfWeek={assignment.daysOfWeek}
                  defaultScheduledTimes={assignment.scheduledTimes}
                />
                <div className="pt-2">
                  <button type="submit" className="button-secondary w-full !py-3">
                    Save Schedule
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
