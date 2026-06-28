import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { deleteCompanyAction } from "@/app/(app)/dashboard/companies/actions";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { CompanyStatusBadge } from "@/components/companies/company-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyById } from "@/lib/company/queries";
import { formatCompanySize } from "@/lib/company/format";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { getToastFromSearchParams } from "@/lib/toast";

type CompanyDetailPageProps = {
  params: Promise<{ companyId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompanyDetailPage({
  params,
  searchParams
}: CompanyDetailPageProps) {
  const { companyId } = await params;
  const company = await getCompanyById(companyId);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);

  if (!company) {
    notFound();
  }

  const deleteAction = deleteCompanyAction.bind(null, company.id);

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/companies"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Companies
        </Link>
        <Link
          href={`/dashboard/companies/${company.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <DeleteCompanyButton
          action={deleteAction}
          companyName={company.name}
          label="Delete"
        />
      </div>

      <PageHeader
        eyebrow="Company"
        title={company.name}
        description="Full company record with lifecycle status, business details, and linked pipeline volume."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="mt-1 font-semibold">{company.industry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company Size</p>
              <p className="mt-1 font-semibold">
                {formatCompanySize(company.companySize)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="mt-1 font-semibold">{company.city}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-2">
                <CompanyStatusBadge status={company.status} />
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Website</p>
              <p className="mt-1 font-semibold">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline dark:text-amber-300">
                    {company.website}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="mt-1 leading-7">{company.address || "Not provided"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-1 leading-7">{company.notes || "No notes added yet."}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Pipeline summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-muted-foreground">HR Contacts</p>
              <p className="mt-1 text-2xl font-semibold">{company._count.hrContacts}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-muted-foreground">Vacancies</p>
              <p className="mt-1 text-2xl font-semibold">{company._count.vacancies}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-muted-foreground">Follow-ups</p>
              <p className="mt-1 text-2xl font-semibold">{company._count.followUps}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-muted-foreground">Activities</p>
              <p className="mt-1 text-2xl font-semibold">{company._count.activities}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
