import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  CalendarClock,
  Mail,
  Pencil,
  PhoneCall,
  Trash2,
  MessageSquareMore,
  History
} from "lucide-react";
import type { VacancyTimelineItem } from "@/lib/vacancy/queries";
import { formatDateTime } from "@/lib/vacancy/format";

type VacancyTimelineProps = {
  items: VacancyTimelineItem[];
};

function getTimelineIcon(kind: VacancyTimelineItem["kind"], title: string): LucideIcon {
  const normalized = title.toLowerCase();

  if (kind === "delete") return Trash2;
  if (kind === "create") return BriefcaseBusiness;
  if (kind === "update") return Pencil;
  if (normalized.includes("email")) return Mail;
  if (normalized.includes("call") || normalized.includes("phone")) return PhoneCall;
  if (normalized.includes("follow")) return CalendarClock;
  if (normalized.includes("note") || normalized.includes("remark")) return MessageSquareMore;
  return History;
}

export function VacancyTimeline({ items }: VacancyTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800">
        No timeline activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = getTimelineIcon(item.kind, item.title);

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950 dark:text-slate-50">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {item.kind === "activity"
                  ? "Activity"
                  : `${item.kind.charAt(0).toUpperCase()}${item.kind.slice(1)}`}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {formatDateTime(item.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
