import Link from "next/link";
import { Plus, UsersRound } from "lucide-react";
import { HrFilters } from "@/components/hr/hr-filters";
import { HrPagination } from "@/components/hr/hr-pagination";
import { HrTable } from "@/components/hr/hr-table";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { getHrPage } from "@/lib/hr/queries";
import { getToastFromSearchParams } from "@/lib/toast";

export const dynamic = "force-dynamic";

type HrPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HrPage({ searchParams }: HrPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);
  const data = await getHrPage(resolvedSearchParams);

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <PageHeader
        eyebrow="HR"
        title="HR management"
        description="Manage recruiter contacts with duplicate detection, follow-up tracking, and activity history."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-muted-foreground">Tracked HR contacts</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            {data.totalCount}
          </p>
        </div>
        <Link href="/dashboard/hr/new" className={buttonVariants({})}>
          <Plus className="h-4 w-4" />
          Create HR
        </Link>
      </div>

      <HrFilters
        filters={data.filters}
        companies={data.filterOptions.companies}
        cities={data.filterOptions.cities}
      />

      {data.hrContacts.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200/80 bg-white/90 p-10 text-center dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <UsersRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">No HR contacts found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your filters or create a new HR contact.
          </p>
        </div>
      ) : (
        <HrTable hrContacts={data.hrContacts} filters={data.filters} />
      )}

      <HrPagination
        filters={data.filters}
        totalCount={data.totalCount}
        totalPages={data.totalPages}
      />
    </div>
  );
}
