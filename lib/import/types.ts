import type { ImportRowInput } from "@/lib/import/validators";

export type ImportRowStatus =
  | "VALID"
  | "INVALID"
  | "DUPLICATE_COMPANY"
  | "DUPLICATE_HR"
  | "DUPLICATE_BOTH";

export type ImportReviewRow = {
  rowNumber: number;
  status: ImportRowStatus;
  issues: string[];
  companyKey: string;
  hrKey: string;
  data: ImportRowInput;
  duplicateCompanyId?: string | null;
  duplicateHrId?: string | null;
  existingCompanyName?: string;
  existingHrName?: string;
};

export type ImportSummary = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateCompanyRows: number;
  duplicateHrRows: number;
  readyRows: number;
  createdCompanies: number;
  updatedCompanies: number;
  createdHrContacts: number;
  updatedHrContacts: number;
  activitiesCreated: number;
};

export type ImportReviewResult = {
  rows: ImportReviewRow[];
  summary: ImportSummary;
};

export type ImportActionState = {
  success: boolean;
  message: string;
  mode: "review" | "import";
  review: ImportReviewResult | null;
  importedRows: number;
  skippedRows: number;
  summary: ImportSummary | null;
};

export type ImportPayload = {
  rows: ImportRowInput[];
  skipInvalidRows: boolean;
  rollbackOnFailure: boolean;
};
