import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Mail,
  PhoneCall,
  UserRoundSearch,
  Users
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { FollowUpList } from "@/components/dashboard/follow-up-list";
import { LatestHrList } from "@/components/dashboard/latest-hr-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getCurrentSession } from "@/lib/auth/session";
import { getToastFromSearchParams } from "@/lib/toast";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  const session = await getCurrentSession();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <PageHeader
        eyebrow="Dashboard"
        title={`Good to see you, ${session?.user.fullName.split(" ")[0] ?? "Team"}`}
        description="A fast, live view of follow-ups, HR outreach, vacancies, and recruiter activity across your placement pipeline."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Follow-ups"
          value={dashboard.metrics.todaysFollowUps.toString()}
          description="Open follow-ups scheduled for today."
          icon={CalendarClock}
        />
        <StatCard
          label="Overdue Follow-ups"
          value={dashboard.metrics.overdueFollowUps.toString()}
          description="Pending follow-ups that slipped past schedule."
          icon={UserRoundSearch}
        />
        <StatCard
          label="Today's Calls"
          value={dashboard.metrics.todaysCalls.toString()}
          description="Call-based touchpoints due before day-end."
          icon={PhoneCall}
        />
        <StatCard
          label="Today's Emails"
          value={dashboard.metrics.todaysEmails.toString()}
          description="Email follow-ups queued for today."
          icon={Mail}
        />
      </section>

      <section className="grid gap-5 md:grid-cols-3 xl:grid-cols-3">
        <StatCard
          label="Total Companies"
          value={dashboard.metrics.totalCompanies.toString()}
          description="Active companies tracked in the CRM."
          icon={Building2}
        />
        <StatCard
          label="Total HR"
          value={dashboard.metrics.totalHr.toString()}
          description="HR and recruiter contacts available for outreach."
          icon={Users}
        />
        <StatCard
          label="Total Vacancies"
          value={dashboard.metrics.totalVacancies.toString()}
          description="Open roles currently mapped to companies."
          icon={BriefcaseBusiness}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ActivityFeed items={dashboard.recentActivities} />
        <FollowUpList
          title="Upcoming Follow-ups"
          description="Next pending follow-ups ordered by the nearest due time."
          items={dashboard.upcomingFollowUps}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <LatestHrList items={dashboard.latestAddedHr} />
        <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900/90 p-8 text-white shadow-soft dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
            Live database snapshot
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Every dashboard card is backed by Prisma queries.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            This page is rendered dynamically from SQLite data, so the counts and
            lists refresh from the database instead of static placeholders. Use
            `revalidateDashboard()` from your CRUD server actions to push instant
            refreshes after future create, update, or delete workflows.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Open pipeline focus</p>
              <p className="mt-2 text-2xl font-semibold">
                {dashboard.metrics.todaysFollowUps + dashboard.metrics.overdueFollowUps}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Recruiter footprint</p>
              <p className="mt-2 text-2xl font-semibold">
                {dashboard.metrics.totalCompanies}:{dashboard.metrics.totalHr}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
