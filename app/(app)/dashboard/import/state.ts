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
