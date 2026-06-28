"use client";

import type { ReminderBucket } from "@prisma/client";
import { CheckCircle2, Clock3, Inbox, X } from "lucide-react";
import { dismissReminderAction, markReminderDoneAction } from "@/lib/reminders/actions";
import type { ReminderItem } from "@/lib/reminders/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReminderListProps = {
  items: ReminderItem[];
  compact?: boolean;
  onHandled?: () => void;
  className?: string;
};

const bucketStyles: Record<ReminderBucket, string> = {
  TODAY: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  TOMORROW: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  OVERDUE: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
};

const bucketLabels: Record<ReminderBucket, string> = {
  TODAY: "Today",
  TOMORROW: "Tomorrow",
  OVERDUE: "Overdue",
  URGENT: "Urgent"
};

function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function ReminderList({
  items,
  compact = false,
  onHandled,
  className
}: ReminderListProps) {
  if (items.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800", className)}>
        No reminders right now.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        return (
          <article
            key={item.id}
            className={cn(
              "rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60",
              compact && "p-3"
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">
                    {item.title}
                  </p>
                  <Badge className={bucketStyles[item.bucket]}>
                    {bucketLabels[item.bucket]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDueDate(item.dueAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Inbox className="h-3.5 w-3.5" />
                    {item.company.name}
                  </span>
                  {item.hrContact ? (
                    <span>{item.hrContact.fullName}</span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <form
                  action={async () => {
                    await markReminderDoneAction(item.id);
                    onHandled?.();
                  }}
                >
                  <Button type="submit" size="sm" variant="outline" className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Done
                  </Button>
                </form>
                <form
                  action={async () => {
                    await dismissReminderAction(item.id);
                    onHandled?.();
                  }}
                >
                  <Button type="submit" size="sm" variant="ghost" className="gap-2">
                    <X className="h-4 w-4" />
                    Dismiss
                  </Button>
                </form>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
