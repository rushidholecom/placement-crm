"use client";

import { useEffect, usePathname, useState } from "react";
import type { ReactNode } from "react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getPageTitle } from "@/lib/navigation";
import type { ReminderOverview } from "@/lib/reminders/types";

type AppShellProps = {
  children: ReactNode;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
  reminders: ReminderOverview;
};

export function AppShell({ children, user, reminders }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem("placement-crm-sidebar-collapsed");

    if (savedValue === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "placement-crm-sidebar-collapsed",
      sidebarCollapsed ? "true" : "false"
    );
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white dark:focus:bg-amber-500 dark:focus:text-slate-950"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />
        <div className="flex min-h-screen flex-1 flex-col bg-app-surface">
          <AppNavbar
            fullName={user.fullName}
            role={user.role}
            username={user.username}
            pageTitle={getPageTitle(pathname)}
            reminders={reminders}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          />
          <div className="px-4 py-4 lg:px-8">
            <MobileNav />
          </div>
          <main id="main-content" className="flex-1 px-4 pb-10 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
