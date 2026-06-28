import type { Activity, FollowUp } from "@prisma/client";
import { formatActivityType, formatDate, formatDateTime } from "@/lib/hr/format";

type HrTimelineProps = {
  activities: Activity[];
  followUps: FollowUp[];
};

export function HrTimeline({ activities, followUps }: HrTimelineProps) {
  const items = [
    ...activities.map((activity) => ({
      id: `activity-${activity.id}`,
      title: activity.title,
      description: activity.description,
      meta: formatActivityType(activity.type),
      date: activity.createdAt,
      dateLabel: formatDateTime(activity.createdAt)
    })),
    ...followUps.map((followUp) => ({
      id: `follow-up-${followUp.id}`,
      title: followUp.subject,
      description: followUp.notes,
      meta: `${followUp.type} - ${followUp.status}`,
      date: followUp.dueAt,
      dateLabel: formatDate(followUp.dueAt)
    }))
  ].sort((first, second) => second.date.getTime() - first.date.getTime());

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800">
        No timeline activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="relative rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-50">
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {item.meta}
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{item.dateLabel}</p>
        </div>
      ))}
    </div>
  );
}
