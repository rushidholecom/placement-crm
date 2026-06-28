import { PaintbrushVertical, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Foundation controls"
        description="The project shell now includes theme handling and security defaults. This page gives those building blocks a dedicated protected destination."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Security defaults</CardTitle>
            <CardDescription>
              Baseline policies already active in the foundation layer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              HttpOnly session cookies with explicit expiry
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              Password verification with bcrypt
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              Server-side route protection in layout and middleware
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <EmptyState
            title="Theme is available globally"
            description="Use the navbar toggle to switch between light and dark themes across the entire application shell."
            icon={PaintbrushVertical}
          />
          <EmptyState
            title="Settings module can grow here"
            description="This protected page is intentionally lightweight and ready for future preferences, roles, and policy controls."
            icon={ShieldAlert}
          />
        </div>
      </div>
    </div>
  );
}
