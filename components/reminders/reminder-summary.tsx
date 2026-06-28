import { BellRing, CalendarClock, Clock4, Flame, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReminderBucketCount } from "@/lib/reminders/types";

type ReminderSummaryProps = {
  counts: ReminderBucketCount;
  totalUnread: number;
};

const summaryItems: Array<{
  key: keyof ReminderBucketCount;
  label: string;
  icon: LucideIcon;
  helper: string;
}> = [
  {
    key: "OVERDUE",
    label: "Overdue",
    icon: Flame,
    helper: "Needs attention first"
  },
  {
    key: "URGENT",
    label: "Urgent",
    icon: BellRing,
    helper: "Priority reminders"
  },
  {
    key: "TODAY",
    label: "Today",
    icon: CalendarClock,
    helper: "Due today"
  },
  {
    key: "TOMORROW",
    label: "Tomorrow",
    icon: Clock4,
    helper: "Due tomorrow"
  }
];

export function ReminderSummary({ counts, totalUnread }: ReminderSummaryProps) {
  return (
    <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Reminder Pulse</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily follow-up reminders generated at 10:30 AM IST.
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          {totalUnread} active
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.key} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                      {counts[item.key]}
                    </p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {item.helper}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
