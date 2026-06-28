import { ActivityType } from "@prisma/client";
import { BellRing, BriefcaseBusiness, Mail, Phone, UserPlus2 } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";

type ActivityFeedProps = {
  items: Array<{
    id: string;
    title: string;
    description: string;
    type: ActivityType;
    createdAt: Date;
    company: { name: string } | null;
    hrContact: { fullName: string } | null;
  }>;
};

function getIcon(type: ActivityType) {
  switch (type) {
    case ActivityType.CALL:
      return Phone;
    case ActivityType.EMAIL:
      return Mail;
    case ActivityType.HR:
      return UserPlus2;
    case ActivityType.VACANCY:
      return BriefcaseBusiness;
    default:
      return BellRing;
  }
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <DashboardSection
      title="Recent Activities"
      description="Latest movement across follow-ups, HR contacts, and vacancies."
    >
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200/80 p-8 text-sm text-muted-foreground dark:border-slate-800">
          No activities yet. Recent CRM actions will appear here automatically.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = getIcon(item.type);

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800"
              >
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950 dark:text-slate-50">
                      {item.title}
                    </p>
                    {item.company ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {item.company.name}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {item.hrContact ? `${item.hrContact.fullName} • ` : ""}
                    {formatTime(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
