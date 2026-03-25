import { clsx, type ClassValue } from "clsx";

export const routineScheduleDayOptions = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const shortDayLabels: Record<(typeof routineScheduleDayOptions)[number], string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function formatLabel(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatAdminRoleLabel(value: string) {
  if (value === "SUPER_ADMIN") {
    return "Platform Admin";
  }

  return formatLabel(value);
}

export function formatSubscriptionTierLabel(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  if (value === "FAMILY_CARE_TEAM") {
    return "Family / Care Team";
  }

  return formatLabel(value);
}

export function formatRoutineSchedule(schedule: {
  scheduleType: string;
  timesPerDay: number;
  daysOfWeek: string[];
  scheduledTimes?: string[];
}) {
  const timeLabels = getNormalizedScheduledTimes(schedule).map(formatScheduledTimeLabel);
  const timesLabel = timeLabels.length
    ? `at ${timeLabels.join(", ")}`
    : `${schedule.timesPerDay} ${schedule.timesPerDay === 1 ? "time" : "times"} per day`;

  if (schedule.scheduleType === "WEEKLY") {
    const dayLabels = schedule.daysOfWeek
      .filter((day): day is (typeof routineScheduleDayOptions)[number] =>
        routineScheduleDayOptions.includes(day as (typeof routineScheduleDayOptions)[number]),
      )
      .map((day) => shortDayLabels[day]);

    return dayLabels.length ? `${dayLabels.join(", ")} ${timesLabel}` : timesLabel;
  }

  return `Daily ${timesLabel}`;
}

export function buildDefaultScheduledTimes(count: number) {
  const normalizedCount = Math.min(Math.max(count, 1), 12);

  if (normalizedCount === 1) {
    return ["09:00"];
  }

  const startMinutes = 9 * 60;
  const endMinutes = 20 * 60;
  const interval = normalizedCount === 1 ? 0 : (endMinutes - startMinutes) / (normalizedCount - 1);

  return Array.from({ length: normalizedCount }, (_, index) => {
    const totalMinutes = Math.round(startMinutes + interval * index);
    const hours = `${Math.floor(totalMinutes / 60)}`.padStart(2, "0");
    const minutes = `${totalMinutes % 60}`.padStart(2, "0");
    return `${hours}:${minutes}`;
  });
}

export function getNormalizedScheduledTimes(schedule: {
  timesPerDay: number;
  scheduledTimes?: string[];
}) {
  const normalizedTimes = (schedule.scheduledTimes ?? [])
    .filter((value): value is string => typeof value === "string" && /^\d{2}:\d{2}$/.test(value))
    .slice()
    .sort();

  return normalizedTimes.length ? normalizedTimes : buildDefaultScheduledTimes(schedule.timesPerDay);
}

export function formatScheduledTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return value;
  }

  const date = new Date(2000, 0, 1, hours, minutes, 0, 0);
  return timeFormatter.format(date);
}
