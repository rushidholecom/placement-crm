import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createHrAction } from "@/app/(app)/dashboard/hr/actions";
import { HrForm } from "@/components/hr/hr-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHrFormOptions } from "@/lib/hr/queries";

export default async function NewHrPage() {
  const companies = await getHrFormOptions();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/hr"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to HR
        </Link>
      </div>

      <PageHeader
        eyebrow="HR"
        title="Create HR contact"
        description="Add a recruiter contact with validation, duplicate checks, follow-up creation, and activity logging."
      />

      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>HR details</CardTitle>
        </CardHeader>
        <CardContent>
          <HrForm
            action={createHrAction}
            submitLabel="Create HR"
            companies={companies}
          />
        </CardContent>
      </Card>
    </div>
  );
}
