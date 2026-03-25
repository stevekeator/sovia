"use client";

import { RoutineScheduleType } from "@prisma/client";
import { useState } from "react";

import { buildDefaultScheduledTimes, formatLabel, routineScheduleDayOptions } from "@/lib/utils";
import { PortalSelect } from "@/components/portal/portal-select";

function normalizeScheduledTimes(defaultScheduledTimes?: string[], defaultTimesPerDay?: number) {
  const filtered = (defaultScheduledTimes ?? []).filter((value) => /^\d{2}:\d{2}$/.test(value));

  if (filtered.length) {
    return filtered.slice().sort();
  }

  return buildDefaultScheduledTimes(defaultTimesPerDay ?? 1);
}

export function AssignmentScheduleFields(props: {
  defaultDaysOfWeek?: string[];
  defaultScheduleType?: string;
  defaultScheduledTimes?: string[];
  defaultTimesPerDay?: number;
}) {
  const defaultScheduleType = props.defaultScheduleType ?? RoutineScheduleType.DAILY;
  const [scheduleType, setScheduleType] = useState(defaultScheduleType);
  const [scheduledTimes, setScheduledTimes] = useState(() =>
    normalizeScheduledTimes(props.defaultScheduledTimes, props.defaultTimesPerDay),
  );

  const scheduleTypeOptions = [
    {
      label: "Daily",
      value: RoutineScheduleType.DAILY,
      description: "Routine appears every day at the selected times.",
    },
    {
      label: "Weekly",
      value: RoutineScheduleType.WEEKLY,
      description: "Routine appears on selected days at the selected times.",
    },
  ];

  function updateTime(index: number, nextValue: string) {
    setScheduledTimes((currentTimes) =>
      currentTimes.map((value, currentIndex) => (currentIndex === index ? nextValue : value)),
    );
  }

  function addTimeSlot() {
    setScheduledTimes((currentTimes) => [...currentTimes, "09:00"]);
  }

  function removeTimeSlot(index: number) {
    setScheduledTimes((currentTimes) =>
      currentTimes.length === 1 ? currentTimes : currentTimes.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  return (
    <>
      <label className="max-w-[18rem] space-y-2 text-sm font-semibold">
        <span>Schedule Type</span>
        <PortalSelect
          name="scheduleType"
          defaultValue={scheduleType}
          options={scheduleTypeOptions}
          onValueChange={setScheduleType}
        />
      </label>

      {scheduleType === RoutineScheduleType.WEEKLY ? (
        <fieldset className="space-y-3 text-sm font-semibold">
          <legend>Days of Week</legend>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {routineScheduleDayOptions.map((day) => (
              <label
                key={day}
                className="flex items-center gap-2 rounded-[1rem] border border-line bg-white/70 px-3 py-3 text-sm font-medium"
              >
                <input
                  type="checkbox"
                  name="daysOfWeek"
                  value={day}
                  defaultChecked={props.defaultDaysOfWeek?.includes(day)}
                />
                <span>{formatLabel(day)}</span>
              </label>
            ))}
          </div>
          <p className="text-sm font-normal text-muted">
            Select the weekdays when this routine should become available.
          </p>
        </fieldset>
      ) : null}

      <fieldset className="space-y-3 text-sm font-semibold">
        <legend>Scheduled Times</legend>
        <div className="grid gap-3 lg:grid-cols-2">
          {scheduledTimes.map((timeValue, index) => (
            <div
              key={`${index}-${timeValue}`}
              className="flex flex-wrap items-center gap-3 rounded-[1rem] border border-line bg-white/70 px-3 py-3"
            >
              <input
                name="scheduledTimes"
                type="time"
                value={timeValue}
                onChange={(event) => updateTime(index, event.target.value)}
                className="field max-w-[12rem]"
              />
              <button
                type="button"
                className="button-secondary !py-3"
                onClick={() => removeTimeSlot(index)}
                disabled={scheduledTimes.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="button" className="button-secondary !py-3" onClick={addTimeSlot}>
            Add Time
          </button>
          <span className="text-sm font-normal text-muted">
            {scheduledTimes.length} {scheduledTimes.length === 1 ? "scheduled time" : "scheduled times"} per active day.
          </span>
        </div>
        <p className="text-sm font-normal text-muted">
          Time-based schedules drive routine availability now and will support device notifications later.
        </p>
      </fieldset>
    </>
  );
}
