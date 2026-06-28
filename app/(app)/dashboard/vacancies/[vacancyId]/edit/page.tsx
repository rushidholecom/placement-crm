import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updateVacancyAction } from "@/app/(app)/dashboard/vacancies/actions";
import { VacancyForm } from "@/components/vacancy/vacancy-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVacancyById, getVacancyFormOptions } from "@/lib/vacancy/queries";

type EditVacancyPageProps = {
  params: Promise<{ vacancyId: string }>;
};

export default async function EditVacancyPage({ params }: EditVacancyPageProps) {
  const { vacancyId } = await params;
  const [vacancy, { companies, recruiters }] = await Promise.all([
    getVacancyById(vacancyId),
    getVacancyFormOptions()
  ]);

  if (!vacancy) {
    notFound();
  }

  const action = updateVacancyAction.bind(null, vacancy.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/vacancies/${vacancy.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Vacancy
        </Link>
      </div>

      <PageHeader
        eyebrow="Vacancies"
        title={`Edit ${vacancy.title}`}
        description="Update vacancy details through the shared server-action form."
      />

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Vacancy details</CardTitle>
        </CardHeader>
        <CardContent>
          <VacancyForm
            action={action}
            submitLabel="Save Changes"
            companies={companies}
            recruiters={recruiters}
            initialValues={{
              title: vacancy.title,
              companyId: vacancy.companyId,
              experience: vacancy.experience,
              location: vacancy.location,
              technology: vacancy.technology ?? "",
              skills: vacancy.skills ?? "",
              compensationLpa: vacancy.compensationLpa,
              openings: vacancy.openings,
              priority: vacancy.priority,
              status: vacancy.status,
              assignedRecruiterId: vacancy.assignedRecruiterId ?? "",
              remark: vacancy.remark ?? ""
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
