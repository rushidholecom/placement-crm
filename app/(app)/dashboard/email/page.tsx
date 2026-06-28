import { Mail, Send, Sparkles, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { Card, CardContent } from "@/components/ui/card";
import { getToastFromSearchParams } from "@/lib/toast";
import { getEmailPage } from "@/lib/email/queries";
import { EmailSettingsForm } from "@/components/email/email-settings-form";
import { EmailTemplateEditor } from "@/components/email/email-template-editor";
import { EmailSendForm } from "@/components/email/email-send-form";
import { EmailLogList } from "@/components/email/email-log-list";

export const dynamic = "force-dynamic";

type EmailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function StatCard({
  label,
  value,
  description,
  icon: Icon
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Mail;
}) {
  return (
    <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
            {value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function EmailPage({ searchParams }: EmailPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);
  const data = await getEmailPage();

  if (!data.settings) {
    return null;
  }

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <PageHeader
        eyebrow="Email"
        title="Email management"
        description="Configure SMTP, edit reusable templates, preview messages, and send tracked email with automatic timeline logging."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Templates"
          value={data.stats.totalTemplates}
          description="Reusable templates ready to send"
          icon={Sparkles}
        />
        <StatCard
          label="Successful sends"
          value={data.stats.successfulSends}
          description="Messages delivered through SMTP"
          icon={Send}
        />
        <StatCard
          label="Failed sends"
          value={data.stats.failedSends}
          description="Attempts captured with error logs"
          icon={TriangleAlert}
        />
        <StatCard
          label="SMTP status"
          value={data.stats.hasConfiguredSmtp ? "Configured" : "Not ready"}
          description="Credentials and sender identity"
          icon={Mail}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <EmailSettingsForm settings={data.settings} />
          <EmailTemplateEditor templates={data.templates} />
        </div>

        <div className="space-y-6">
          <EmailSendForm
            templates={data.templates}
            companies={data.companies}
            hrContacts={data.hrContacts}
            senderName={data.settings.fromName}
            signature={data.settings.signature}
          />
          <EmailLogList logs={data.logs} />
        </div>
      </div>
    </div>
  );
}
