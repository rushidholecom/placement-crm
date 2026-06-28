import { UserRoundCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/session";

export default async function ProfilePage() {
  const session = await getCurrentSession();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title="Current authenticated user"
        description="This protected page confirms the active session details and demonstrates route protection across the dashboard shell."
      />

      <Card className="max-w-3xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <UserRoundCheck className="h-6 w-6" />
          </div>
          <CardTitle>Session identity</CardTitle>
          <CardDescription>
            These values come from the server-side session lookup.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-muted-foreground">Full name</p>
            <p className="mt-2 text-lg font-semibold">{session?.user.fullName}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="mt-2 text-lg font-semibold">@{session?.user.username}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="mt-2 text-lg font-semibold capitalize">{session?.user.role}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-muted-foreground">Route status</p>
            <p className="mt-2 text-lg font-semibold">Protected</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
