import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowUpZA,
  CopyPlus,
  Eye,
  Mail,
  Pencil,
  Phone
} from "lucide-react";
import type { Company, HrContact } from "@prisma/client";
import { deleteHrAction } from "@/app/(app)/dashboard/hr/actions";
import { DeleteHrButton } from "@/components/hr/delete-hr-button";
import { HrPriorityBadge, HrStatusBadge } from "@/components/hr/hr-badges";
import { buttonVariants } from "@/components/ui/button";
import { HR_SORT_FIELDS } from "@/lib/hr/constants";
import { formatDate } from "@/lib/hr/format";
import type { HrQueryInput } from "@/lib/hr/validators";

type HrRow = HrContact & {
  company: Pick<Company, "id" | "name" | "city">;
  hasDuplicatePhone: boolean;
  _count: {
    followUps: number;
    activities: number;
  };
};

type HrTableProps = {
  hrContacts: HrRow[];
  filters: HrQueryInput;
};

function buildSortHref(
  filters: HrQueryInput,
  sortBy: (typeof HR_SORT_FIELDS)[number]
) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.companyId) params.set("companyId", filters.companyId);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.status) params.set("status", filters.status);
  if (filters.city) params.set("city", filters.city);
  params.set("sortBy", sortBy);
  params.set(
    "sortOrder",
    filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc"
  );
  params.set("page", "1");

  return `/dashboard/hr?${params.toString()}`;
}

function SortLink({
  label,
  field,
  filters
}: {
  label: string;
  field: (typeof HR_SORT_FIELDS)[number];
  filters: HrQueryInput;
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

export function HrTable({ hrContacts, filters }: HrTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-950/70">
            <tr>
              <th className="px-6 py-4 text-left">
                <SortLink label="HR" field="fullName" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">Contact</th>
              <th className="px-6 py-4 text-left">Company</th>
              <th className="px-6 py-4 text-left">
                <SortLink label="City" field="city" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Priority" field="priority" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Status" field="status" filters={filters} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortLink label="Follow-up" field="nextFollowUpDate" filters={filters} />
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {hrContacts.map((contact) => {
              const deleteAction = deleteHrAction.bind(null, contact.id);

              return (
                <tr key={contact.id} className="align-top">
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-950 dark:text-slate-50">
                          {contact.fullName}
                        </p>
                        {contact.hasDuplicatePhone ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                            <CopyPlus className="h-3 w-3" />
                            Duplicate
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contact.designation}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    <div className="space-y-1">
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-amber-700 dark:hover:text-amber-300">
                        <Mail className="h-3.5 w-3.5" />
                        {contact.email}
                      </a>
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-amber-700 dark:hover:text-amber-300">
                        <Phone className="h-3.5 w-3.5" />
                        {contact.phone}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    <Link href={`/dashboard/companies/${contact.company.id}`} className="font-medium text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300">
                      {contact.company.name}
                    </Link>
                    <p className="mt-1 text-muted-foreground">{contact.company.city}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    {contact.city}
                  </td>
                  <td className="px-6 py-5">
                    <HrPriorityBadge priority={contact.priority} />
                  </td>
                  <td className="px-6 py-5">
                    <HrStatusBadge status={contact.status} />
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                    <div>{formatDate(contact.nextFollowUpDate)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {contact._count.followUps} follow-ups, {contact._count.activities} logs
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/hr/${contact.id}`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/hr/${contact.id}/edit`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteHrButton action={deleteAction} hrName={contact.fullName} />
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
