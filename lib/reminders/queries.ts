import { ReminderBucket, ReminderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { runFollowUpReminderSweep, shouldRunReminderSweep } from "@/lib/reminders/engine";
import type { ReminderBucketCount, ReminderOverview } from "@/lib/reminders/types";

function createEmptyBucketCounts(): ReminderBucketCount {
  return {
    TODAY: 0,
    TOMORROW: 0,
    OVERDUE: 0,
    URGENT: 0
  };
}

async function getActiveReminderOverview(): Promise<ReminderOverview> {
  const [reminders, counts, totalUnread] = await Promise.all([
    prisma.followUpReminder.findMany({
      where: {
        deletedAt: null,
        company: {
          deletedAt: null
        },
        followUp: {
          deletedAt: null
        },
        status: ReminderStatus.UNREAD
      },
      orderBy: [
        { dueAt: "asc" },
        { updatedAt: "desc" }
      ],
      take: 12,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        hrContact: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    }),
    prisma.followUpReminder.groupBy({
      by: ["bucket"],
      where: {
        deletedAt: null,
        company: {
          deletedAt: null
        },
        followUp: {
          deletedAt: null
        },
        status: ReminderStatus.UNREAD
      },
      _count: {
        bucket: true
      }
    }),
    prisma.followUpReminder.count({
      where: {
        deletedAt: null,
        company: {
          deletedAt: null
        },
        followUp: {
          deletedAt: null
        },
        status: ReminderStatus.UNREAD
      }
    })
  ]);

  const bucketCounts = createEmptyBucketCounts();

  for (const count of counts) {
    bucketCounts[count.bucket] = count._count.bucket;
  }

  return {
    totalUnread,
    bucketCounts,
    reminders
  };
}

export async function getReminderDashboardData() {
  if (shouldRunReminderSweep()) {
    await runFollowUpReminderSweep();
  }

  return getActiveReminderOverview();
}

export async function getReminderPanelData() {
  if (shouldRunReminderSweep()) {
    await runFollowUpReminderSweep();
  }

  return getActiveReminderOverview();
}

export function bucketOrder(bucket: ReminderBucket) {
  switch (bucket) {
    case ReminderBucket.OVERDUE:
      return 0;
    case ReminderBucket.URGENT:
      return 1;
    case ReminderBucket.TODAY:
      return 2;
    case ReminderBucket.TOMORROW:
      return 3;
    default:
      return 4;
  }
}
