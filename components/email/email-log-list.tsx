import { EmailSendStatus } from "@prisma/client";
import { Mail, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/hr/format";

type EmailLog = {
  id: string;
  recipientName: string | null;
  recipientEmail: string;
  subject: string;
  status: EmailSendStatus;
  errorMessage: string | null;
  createdAt: Date;
  company: {
    id: string;
    name: string;
  } | null;
  hrContact: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

type EmailLogListProps = {
  logs: EmailLog[];
};

function getStatusTone(status: EmailSendStatus) {
  if (status === EmailSendStatus.SUCCESS) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
}

export function EmailLogList({ logs }: EmailLogListProps) {
  return (
    <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <CardHeader>
        <CardTitle>Recent email log</CardTitle>
        <CardDescription>Delivery status, recipient details, and any failure notes.</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800">
            No emails have been sent yet.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <article
                key={log.id}
                className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold text-slate-950 dark:text-slate-50">{log.subject}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To {log.recipientName || "recipient"} &lt;{log.recipientEmail}&gt;
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.company?.name || "Unlinked company"}
                      {log.hrContact ? ` - ${log.hrContact.fullName}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <Badge variant="outline" className={getStatusTone(log.status)}>
                      {log.status}
                    </Badge>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                </div>
                {log.errorMessage ? (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{log.errorMessage}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
