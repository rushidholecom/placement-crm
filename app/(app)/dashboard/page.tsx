import {
  BriefcaseBusiness,
  CalendarRange,
  ChartColumnBig,
  CircleCheckBig
} from "lucide-react";
import { QuickStartCard } from "@/components/dashboard/quick-start-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/session";
import { getToastFromSearchParams } from "@/lib/toast";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  const session = await getCurrentSession();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);

  return (
    <div className="space-y-8">
      <ToastBridge toast={toast} />
      <PageHeader
        eyebrow="Dashboard"
        title="Operational overview"
        description="Your authenticated workspace is ready with Prisma, SQLite, protected routing, reusable UI primitives, and session-backed access control."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl">Foundation module is live</CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Authentication, route protection, Prisma, SQLite, and the application
              shell are all wired together. This gives us a stable platform for the
              next product feature without accumulating setup debt.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-amber-50 p-5 dark:bg-amber-500/10">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                Signed in as
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                {session?.user.fullName}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                @{session?.user.username}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900 p-5 text-white dark:bg-slate-800">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
                Access level
              </p>
              <p className="mt-2 text-2xl font-semibold capitalize">
                {session?.user.role}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Protected by server-side session validation.
              </p>
            </div>
          </CardContent>
        </Card>

        <QuickStartCard
          title="Next recommended build order"
          description="Once you're happy with this module, the natural next feature is core CRM data management."
          steps={[
            "Student profiles and academic status tracking",
            "Company drives, roles, and hiring windows",
            "Applications, interviews, results, and offers"
          ]}
        />
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Authentication"
          value="Ready"
          description="Username/password sign-in with hashed passwords."
          icon={CircleCheckBig}
        />
        <StatCard
          label="Database"
          value="Prisma"
          description="SQLite-backed schema with typed client access."
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Sessions"
          value="7 days"
          description="Persistent sessions stored server-side and revocable."
          icon={CalendarRange}
        />
        <StatCard
          label="UI System"
          value="Reusable"
          description="Tailwind and shadcn-style building blocks in place."
          icon={ChartColumnBig}
        />
      </section>
    </div>
  );
}
