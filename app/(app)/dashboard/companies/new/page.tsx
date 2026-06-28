import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createCompanyAction } from "@/app/(app)/dashboard/companies/actions";
import { CompanyForm } from "@/components/companies/company-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCompanyPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/companies"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Companies
        </Link>
      </div>

      <PageHeader
        eyebrow="Companies"
        title="Create company"
        description="Add a new recruiting partner with reusable server-action powered form handling."
      />

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm action={createCompanyAction} submitLabel="Create Company" />
        </CardContent>
      </Card>
    </div>
  );
}
