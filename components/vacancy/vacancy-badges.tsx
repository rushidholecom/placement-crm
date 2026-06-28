import type { VacancyPriority, VacancyStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatVacancyPriority, formatVacancyStatus } from "@/lib/vacancy/format";

export function VacancyStatusBadge({ status }: { status: VacancyStatus }) {
  const className =
    status === "OPEN"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : status === "IN_PROGRESS"
        ? "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
        : status === "ON_HOLD"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return <Badge className={className}>{formatVacancyStatus(status)}</Badge>;
}

export function VacancyPriorityBadge({ priority }: { priority: VacancyPriority }) {
  const className =
    priority === "URGENT"
      ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
      : priority === "HIGH"
        ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
        : priority === "MEDIUM"
          ? "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return <Badge className={className}>{formatVacancyPriority(priority)}</Badge>;
}
