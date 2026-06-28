import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createVacancyAction } from "@/app/(app)/dashboard/vacancies/actions";
import { VacancyForm } from "@/components/vacancy/vacancy-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVacancyFormOptions } from "@/lib/vacancy/queries";

export default async function NewVacancyPage() {
  const { companies, recruiters } = await getVacancyFormOptions();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/vacancies"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Vacancies
        </Link>
      </div>

      <PageHeader
        eyebrow="Vacancies"
        title="Create vacancy"
        description="Add a new role with reusable server-action powered form handling."
      />

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Vacancy details</CardTitle>
        </CardHeader>
        <CardContent>
          <VacancyForm
            action={createVacancyAction}
            submitLabel="Create Vacancy"
            companies={companies}
            recruiters={recruiters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
