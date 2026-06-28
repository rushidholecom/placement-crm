import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { CompanyFilters } from "@/components/companies/company-filters";
import { CompanyPagination } from "@/components/companies/company-pagination";
import { CompanyTable } from "@/components/companies/company-table";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { getCompaniesPage } from "@/lib/company/queries";
import { getToastFromSearchParams } from "@/lib/toast";

export const dynamic = "force-dynamic";

type CompaniesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompaniesPage({
  searchParams
}: CompaniesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);
  const data = await getCompaniesPage(resolvedSearchParams);

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <PageHeader
        eyebrow="Companies"
        title="Company management"
        description="Manage recruiting partners through a fast server-rendered table with search, filters, sorting, and pagination."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-muted-foreground">Tracked companies</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            {data.totalCount}
          </p>
        </div>
        <Link href="/dashboard/companies/new" className={buttonVariants({})}>
          <Plus className="h-4 w-4" />
          Create Company
        </Link>
      </div>

      <CompanyFilters
        filters={data.filters}
        industries={data.filterOptions.industries}
        cities={data.filterOptions.cities}
      />

      {data.companies.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200/80 bg-white/90 p-10 text-center dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">No companies found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your filters or create a new company record.
          </p>
        </div>
      ) : (
        <CompanyTable companies={data.companies} filters={data.filters} />
      )}

      <CompanyPagination
        filters={data.filters}
        totalCount={data.totalCount}
        totalPages={data.totalPages}
      />
    </div>
  );
}
