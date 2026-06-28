import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Linkedin,
  Mail,
  MessageCircle,
  Pencil,
  Phone
} from "lucide-react";
import { deleteVacancyAction } from "@/app/(app)/dashboard/vacancies/actions";
import { DeleteVacancyButton } from "@/components/vacancy/delete-vacancy-button";
import {
  VacancyPriorityBadge,
  VacancyStatusBadge
} from "@/components/vacancy/vacancy-badges";
import { VacancyTimeline } from "@/components/vacancy/vacancy-timeline";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { formatDate, formatSalary } from "@/lib/vacancy/format";
import { getVacancyById, getVacancyTimeline } from "@/lib/vacancy/queries";
import { getToastFromSearchParams } from "@/lib/toast";

type VacancyDetailPageProps = {
  params: Promise<{ vacancyId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VacancyDetailPage({
  params,
  searchParams
}: VacancyDetailPageProps) {
  const { vacancyId } = await params;
  const [vacancy, timeline] = await Promise.all([
    getVacancyById(vacancyId),
    getVacancyTimeline(vacancyId)
  ]);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);

  if (!vacancy) {
    notFound();
  }

  const deleteAction = deleteVacancyAction.bind(null, vacancy.id);

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/vacancies"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Vacancies
        </Link>
        <Link
          href={`/dashboard/vacancies/${vacancy.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <DeleteVacancyButton
          action={deleteAction}
          vacancyTitle={vacancy.title}
          label="Delete"
        />
      </div>

      <PageHeader
        eyebrow="Vacancy"
        title={vacancy.title}
        description={`${vacancy.company.name} - ${vacancy.location} - ${vacancy.experience}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Role profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <Link
                href={`/dashboard/companies/${vacancy.company.id}`}
                className="mt-1 block font-semibold text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300"
              >
                {vacancy.company.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {vacancy.company.industry} - {vacancy.company.city}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="mt-1 font-semibold">{vacancy.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="mt-1 font-semibold">{vacancy.experience}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salary</p>
              <p className="mt-1 font-semibold">{formatSalary(vacancy.compensationLpa)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Openings</p>
              <p className="mt-1 font-semibold">
                {vacancy.openings} opening{vacancy.openings === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-2">
                <VacancyStatusBadge status={vacancy.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <div className="mt-2">
                <VacancyPriorityBadge priority={vacancy.priority} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="mt-1 font-semibold">{formatDate(vacancy.updatedAt)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Technology</p>
              <p className="mt-1 leading-7">{vacancy.technology || "Not provided"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Skills</p>
              <p className="mt-1 leading-7">{vacancy.skills || "Not provided"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Remark</p>
              <p className="mt-1 leading-7">{vacancy.remark || "No remark added yet."}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="mt-1 leading-7">{formatDate(vacancy.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
            <CardHeader>
              <CardTitle>Assigned recruiter</CardTitle>
            </CardHeader>
            <CardContent>
              {vacancy.assignedRecruiter ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">
                      {vacancy.assignedRecruiter.fullName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {vacancy.assignedRecruiter.designation}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {vacancy.assignedRecruiter.city}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={`mailto:${vacancy.assignedRecruiter.email}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {vacancy.assignedRecruiter.email}
                    </a>
                    <a
                      href={`tel:${vacancy.assignedRecruiter.phone}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {vacancy.assignedRecruiter.phone}
                    </a>
                    {vacancy.assignedRecruiter.whatsapp ? (
                      <a
                        href={`https://wa.me/${vacancy.assignedRecruiter.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        {vacancy.assignedRecruiter.whatsapp}
                      </a>
                    ) : null}
                    {vacancy.assignedRecruiter.linkedIn ? (
                      <a
                        href={vacancy.assignedRecruiter.linkedIn}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        LinkedIn profile
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800">
                  No recruiter assigned yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
            <CardHeader>
              <CardTitle>Company summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm text-muted-foreground">HR Contacts</p>
                <p className="mt-1 text-2xl font-semibold">{vacancy.company._count.hrContacts}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm text-muted-foreground">Vacancies</p>
                <p className="mt-1 text-2xl font-semibold">{vacancy.company._count.vacancies}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm text-muted-foreground">Follow-ups</p>
                <p className="mt-1 text-2xl font-semibold">{vacancy.company._count.followUps}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="mt-1 text-2xl font-semibold">{vacancy.company._count.activities}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <VacancyTimeline items={timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
