import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Eye,
  Pencil
} from "lucide-react";
import type { Company, HrContact, Vacancy } from "@prisma/client";
import { deleteVacancyAction } from "@/app/(app)/dashboard/vacancies/actions";
import { DeleteVacancyButton } from "@/components/vacancy/delete-vacancy-button";
import { VacancyPriorityBadge, VacancyStatusBadge } from "@/components/vacancy/vacancy-badges";
import { buttonVariants } from "@/components/ui/button";
import { VACANCY_SORT_FIELDS } from "@/lib/vacancy/constants";
import { formatDateTime, formatSalary } from "@/lib/vacancy/format";
import type { VacanciesQueryInput } from "@/lib/vacancy/validators";

type VacancyRow = Vacancy & {
  company: Pick<Company, "id" | "name">;
  assignedRecruiter: Pick<HrContact, "id" | "fullName" | "phone" | "email" | "city"> | null;
};

type VacancyTableProps = {
  vacancies: VacancyRow[];
  filters: VacanciesQueryInput;
};

function buildSortHref(
  filters: VacanciesQueryInput,
  sortBy: (typeof VACANCY_SORT_FIELDS)[number]
) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.companyId) params.set("companyId", filters.companyId);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.status) params.set("status", filters.status);
  if (filters.location) params.set("location", filters.location);
  params.set("sortBy", sortBy);
  params.set(
    "sortOrder",
    filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc"
  );
  params.set("page", "1");

  return `/dashboard/vacancies?${params.toString()}`;
}

function SortLink({
  label,
  field,
  filters
}: {
  label: string;
  field: (typeof VACANCY_SORT_FIELDS)[number];
  filters: VacanciesQueryInput;
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

export function VacancyTable({ vacancies, filters }: VacancyTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-950/70">
            <tr>
              <th className="px-6 py-4 text-left">
                <SortLink label="Job Title" field="title" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Company" field="company" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">Experience</th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Location" field="location" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">Salary</th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Priority" field="priority" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Status" field="status" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">Recruiter</th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Updated" field="updatedAt" filters={filters} />
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {vacancies.map((vacancy) => {
              const deleteAction = deleteVacancyAction.bind(null, vacancy.id);

              return (
                <tr key={vacancy.id} className="align-top">
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/vacancies/${vacancy.id}`}
                        className="font-semibold text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300"
                      >
                        {vacancy.title}
                      </Link>
                      {vacancy.technology ? (
                        <p className="text-sm text-muted-foreground">
                          {vacancy.technology}
                        </p>
                      ) : null}
                      {vacancy.skills ? (
                        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                          {vacancy.skills}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    <Link
                      href={`/dashboard/companies/${vacancy.company.id}`}
                      className="font-medium text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300"
                    >
                      {vacancy.company.name}
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    <div>{vacancy.experience}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {vacancy.openings} opening{vacancy.openings === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {vacancy.location}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {formatSalary(vacancy.compensationLpa)}
                  </td>
                  <td className="px-6 py-5">
                    <VacancyPriorityBadge priority={vacancy.priority} />
                  </td>
                  <td className="px-6 py-5">
                    <VacancyStatusBadge status={vacancy.status} />
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {vacancy.assignedRecruiter ? (
                      <div className="space-y-1">
                        <Link
                          href={`/dashboard/hr/${vacancy.assignedRecruiter.id}`}
                          className="font-medium text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300"
                        >
                          {vacancy.assignedRecruiter.fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {vacancy.assignedRecruiter.city}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {vacancy.assignedRecruiter.phone}
                          {vacancy.assignedRecruiter.email ? ` - ${vacancy.assignedRecruiter.email}` : ""}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {formatDateTime(vacancy.updatedAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/vacancies/${vacancy.id}`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/vacancies/${vacancy.id}/edit`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteVacancyButton
                        action={deleteAction}
                        vacancyTitle={vacancy.title}
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
