"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastPayload, ToastVariant } from "@/lib/toast";

type ToastRecord = ToastPayload & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/70 dark:text-red-100",
  info: "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return <CheckCircle2 className="h-5 w-5" />;
  }

  if (variant === "error") {
    return <XCircle className="h-5 w-5" />;
  }

  return <Info className="h-5 w-5" />;
}

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timeoutRegistry = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    return () => {
      timeoutRegistry.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRegistry.current.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timeout = timeoutRegistry.current.get(id);

    if (timeout) {
      clearTimeout(timeout);
      timeoutRegistry.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastPayload) => {
      const id = crypto.randomUUID();
      const nextToast = { id, ...toast };

      setToasts((current) => [...current, nextToast]);

      const timeout = setTimeout(() => {
        dismissToast(id);
      }, 4000);

      timeoutRegistry.current.set(id, timeout);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const variant = toast.variant ?? "info";

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto animate-in slide-in-from-top-5 rounded-2xl border p-4 shadow-soft",
                variantStyles[variant]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <ToastIcon variant={variant} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{toast.title}</p>
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-1 opacity-70 transition hover:opacity-100"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
