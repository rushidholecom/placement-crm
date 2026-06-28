"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ToastPayload } from "@/lib/toast";
import { useToast } from "@/components/providers/toast-provider";

type ToastBridgeProps = {
  toast: ToastPayload | null;
};

export function ToastBridge({ toast }: ToastBridgeProps) {
  const { showToast } = useToast();
  const keyRef = useRef<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!toast) {
      keyRef.current = null;
      return;
    }

    const nextKey = `${toast.title}:${toast.description}:${toast.variant ?? "info"}`;

    if (keyRef.current === nextKey) {
      return;
    }

    keyRef.current = nextKey;
    showToast(toast);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("toast");

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false
    });
  }, [pathname, router, searchParams, showToast, toast]);

  return null;
}
