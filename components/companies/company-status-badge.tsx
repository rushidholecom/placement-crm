import type { CompanyStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatCompanyStatus } from "@/lib/company/format";

type CompanyStatusBadgeProps = {
  status: CompanyStatus;
};

export function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  const className =
    status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : status === "PROSPECT"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        : status === "ON_HOLD"
          ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300";

  return <Badge className={className}>{formatCompanyStatus(status)}</Badge>;
}
