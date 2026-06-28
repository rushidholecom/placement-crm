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
import { deleteHrAction } from "@/app/(app)/dashboard/hr/actions";
import { DeleteHrButton } from "@/components/hr/delete-hr-button";
import { HrPriorityBadge, HrStatusBadge } from "@/components/hr/hr-badges";
import { HrTimeline } from "@/components/hr/hr-timeline";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { formatDate } from "@/lib/hr/format";
import { getHrById } from "@/lib/hr/queries";
import { getToastFromSearchParams } from "@/lib/toast";

type HrDetailPageProps = {
  params: Promise<{ hrId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HrDetailPage({
  params,
  searchParams
}: HrDetailPageProps) {
  const { hrId } = await params;
  const hrContact = await getHrById(hrId);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);

  if (!hrContact) {
    notFound();
  }

  const deleteAction = deleteHrAction.bind(null, hrContact.id);

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/hr"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to HR
        </Link>
        <Link
          href={`/dashboard/hr/${hrContact.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <DeleteHrButton
          action={deleteAction}
          hrName={hrContact.fullName}
          label="Delete"
        />
      </div>

      <PageHeader
        eyebrow="HR"
        title={hrContact.fullName}
        description={`${hrContact.designation} at ${hrContact.company.name}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <Link
                href={`/dashboard/companies/${hrContact.company.id}`}
                className="mt-1 block font-semibold text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300"
              >
                {hrContact.company.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {hrContact.company.industry} - {hrContact.company.city}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="mt-1 font-semibold">{hrContact.city}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <div className="mt-2">
                <HrPriorityBadge priority={hrContact.priority} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-2">
                <HrStatusBadge status={hrContact.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Contact</p>
              <p className="mt-1 font-semibold">{formatDate(hrContact.lastContactDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Follow-up</p>
              <p className="mt-1 font-semibold">{formatDate(hrContact.nextFollowUpDate)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Remark</p>
              <p className="mt-1 leading-7">{hrContact.remark || "No remark added yet."}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href={`mailto:${hrContact.email}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {hrContact.email}
            </a>
            <a href={`tel:${hrContact.phone}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {hrContact.phone}
            </a>
            {hrContact.whatsapp ? (
              <a href={`https://wa.me/${hrContact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                {hrContact.whatsapp}
              </a>
            ) : null}
            {hrContact.linkedIn ? (
              <a href={hrContact.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                LinkedIn profile
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <HrTimeline
            activities={hrContact.activities}
            followUps={hrContact.followUps}
          />
        </CardContent>
      </Card>
    </div>
  );
}
