import Link from "next/link";
import type { HrQueryInput } from "@/lib/hr/validators";
import { Button } from "@/components/ui/button";

type HrPaginationProps = {
  filters: HrQueryInput;
  totalCount: number;
  totalPages: number;
};

function buildPageHref(filters: HrQueryInput, page: number) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.companyId) params.set("companyId", filters.companyId);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.status) params.set("status", filters.status);
  if (filters.city) params.set("city", filters.city);
  params.set("sortBy", filters.sortBy);
  params.set("sortOrder", filters.sortOrder);
  params.set("page", page.toString());

  return `/dashboard/hr?${params.toString()}`;
}

export function HrPagination({
  filters,
  totalCount,
  totalPages
}: HrPaginationProps) {
  const page = filters.page;

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/90 px-5 py-4 text-sm dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Showing page {page} of {totalPages} with {totalCount} matching HR contacts
      </p>
      <div className="flex gap-2">
        <Link href={buildPageHref(filters, Math.max(1, page - 1))}>
          <Button variant="outline" size="sm" disabled={page <= 1}>
            Previous
          </Button>
        </Link>
        <Link href={buildPageHref(filters, Math.min(totalPages, page + 1))}>
          <Button variant="outline" size="sm" disabled={page >= totalPages}>
            Next
          </Button>
        </Link>
      </div>
    </div>
  );
}
