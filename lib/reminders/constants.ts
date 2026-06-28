export const REMINDER_TIME_ZONE = "Asia/Kolkata";
export const REMINDER_CUTOFF_HOUR = 10;
export const REMINDER_CUTOFF_MINUTE = 30;

export const reminderBucketLabels = {
  TODAY: "Today",
  TOMORROW: "Tomorrow",
  OVERDUE: "Overdue",
  URGENT: "Urgent"
} as const;

export const reminderStatusLabels = {
  UNREAD: "Unread",
  DONE: "Done",
  DISMISSED: "Dismissed"
} as const;
