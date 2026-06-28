import { NextResponse } from "next/server";
import { runFollowUpReminderSweep, shouldRunReminderSweep } from "@/lib/reminders/engine";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const providedSecret = new URL(request.url).searchParams.get("secret") ?? request.headers.get("x-cron-secret");

  if (secret && providedSecret !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!shouldRunReminderSweep()) {
    return NextResponse.json({
      message: "Reminder sweep skipped before 10:30 AM IST."
    });
  }

  const result = await runFollowUpReminderSweep();

  return NextResponse.json({
    message: "Follow-up reminders processed.",
    result
  });
}
