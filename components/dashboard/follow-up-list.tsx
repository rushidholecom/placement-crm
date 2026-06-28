import { FollowUpType } from "@prisma/client";
import { CalendarClock, Mail, Phone, Presentation } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";

type FollowUpListProps = {
  title: string;
  description: string;
  items: Array<{
    id: string;
    subject: string;
    notes: string;
    type: FollowUpType;
    dueAt: Date;
    company: { name: string };
    hrContact: { fullName: string; designation: string } | null;
  }>;
};

function getIcon(type: FollowUpType) {
  switch (type) {
    case FollowUpType.CALL:
      return Phone;
    case FollowUpType.EMAIL:
      return Mail;
    default:
      return Presentation;
  }
}

function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function FollowUpList({
  title,
  description,
  items
}: FollowUpListProps) {
  return (
    <DashboardSection title={title} description={description}>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200/80 p-8 text-sm text-muted-foreground dark:border-slate-800">
          No upcoming follow-ups are scheduled right now.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = getIcon(item.type);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800"
              >
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {item.subject}
                      </p>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        {item.company.name}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.notes}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDueDate(item.dueAt)}
                      </span>
                      {item.hrContact ? (
                        <span>
                          {item.hrContact.fullName} • {item.hrContact.designation}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
