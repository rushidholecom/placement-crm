import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentSession } from "@/lib/auth/session";
import { startReminderScheduler } from "@/lib/reminders/scheduler";
import { getReminderPanelData } from "@/lib/reminders/queries";

export default async function AppLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();
  startReminderScheduler();

  if (!session) {
    redirect("/login");
  }

  const reminders = await getReminderPanelData();

  return (
    <AppShell user={session.user} reminders={reminders}>
      {children}
    </AppShell>
  );
}
