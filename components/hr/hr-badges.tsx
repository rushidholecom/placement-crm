import type { HrPriority, HrStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatHrPriority, formatHrStatus } from "@/lib/hr/format";

export function HrStatusBadge({ status }: { status: HrStatus }) {
  const className =
    status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : status === "FOLLOW_UP"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        : status === "DO_NOT_CONTACT"
          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return <Badge className={className}>{formatHrStatus(status)}</Badge>;
}

export function HrPriorityBadge({ priority }: { priority: HrPriority }) {
  const className =
    priority === "URGENT"
      ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
      : priority === "HIGH"
        ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
        : priority === "MEDIUM"
          ? "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return <Badge className={className}>{formatHrPriority(priority)}</Badge>;
}
