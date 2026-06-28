"use client";

import { useEffect } from "react";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({
  error,
  reset
}: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-10 max-w-2xl">
      <CardHeader>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <ServerCrash className="h-6 w-6" />
        </div>
        <CardTitle>Dashboard failed to load</CardTitle>
        <CardDescription>
          The protected workspace encountered an error while preparing data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          {error.message || "Unexpected dashboard error."}
        </div>
        <Button onClick={reset}>Reload dashboard</Button>
      </CardContent>
    </Card>
  );
}
