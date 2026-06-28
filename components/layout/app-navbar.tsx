import { BellDot, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AppNavbarProps = {
  fullName: string;
  role: string;
  username: string;
  pageTitle: string;
};

export function AppNavbar({
  fullName,
  role,
  username,
  pageTitle
}: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {pageTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden gap-1.5 rounded-full px-3 py-1 sm:inline-flex">
            <BellDot className="h-3.5 w-3.5" />
            Internal tool
          </Badge>
          <ThemeToggle />
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
              {fullName}
            </p>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>
          <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {role}
          </Badge>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
