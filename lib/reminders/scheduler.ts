import { getReminderRunKey, runFollowUpReminderSweep, shouldRunReminderSweep } from "@/lib/reminders/engine";

type ReminderSchedulerState = {
  timer?: NodeJS.Timeout;
  lastRunKey?: string;
};

const globalReminderScheduler =
  globalThis as typeof globalThis & {
    __placementCrmReminderScheduler?: ReminderSchedulerState;
  };

function getState(): ReminderSchedulerState {
  if (!globalReminderScheduler.__placementCrmReminderScheduler) {
    globalReminderScheduler.__placementCrmReminderScheduler = {};
  }

  return globalReminderScheduler.__placementCrmReminderScheduler;
}

async function tick() {
  const state = getState();
  const now = new Date();
  const runKey = getReminderRunKey(now);

  if (!shouldRunReminderSweep(now)) {
    return;
  }

  if (state.lastRunKey === runKey) {
    return;
  }

  await runFollowUpReminderSweep(now);
  state.lastRunKey = runKey;
}

export function startReminderScheduler() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const state = getState();

  if (state.timer) {
    return;
  }

  void tick().catch((error) => {
    console.error("Follow-up reminder sweep failed:", error);
  });

  const timer = setInterval(() => {
    void tick().catch((error) => {
      console.error("Follow-up reminder sweep failed:", error);
    });
  }, 60_000);

  timer.unref?.();
  state.timer = timer;
}
