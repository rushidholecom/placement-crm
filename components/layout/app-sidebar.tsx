"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { dashboardNavigation, foundationChecklist } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-border/60 bg-white/80 px-5 py-6 backdrop-blur dark:bg-slate-950/70 lg:sticky lg:top-0 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-950 dark:text-slate-50">
              Placement CRM
            </p>
            <p className="text-sm text-muted-foreground">Foundation workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {dashboardNavigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-2xl px-4 py-3 transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm dark:bg-amber-500 dark:text-slate-950"
                    : "text-slate-700 hover:bg-amber-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                )}
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      isActive
                        ? "text-white/80 dark:text-slate-900/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl bg-app-surface p-5">
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
            Foundation checklist
          </p>
          <div className="mt-4 space-y-3">
            {foundationChecklist.map((item) => (
              <div key={item} className="rounded-2xl bg-white/80 p-3 text-sm text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
