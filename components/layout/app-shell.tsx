"use client";

import { usePathname } from "next/navigation";
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col bg-app-surface">
          <AppNavbar
            fullName={user.fullName}
            role={user.role}
            username={user.username}
            pageTitle={getPageTitle(pathname)}
            reminders={reminders}
          />
          <div className="px-4 py-4 lg:px-8">
            <MobileNav />
          </div>
          <main className="flex-1 px-4 pb-10 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
