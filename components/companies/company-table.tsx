import Link from "next/link";
import { ArrowDownAZ, ArrowUpZA, Eye, Pencil } from "lucide-react";
import type { Company, CompanySize, CompanyStatus } from "@prisma/client";
import { deleteCompanyAction } from "@/app/(app)/dashboard/companies/actions";
import { COMPANY_SORT_FIELDS } from "@/lib/company/constants";
import { formatCompanySize } from "@/lib/company/format";
import type { CompaniesQueryInput } from "@/lib/company/validators";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { CompanyStatusBadge } from "@/components/companies/company-status-badge";
import { buttonVariants } from "@/components/ui/button";

type CompanyRow = Company & {
  _count: {
    hrContacts: number;
    vacancies: number;
    followUps: number;
  };
};

type CompanyTableProps = {
  companies: CompanyRow[];
  filters: CompaniesQueryInput;
};

function buildSortHref(
  filters: CompaniesQueryInput,
  sortBy: (typeof COMPANY_SORT_FIELDS)[number]
) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.industry) params.set("industry", filters.industry);
  if (filters.city) params.set("city", filters.city);
  params.set("sortBy", sortBy);
  params.set(
    "sortOrder",
    filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc"
  );
  params.set("page", "1");

  return `/dashboard/companies?${params.toString()}`;
}

function SortLink({
  label,
  field,
  filters
}: {
  label: string;
  field: (typeof COMPANY_SORT_FIELDS)[number];
  filters: CompaniesQueryInput;
}) {
  const isActive = filters.sortBy === field;
  const Icon =
    isActive && filters.sortOrder === "asc" ? ArrowDownAZ : ArrowUpZA;

  return (
    <Link
      href={buildSortHref(filters, field)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
    >
      {label}
      {isActive ? <Icon className="h-3.5 w-3.5" /> : null}
    </Link>
  );
}

export function CompanyTable({ companies, filters }: CompanyTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-950/70">
            <tr>
              <th className="px-6 py-4 text-left">
                <SortLink label="Company" field="name" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Industry" field="industry" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">Size</th>
              <th className="px-6 py-4 text-left">
                <SortLink label="City" field="city" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Status" field="status" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">Pipeline</th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Created" field="createdAt" filters={filters} />
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {companies.map((company) => {
              const deleteAction = deleteCompanyAction.bind(null, company.id);

              return (
                <tr key={company.id} className="align-top">
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {company.name}
                      </p>
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-amber-700 hover:underline dark:text-amber-300"
                        >
                          {company.website}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">No website</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {company.industry}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {formatCompanySize(company.companySize as CompanySize)}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {company.city}
                  </td>
                  <td className="px-6 py-5">
                    <CompanyStatusBadge status={company.status as CompanyStatus} />
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    <div>{company._count.hrContacts} HR</div>
                    <div>{company._count.vacancies} Vacancies</div>
                    <div>{company._count.followUps} Follow-ups</div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium"
                    }).format(company.createdAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/companies/${company.id}`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/companies/${company.id}/edit`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteCompanyButton
                        action={deleteAction}
                        companyName={company.name}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
