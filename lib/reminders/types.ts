import type { FollowUpReminder, ReminderBucket, ReminderStatus } from "@prisma/client";

export type ReminderItem = FollowUpReminder & {
  company: {
    id: string;
    name: string;
  };
  hrContact: {
    id: string;
    fullName: string;
  } | null;
};

export type ReminderBucketCount = Record<ReminderBucket, number>;

export type ReminderOverview = {
  totalUnread: number;
  bucketCounts: ReminderBucketCount;
  reminders: ReminderItem[];
};

export type ReminderActionResult = {
  success: boolean;
  message: string;
};

export type ReminderStatusType = ReminderStatus;
