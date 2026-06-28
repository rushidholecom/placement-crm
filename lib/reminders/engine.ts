import { FollowUpStatus, ReminderBucket, ReminderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  REMINDER_CUTOFF_HOUR,
  REMINDER_CUTOFF_MINUTE,
  REMINDER_TIME_ZONE
} from "@/lib/reminders/constants";

type IndiaDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

type ReminderSweepResult = {
  created: number;
  updated: number;
  completed: number;
  deleted: number;
  skipped: number;
};

type ReminderEngineState = {
  lastRunKey?: string;
  inFlight?: Promise<ReminderSweepResult>;
};

const globalReminderEngineState =
  globalThis as typeof globalThis & {
    __placementCrmReminderEngine?: ReminderEngineState;
  };

function getEngineState() {
  if (!globalReminderEngineState.__placementCrmReminderEngine) {
    globalReminderEngineState.__placementCrmReminderEngine = {};
  }

  return globalReminderEngineState.__placementCrmReminderEngine;
}

function getIndiaDateParts(date: Date): IndiaDateParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: REMINDER_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  ) as Record<string, string>;

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute)
  };
}

function formatIndiaDateKey(parts: IndiaDateParts) {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function addIndiaDays(parts: IndiaDateParts, days: number) {
  const utc = Date.UTC(parts.year, parts.month - 1, parts.day + days, 0, 0, 0);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: REMINDER_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const next = formatter.formatToParts(new Date(utc));
  const lookup = Object.fromEntries(
    next.map((part) => [part.type, part.value])
  ) as Record<string, string>;

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute)
  };
}

function isAfterCutoff(parts: IndiaDateParts) {
  return (
    parts.hour > REMINDER_CUTOFF_HOUR ||
    (parts.hour === REMINDER_CUTOFF_HOUR &&
      parts.minute >= REMINDER_CUTOFF_MINUTE)
  );
}

function getIndiaDayWindow(now: Date, offsetDays = 0) {
  const nowParts = getIndiaDateParts(now);
  const target = addIndiaDays(nowParts, offsetDays);
  const dateKey = formatIndiaDateKey(target);

  return {
    dateKey,
    start: new Date(`${dateKey}T00:00:00.000+05:30`),
    end: new Date(`${dateKey}T23:59:59.999+05:30`)
  };
}

function getReminderBucket(dueAt: Date, now: Date) {
  const today = getIndiaDayWindow(now, 0);
  const tomorrow = getIndiaDayWindow(now, 1);
  const dayAfterTomorrow = getIndiaDayWindow(now, 2);
  const urgentWindowEnd = new Date(now.getTime() + 1000 * 60 * 60 * 6);

  if (dueAt < today.start) {
    return ReminderBucket.OVERDUE;
  }

  if (dueAt <= urgentWindowEnd) {
    return ReminderBucket.URGENT;
  }

  if (dueAt >= today.start && dueAt <= today.end) {
    return ReminderBucket.TODAY;
  }

  if (dueAt >= tomorrow.start && dueAt <= tomorrow.end) {
    return ReminderBucket.TOMORROW;
  }

  if (dueAt < dayAfterTomorrow.start) {
    return ReminderBucket.TOMORROW;
  }

  return null;
}

function buildDescription({
  title,
  companyName,
  hrName,
  dueAt,
  bucket
}: {
  title: string;
  companyName: string;
  hrName: string | null;
  dueAt: Date;
  bucket: ReminderBucket;
}) {
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: REMINDER_TIME_ZONE
  }).format(dueAt);

  const audience = hrName ? `${companyName} - ${hrName}` : companyName;
  const bucketText =
    bucket === ReminderBucket.OVERDUE
      ? "is overdue"
      : bucket === ReminderBucket.URGENT
        ? "needs urgent attention"
        : bucket === ReminderBucket.TODAY
          ? "is due today"
          : "is due tomorrow";

  return `${title} for ${audience} ${bucketText}. Due ${dateLabel}.`;
}

function buildScheduledFor(now: Date) {
  const parts = getIndiaDateParts(now);
  const dateKey = formatIndiaDateKey(parts);
  return new Date(`${dateKey}T10:30:00.000+05:30`);
}

async function executeFollowUpReminderSweep(now = new Date()) {
  const indiaParts = getIndiaDateParts(now);

  if (!isAfterCutoff(indiaParts)) {
    return {
      created: 0,
      updated: 0,
      completed: 0,
      deleted: 0,
      skipped: 0
    };
  }

  const scheduledFor = buildScheduledFor(now);
  const reminders = await prisma.followUpReminder.findMany({
    include: {
      followUp: {
        include: {
          company: {
            select: {
              name: true
            }
          },
          hrContact: {
            select: {
              fullName: true
            }
          }
        }
      }
    }
  });

  const openReminders = reminders.filter(
    (reminder) => reminder.status === ReminderStatus.UNREAD
  );

  const remindersByFollowUpId = new Map(
    reminders.map((reminder) => [reminder.followUpId, reminder])
  );

  const pendingFollowUps = await prisma.followUp.findMany({
    where: {
      status: FollowUpStatus.PENDING
    },
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
  });

  const pendingMap = new Map(pendingFollowUps.map((item) => [item.id, item]));
  const remindersToKeep = new Set<string>();

  let created = 0;
  let updated = 0;
  let completed = 0;
  let deleted = 0;
  let skipped = 0;

  for (const reminder of openReminders) {
    const followUp = pendingMap.get(reminder.followUpId);

    if (!followUp) {
      await prisma.followUpReminder.update({
        where: { id: reminder.id },
        data: {
          status: ReminderStatus.DONE,
          doneAt: now
        }
      });
      completed += 1;
      continue;
    }

    const bucket = getReminderBucket(followUp.dueAt, now);

    if (!bucket) {
      await prisma.followUpReminder.delete({
        where: { id: reminder.id }
      });
      deleted += 1;
      continue;
    }

    remindersToKeep.add(followUp.id);

    const title = `${followUp.subject} reminder`;
    const description = buildDescription({
      title: followUp.subject,
      companyName: followUp.company.name,
      hrName: followUp.hrContact?.fullName ?? null,
      dueAt: followUp.dueAt,
      bucket
    });

    const needsUpdate =
      reminder.bucket !== bucket ||
      reminder.title !== title ||
      reminder.description !== description ||
      reminder.dueAt.getTime() !== followUp.dueAt.getTime() ||
      reminder.scheduledFor.getTime() !== scheduledFor.getTime();

    if (needsUpdate) {
      await prisma.followUpReminder.update({
        where: { id: reminder.id },
        data: {
          bucket,
          title,
          description,
          dueAt: followUp.dueAt,
          scheduledFor,
          companyId: followUp.companyId,
          hrContactId: followUp.hrContactId
        }
      });
      updated += 1;
    } else {
      skipped += 1;
    }
  }

  for (const followUp of pendingFollowUps) {
    if (remindersToKeep.has(followUp.id)) {
      continue;
    }

    const existingReminder = remindersByFollowUpId.get(followUp.id);

    if (existingReminder && existingReminder.status !== ReminderStatus.UNREAD) {
      continue;
    }

    const bucket = getReminderBucket(followUp.dueAt, now);

    if (!bucket) {
      continue;
    }

    const title = `${followUp.subject} reminder`;
    const description = buildDescription({
      title: followUp.subject,
      companyName: followUp.company.name,
      hrName: followUp.hrContact?.fullName ?? null,
      dueAt: followUp.dueAt,
      bucket
    });

    await prisma.followUpReminder.create({
      data: {
        followUpId: followUp.id,
        companyId: followUp.companyId,
        hrContactId: followUp.hrContactId,
        bucket,
        title,
        description,
        dueAt: followUp.dueAt,
        scheduledFor
      }
    });
    created += 1;
  }

  return { created, updated, completed, deleted, skipped };
}

export async function runFollowUpReminderSweep(now = new Date()) {
  const state = getEngineState();
  const runKey = getReminderRunKey(now);

  if (state.lastRunKey === runKey) {
    return {
      created: 0,
      updated: 0,
      completed: 0,
      deleted: 0,
      skipped: 0
    };
  }

  if (state.inFlight) {
    return state.inFlight;
  }

  state.inFlight = executeFollowUpReminderSweep(now)
    .then((result) => {
      state.lastRunKey = runKey;
      return result;
    })
    .finally(() => {
      state.inFlight = undefined;
    });

  return state.inFlight;
}

export function getReminderRunKey(now = new Date()) {
  const parts = getIndiaDateParts(now);
  return formatIndiaDateKey(parts);
}

export function shouldRunReminderSweep(now = new Date()) {
  return isAfterCutoff(getIndiaDateParts(now));
}
