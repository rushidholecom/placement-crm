"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronsRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { dashboardNavigation, foundationChecklist } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-border/60 bg-white/85 px-4 py-5 backdrop-blur transition-[width,transform,padding] duration-300 ease-out dark:bg-slate-950/80 lg:sticky lg:top-0 lg:block",
        collapsed ? "w-[92px] px-3" : "w-72 px-5"
      )}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "relative flex items-center gap-3 rounded-[1.4rem] border border-transparent p-2 transition-all duration-300",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10 transition-transform duration-300 dark:bg-amber-500 dark:text-slate-950">
              <Building2 className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div>
                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">
                  Placement CRM
                </p>
                <p className="text-sm text-muted-foreground">Foundation workspace</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50",
              collapsed && "absolute right-2 top-5"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className={cn("mt-8 space-y-2", collapsed && "mt-6")}>
          {dashboardNavigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.title : undefined}
                className={cn(
                  "group relative flex items-start gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
                  collapsed ? "justify-center px-3" : "px-4",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm dark:bg-amber-500 dark:text-slate-950"
                    : "text-slate-700 hover:bg-amber-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                )}
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0" />
                {!collapsed ? (
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
                ) : (
                  <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-lg group-hover:block">
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed ? (
          <div className="mt-auto rounded-3xl bg-app-surface p-5">
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
              Foundation checklist
            </p>
            <div className="mt-4 space-y-3">
              {foundationChecklist.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/80 p-3 text-sm text-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-auto flex justify-center pb-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-app-surface text-slate-700 shadow-sm dark:text-slate-200">
              <ChevronsRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
