"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-3 gap-2 lg:hidden">
      {dashboardNavigation.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-2xl border px-3 py-3 text-center text-sm font-medium transition",
              isActive
                ? "border-slate-950 bg-slate-950 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950"
                : "border-border bg-card text-card-foreground"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
