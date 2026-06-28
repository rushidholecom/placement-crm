export type ToastVariant = "success" | "error" | "info";

export type ToastPayload = {
  title: string;
  description: string;
  variant?: ToastVariant;
};

const toastRegistry: Record<string, ToastPayload> = {
  welcome: {
    title: "Signed in successfully",
    description: "Your authenticated workspace is ready.",
    variant: "success"
  },
  "signed-out": {
    title: "Signed out",
    description: "Your session has been cleared safely.",
    variant: "info"
  }
};

export function getToastFromSearchParams(
  searchParams?: Record<string, string | string[] | undefined>
) {
  const toastKey = searchParams?.toast;
  const key = Array.isArray(toastKey) ? toastKey[0] : toastKey;

  if (!key) {
    return null;
  }

  return toastRegistry[key] ?? null;
}
