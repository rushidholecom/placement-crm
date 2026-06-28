import { Building2, Mail, Phone, UserRoundPlus } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";

type LatestHrListProps = {
  items: Array<{
    id: string;
    fullName: string;
    designation: string;
    email: string;
    phone: string;
    createdAt: Date;
    company: { name: string };
  }>;
};

function formatAddedDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(date);
}

export function LatestHrList({ items }: LatestHrListProps) {
  return (
    <DashboardSection
      title="Latest Added HR"
      description="Newest HR contacts added to your recruiting pipeline."
    >
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200/80 p-8 text-sm text-muted-foreground dark:border-slate-800">
          No HR contacts have been added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <UserRoundPlus className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">
                    {item.fullName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {item.designation}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {item.company.name}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {item.email}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {item.phone}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Added {formatAddedDate(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
