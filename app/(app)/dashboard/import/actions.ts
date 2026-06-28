"use server";

import { redirect } from "next/navigation";
import { revalidateDashboard } from "@/lib/dashboard/revalidate";
import { revalidateCompanyPages } from "@/lib/company/revalidate";
import { revalidateHrPages } from "@/lib/hr/revalidate";
import { revalidateImportSurfaces } from "@/lib/import/revalidate";
import { processImportAction } from "@/lib/import/engine";
import type { ImportActionState } from "@/lib/import/types";

export const initialImportActionState: ImportActionState = {
  success: false,
  message: "",
  mode: "review",
  review: null,
  importedRows: 0,
  skippedRows: 0,
  summary: null
};

function readMode(formData: FormData) {
  const mode = formData.get("mode");
  return mode === "import" ? ("import" as const) : ("review" as const);
}

function readPayload(formData: FormData) {
  const payload = formData.get("payload");

  if (typeof payload !== "string" || payload.trim().length === 0) {
    throw new Error("Import payload is missing.");
  }

  return JSON.parse(payload);
}

export async function processImportFormAction(
  _previousState: ImportActionState,
  formData: FormData
): Promise<ImportActionState> {
  const mode = readMode(formData);

  try {
    const payload = readPayload(formData);
    const result = await processImportAction(payload, mode);

    if (mode === "import" && result.success) {
      await revalidateImportSurfaces();
      await revalidateDashboard();
      await revalidateCompanyPages();
      await revalidateHrPages();

      if (result.summary && result.summary.readyRows > 0) {
        return {
          ...result,
          message: `${result.message} Rollback on failure was ${payload.rollbackOnFailure ? "enabled" : "disabled"}.`
        };
      }
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to process the import.",
      mode,
      review: null,
      importedRows: 0,
      skippedRows: 0,
      summary: null
    };
  }
}
