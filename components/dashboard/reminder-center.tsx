import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ReminderList } from "@/components/reminders/reminder-list";
import { ReminderSummary } from "@/components/reminders/reminder-summary";
import type { ReminderOverview } from "@/lib/reminders/types";

type ReminderCenterProps = {
  data: ReminderOverview;
};

export function ReminderCenter({ data }: ReminderCenterProps) {
  return (
    <div className="space-y-6">
      <ReminderSummary counts={data.bucketCounts} totalUnread={data.totalUnread} />
      <DashboardSection
        title="Notifications"
        description="Your follow-up reminders, ordered by urgency and due date."
      >
        <ReminderList items={data.reminders} compact />
      </DashboardSection>
    </div>
  );
}
