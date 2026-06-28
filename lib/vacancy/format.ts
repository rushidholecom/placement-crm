import type { VacancyPriority, VacancyStatus } from "@prisma/client";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatVacancyPriority(priority: VacancyPriority) {
  return { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" }[priority];
}

export function formatVacancyStatus(status: VacancyStatus) {
  return {
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    ON_HOLD: "On hold",
    CLOSED: "Closed"
  }[status];
}

export function formatSalary(value: number) {
  return `${value.toLocaleString("en-IN")} LPA`;
}

export function formatDate(value?: Date | null) {
  return value ? dateFormatter.format(value) : "Not scheduled";
}

export function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}
