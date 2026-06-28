import type { Activity, FollowUp } from "@prisma/client";
import {
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  Mail,
  MessageSquareMore,
  PencilLine,
  Phone,
  Trash2,
  UserPlus2,
  type LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatActivityType, formatDate, formatDateTime } from "@/lib/hr/format";

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  meta: string;
  date: Date;
  dateLabel: string;
  icon: LucideIcon;
  toneClass: string;
};

type HrTimelineProps = {
  activities: Activity[];
  followUps: FollowUp[];
};

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function getActivityTone(item: Activity) {
  const text = `${item.title} ${item.description}`.toLowerCase();

  if (text.includes("deleted")) {
    return {
      icon: Trash2,
      toneClass:
        "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
    };
  }

  if (text.includes("remark")) {
    return {
      icon: MessageSquareMore,
      toneClass:
        "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-300"
    };
  }

  if (text.includes("follow-up") || text.includes("follow up")) {
    return {
      icon: CalendarClock,
      toneClass:
        "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
    };
  }

  if (item.type === "EMAIL" || text.includes("email") || text.includes("mail")) {
    return {
      icon: Mail,
      toneClass:
        "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300"
    };
  }

  if (item.type === "CALL") {
    return {
      icon: Phone,
      toneClass:
        "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
    };
  }

  if (item.type === "VACANCY" || text.includes("vacancy") || text.includes("job")) {
    return {
      icon: BriefcaseBusiness,
      toneClass:
        "border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
    };
  }

  if (text.includes("company")) {
    return {
      icon: BriefcaseBusiness,
      toneClass:
        "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
    };
  }

  if (item.type === "HR" && text.includes("updated")) {
    return {
      icon: PencilLine,
      toneClass:
        "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300"
    };
  }

  if (item.type === "HR" || text.includes("hr") || text.includes("created") || text.includes("added")) {
    return {
      icon: UserPlus2,
      toneClass:
        "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
    };
  }

  return {
    icon: BellRing,
    toneClass:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
  };
}

function toTimelineItems(activities: Activity[], followUps: FollowUp[]) {
  const activityItems: TimelineItem[] = activities.map((activity) => {
    const tone = getActivityTone(activity);

    return {
      id: `activity-${activity.id}`,
      title: activity.title,
      description: activity.description,
      meta: formatActivityType(activity.type),
      date: activity.createdAt,
      dateLabel: formatDateTime(activity.createdAt),
      icon: tone.icon,
      toneClass: tone.toneClass
    };
  });

  const followUpItems: TimelineItem[] = followUps.map((followUp) => ({
    id: `follow-up-${followUp.id}`,
    title: followUp.subject,
    description: followUp.notes,
    meta: `${formatEnumLabel(followUp.type)} - ${formatEnumLabel(followUp.status)}`,
    date: followUp.dueAt,
    dateLabel: formatDate(followUp.dueAt),
    icon: CalendarClock,
    toneClass:
      "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
  }));

  return [...activityItems, ...followUpItems].sort(
    (first, second) => second.date.getTime() - first.date.getTime()
  );
}

export function HrTimeline({ activities, followUps }: HrTimelineProps) {
  const items = toTimelineItems(activities, followUps);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800">
        No timeline activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[1.3125rem] top-0 hidden h-full w-px bg-gradient-to-b from-amber-200 via-slate-200 to-transparent md:block dark:from-amber-500/30 dark:via-slate-700 dark:to-transparent" />
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.id} className="relative md:pl-14">
              <div
                className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${item.toneClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {item.title}
                      </p>
                      <Badge
                        variant="outline"
                        className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {item.meta}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {item.dateLabel}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
