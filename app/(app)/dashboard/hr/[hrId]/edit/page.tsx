import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { updateHrAction } from "@/app/(app)/dashboard/hr/actions";
import { HrForm } from "@/components/hr/hr-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHrById, getHrFormOptions } from "@/lib/hr/queries";

type EditHrPageProps = {
  params: Promise<{ hrId: string }>;
};

export default async function EditHrPage({ params }: EditHrPageProps) {
  const { hrId } = await params;
  const [hrContact, companies] = await Promise.all([
    getHrById(hrId),
    getHrFormOptions()
  ]);

  if (!hrContact) {
    notFound();
  }

  const action = updateHrAction.bind(null, hrContact.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/hr/${hrContact.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to HR
        </Link>
      </div>

      <PageHeader
        eyebrow="HR"
        title={`Edit ${hrContact.fullName}`}
        description="Update recruiter contact details and keep the activity timeline current."
      />

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>HR details</CardTitle>
        </CardHeader>
        <CardContent>
          <HrForm
            action={action}
            submitLabel="Save Changes"
            companies={companies}
            initialValues={{
              fullName: hrContact.fullName,
              designation: hrContact.designation,
              companyId: hrContact.companyId,
              phone: hrContact.phone,
              email: hrContact.email,
              whatsapp: hrContact.whatsapp ?? "",
              linkedIn: hrContact.linkedIn ?? "",
              city: hrContact.city,
              remark: hrContact.remark ?? "",
              priority: hrContact.priority,
              lastContactDate: hrContact.lastContactDate,
              nextFollowUpDate: hrContact.nextFollowUpDate,
              status: hrContact.status
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
