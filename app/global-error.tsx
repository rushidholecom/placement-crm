"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Application startup error</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A fatal rendering error occurred before the application could finish
            loading this route tree.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            {error.message || "Unexpected startup error."}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={reset}>Retry application load</Button>
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Go to login
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
