import { ArrowRight, Database, Lock, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LoginForm } from "@/components/auth/login-form";
import { ToastBridge } from "@/components/ui/toast-bridge";
import { defaultAdminCredentials, ensureDefaultAdminUser } from "@/lib/auth/bootstrap";
import { getToastFromSearchParams } from "@/lib/toast";

const features = [
  {
    title: "Credential-based access",
    description: "Simple username and password authentication with secure session cookies.",
    icon: Lock
  },
  {
    title: "SQLite + Prisma",
    description: "Portable local database setup with typed data access and migrations.",
    icon: Database
  },
  {
    title: "Operational control",
    description: "Protected routes and explicit session invalidation for internal tooling.",
    icon: ShieldCheck
  }
];

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toast = getToastFromSearchParams(resolvedSearchParams);
  await ensureDefaultAdminUser();

  return (
    <main className="min-h-screen bg-hero-grid">
      <ToastBridge toast={toast} />
      <div className="container flex min-h-screen flex-col justify-center py-10">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-medium text-amber-800 backdrop-blur dark:border-amber-500/20 dark:bg-slate-950/70 dark:text-amber-300">
              Built for internal placement operations
              <ArrowRight className="h-4 w-4" />
            </div>

            <div className="max-w-2xl space-y-5">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
                A clean, secure starting point for your placement CRM.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                This foundation module gives us typed data access, reusable UI,
                and working authentication before we layer in student, company,
                and pipeline workflows.
              </p>
              <div className="rounded-2xl border border-amber-200/80 bg-white/80 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
                Default admin login:
                <span className="ml-2 font-semibold">
                  {defaultAdminCredentials.username}
                </span>
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="font-semibold">
                  {defaultAdminCredentials.password}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-lg shadow-amber-100/40 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-slate-950/20"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-3 text-white dark:bg-amber-500 dark:text-slate-950">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <LoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}
