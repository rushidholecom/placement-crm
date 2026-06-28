import type { ActivityType, HrPriority, HrStatus } from "@prisma/client";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatHrPriority(priority: HrPriority) {
  const labels: Record<HrPriority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent"
  };

  return labels[priority];
}

export function formatHrStatus(status: HrStatus) {
  const labels: Record<HrStatus, string> = {
    ACTIVE: "Active",
    FOLLOW_UP: "Follow-up",
    DO_NOT_CONTACT: "Do not contact",
    INACTIVE: "Inactive"
  };

  return labels[status];
}

export function formatActivityType(type: ActivityType) {
  const labels: Record<ActivityType, string> = {
    NOTE: "Note",
    CALL: "Call",
    EMAIL: "Email",
    FOLLOW_UP: "Follow-up",
    VACANCY: "Vacancy",
    HR: "HR"
  };

  return labels[type];
}

export function formatDate(value?: Date | null) {
  return value ? dateFormatter.format(value) : "Not scheduled";
}

export function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}
