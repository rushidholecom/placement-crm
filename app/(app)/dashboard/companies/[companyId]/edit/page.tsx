import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CompanyForm } from "@/components/companies/company-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyById } from "@/lib/company/queries";
import { updateCompanyAction } from "@/app/(app)/dashboard/companies/actions";

type EditCompanyPageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const { companyId } = await params;
  const company = await getCompanyById(companyId);

  if (!company) {
    notFound();
  }

  const action = updateCompanyAction.bind(null, company.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/companies/${company.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Company
        </Link>
      </div>

      <PageHeader
        eyebrow="Companies"
        title={`Edit ${company.name}`}
        description="Update company details through the shared server-action form."
      />

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm
            action={action}
            submitLabel="Save Changes"
            initialValues={{
              name: company.name,
              website: company.website ?? "",
              industry: company.industry,
              companySize: company.companySize,
              city: company.city,
              address: company.address ?? "",
              notes: company.notes ?? "",
              status: company.status
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
