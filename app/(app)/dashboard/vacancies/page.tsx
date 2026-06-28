import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { VacancyFilters } from "@/components/vacancy/vacancy-filters";
import { VacancyPagination } from "@/components/vacancy/vacancy-pagination";
import { VacancyTable } from "@/components/vacancy/vacancy-table";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { getVacanciesPage } from "@/lib/vacancy/queries";
import { getToastFromSearchParams } from "@/lib/toast";

export const dynamic = "force-dynamic";

type VacanciesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VacanciesPage({
  searchParams
}: VacanciesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);
  const data = await getVacanciesPage(resolvedSearchParams);

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <PageHeader
        eyebrow="Vacancies"
        title="Vacancy management"
        description="Manage live roles with search, filters, sorting, and a fast server-rendered table."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-muted-foreground">Tracked vacancies</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            {data.totalCount}
          </p>
        </div>
        <Link href="/dashboard/vacancies/new" className={buttonVariants({})}>
          <Plus className="h-4 w-4" />
          Create Vacancy
        </Link>
      </div>

      <VacancyFilters
        filters={data.filters}
        companies={data.filterOptions.companies}
        locations={data.filterOptions.locations}
      />

      {data.vacancies.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200/80 bg-white/90 p-10 text-center dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">No vacancies found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your filters or create a new vacancy record.
          </p>
        </div>
      ) : (
        <VacancyTable vacancies={data.vacancies} filters={data.filters} />
      )}

      <VacancyPagination
        filters={data.filters}
        totalCount={data.totalCount}
        totalPages={data.totalPages}
      />
    </div>
  );
}
