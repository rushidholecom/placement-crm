"use client";

import { useEffect, useRef, useState } from "react";
import { BellRing, ChevronDown } from "lucide-react";
import { ReminderList } from "@/components/reminders/reminder-list";
import type { ReminderOverview } from "@/lib/reminders/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  data: ReminderOverview;
};

export function NotificationBell({ data }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative gap-2 rounded-full border-slate-200 bg-white/95 px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/80"
        onClick={() => setOpen((value) => !value)}
      >
        <BellRing className="h-4 w-4" />
        Notifications
        {data.totalUnread > 0 ? (
          <Badge className="ml-1 h-5 rounded-full bg-amber-100 px-1.5 text-[10px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            {data.totalUnread}
          </Badge>
        ) : null}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </Button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(94vw,34rem)] rounded-3xl border border-slate-200/80 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                Reminder Center
              </p>
              <p className="text-xs text-muted-foreground">
                Mark reminders done or dismiss them without leaving the page.
              </p>
            </div>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              {data.totalUnread} active
            </Badge>
          </div>
          <div className="max-h-[32rem] overflow-y-auto pr-1">
            <ReminderList items={data.reminders} compact onHandled={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
