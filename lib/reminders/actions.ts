"use server";

import { ActivityType, FollowUpStatus, ReminderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidateReminderSurfaces } from "@/lib/reminders/revalidate";
import { revalidateDashboard } from "@/lib/dashboard/revalidate";

async function resolveReminder(reminderId: string, status: ReminderStatus) {
  const reminder = await prisma.followUpReminder.findUnique({
    where: { id: reminderId },
    include: {
      followUp: true
    }
  });

  if (!reminder) {
    return {
      success: false,
      message: "Notification not found."
    };
  }

  if (reminder.status !== ReminderStatus.UNREAD) {
    return {
      success: true,
      message: "Notification already handled."
    };
  }

  const now = new Date();

  if (status === ReminderStatus.DONE) {
    await prisma.$transaction([
      prisma.followUpReminder.update({
        where: { id: reminderId },
        data: {
          status: ReminderStatus.DONE,
          doneAt: now
        }
      }),
      prisma.followUp.update({
        where: { id: reminder.followUpId },
        data: {
          status: FollowUpStatus.COMPLETED,
          completedAt: now
        }
      }),
      prisma.activity.create({
        data: {
          companyId: reminder.companyId,
          hrContactId: reminder.hrContactId,
          title: "Follow-up completed",
          description: `${reminder.title} was marked as done from the reminder bell.`,
          type: ActivityType.FOLLOW_UP
        }
      })
    ]);
  } else {
    await prisma.followUpReminder.update({
      where: { id: reminderId },
      data: {
        status: ReminderStatus.DISMISSED,
        dismissedAt: now
      }
    });
  }

  await revalidateReminderSurfaces();
  await revalidateDashboard();

  return {
    success: true,
    message: status === ReminderStatus.DONE ? "Notification marked as done." : "Notification dismissed."
  };
}

export async function markReminderDoneAction(reminderId: string) {
  return resolveReminder(reminderId, ReminderStatus.DONE);
}

export async function dismissReminderAction(reminderId: string) {
  return resolveReminder(reminderId, ReminderStatus.DISMISSED);
}
