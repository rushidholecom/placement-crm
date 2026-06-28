"use client";

import { ChangeEvent, useActionState, useMemo, useState } from "react";
import { FileSpreadsheet, LoaderCircle, Upload, Download, CheckCircle2, TriangleAlert } from "lucide-react";
import * as XLSX from "xlsx";
import { processImportFormAction, initialImportActionState } from "@/app/(app)/dashboard/import/actions";
import { FormField } from "@/components/form/form-field";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_STATUS_OPTIONS,
  HR_PRIORITY_OPTIONS,
  HR_STATUS_OPTIONS,
  IMPORT_COLUMN_KEYS,
  IMPORT_COLUMN_LABELS,
  IMPORT_PAGE_SIZE,
  IMPORT_TEMPLATE_LINKS,
  REQUIRED_IMPORT_COLUMNS
} from "@/lib/import/constants";
import { detectColumnMapping, mapRowsFromSheet, normalizeHeader } from "@/lib/import/normalize";
import type { ImportColumnKey } from "@/lib/import/constants";
import type { ImportRowInput } from "@/lib/import/validators";
import { cn } from "@/lib/utils";

type ParsedFileState = {
  fileName: string;
  headers: string[];
  rows: string[][];
};

const emptyMapping = () =>
  IMPORT_COLUMN_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {} as Record<ImportColumnKey, string>);

function coerceText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseWorkbookRows(file: File) {
  return file.name.toLowerCase().endsWith(".csv")
    ? file.text().then((text) => {
        const workbook = XLSX.read(text, { type: "string" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as string[][];
      })
    : file.arrayBuffer().then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as string[][];
      });
}

function isBlankRow(row: string[]) {
  return row.every((cell) => coerceText(cell).length === 0);
}

function getStageColor(stage: number) {
  if (stage >= 4) {
    return "bg-emerald-500";
  }

  if (stage >= 2) {
    return "bg-amber-500";
  }

  return "bg-slate-300 dark:bg-slate-700";
}

function ImportRowPreview({
  row,
  index,
  issues,
  duplicateCompanyId,
  duplicateHrId,
  status
}: {
  row: ImportRowInput;
  index: number;
  issues: string[];
  duplicateCompanyId?: string | null;
  duplicateHrId?: string | null;
  status: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-slate-950 dark:text-slate-50">Row {index}</p>
          <p className="text-sm text-muted-foreground">
            {row.companyName} / {row.hrFullName}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "border",
            status === "VALID" && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
            status === "INVALID" && "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
            status !== "VALID" && status !== "INVALID" && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
          )}
        >
          {status}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
        <p>Company: {duplicateCompanyId ? `Matched existing company` : "New company"}</p>
        <p>HR: {duplicateHrId ? `Matched existing HR` : "New HR contact"}</p>
      </div>

      {issues.length > 0 ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {issues.join(" ")}
        </div>
      ) : null}
    </div>
  );
}

export function ExcelImportWorkflow() {
  const [state, formAction, isPending] = useActionState(
    processImportFormAction,
    initialImportActionState
  );
  const [parsedFile, setParsedFile] = useState<ParsedFileState | null>(null);
  const [mapping, setMapping] = useState<Record<ImportColumnKey, string>>(emptyMapping());
  const [skipInvalidRows, setSkipInvalidRows] = useState(true);
  const [rollbackOnFailure, setRollbackOnFailure] = useState(true);
  const [loadError, setLoadError] = useState("");

  const mappedRows = useMemo(() => {
    if (!parsedFile) {
      return [] as ImportRowInput[];
    }

    return mapRowsFromSheet(parsedFile.rows, parsedFile.headers, mapping).filter(
      (row) => Object.values(row).some((value) => coerceText(value).length > 0)
    );
  }, [parsedFile, mapping]);

  const missingRequiredMappings = REQUIRED_IMPORT_COLUMNS.filter((key) => !mapping[key]);
  const hasHeaders = parsedFile?.headers.length ?? 0 > 0;
  const previewRows = mappedRows.slice(0, IMPORT_PAGE_SIZE);
  const reviewRows = state.review?.rows ?? [];
  const reviewSummary = state.review?.summary;
  const progressStage = state.summary ? 4 : state.review ? 3 : parsedFile ? 2 : 1;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLoadError("");

    try {
      const rows = await parseWorkbookRows(file);
      const [headerRow = [], ...dataRows] = rows;
      const headers = headerRow.map((header) => coerceText(header));
      const normalizedRows = dataRows.filter((row) => !isBlankRow(row));
      const detected = detectColumnMapping(headers);
      const nextMapping = emptyMapping();

      for (const key of IMPORT_COLUMN_KEYS) {
        nextMapping[key] = detected[key] ?? "";
      }

      setParsedFile({
        fileName: file.name,
        headers,
        rows: normalizedRows
      });
      setMapping(nextMapping);
    } catch (error) {
      setParsedFile(null);
      setLoadError(error instanceof Error ? error.message : "Unable to parse the file.");
    }
  }

  const payload = useMemo(
    () =>
      JSON.stringify({
        rows: mappedRows,
        skipInvalidRows,
        rollbackOnFailure
      }),
    [mappedRows, rollbackOnFailure, skipInvalidRows]
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader>
          <CardTitle>Upload file</CardTitle>
          <CardDescription>
            Upload a `.xlsx` or `.csv` file, then map its columns to the CRM fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-amber-500/30 dark:hover:bg-slate-900/60">
              <Upload className="h-10 w-10 text-amber-600" />
              <div>
                <p className="font-semibold text-slate-950 dark:text-slate-50">
                  Upload Excel or CSV
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use the sample template to migrate data in minutes.
                </p>
              </div>
              <Input type="file" accept=".xlsx,.csv" onChange={handleFileChange} className="hidden" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <a href={IMPORT_TEMPLATE_LINKS.xlsx} className={buttonVariants({ variant: "outline" })}>
                <Download className="h-4 w-4" />
                Download XLSX sample
              </a>
              <a href={IMPORT_TEMPLATE_LINKS.csv} className={buttonVariants({ variant: "outline" })}>
                <Download className="h-4 w-4" />
                Download CSV sample
              </a>
            </div>
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {loadError}
            </div>
          ) : null}

          {parsedFile ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              Loaded <span className="font-semibold">{parsedFile.fileName}</span> with{" "}
              <span className="font-semibold">{parsedFile.rows.length}</span> data row(s) and{" "}
              <span className="font-semibold">{parsedFile.headers.length}</span> column(s).
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Map columns</CardTitle>
            <CardDescription>
              Match each application field to a column from your spreadsheet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasHeaders ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800">
                Upload a file to detect columns and start mapping.
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {IMPORT_COLUMN_KEYS.map((key) => (
                    <FormField
                      key={key}
                      id={key}
                      label={IMPORT_COLUMN_LABELS[key]}
                      hint={REQUIRED_IMPORT_COLUMNS.includes(key) ? "Required for import." : "Optional."}
                    >
                      <Select
                        id={key}
                        value={mapping[key]}
                        onChange={(event) =>
                          setMapping((current) => ({
                            ...current,
                            [key]: event.target.value
                          }))
                        }
                      >
                        <option value="">Not mapped</option>
                        {parsedFile?.headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  ))}
                </div>

                {missingRequiredMappings.length > 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                    Map the required fields before validating: {missingRequiredMappings.map((key) => IMPORT_COLUMN_LABELS[key]).join(", ")}.
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
            <CardHeader>
              <CardTitle>Preview data</CardTitle>
              <CardDescription>See the first few mapped rows before validating or importing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Rows</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    {mappedRows.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ready</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    {missingRequiredMappings.length === 0 ? "Yes" : "No"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Skip invalid</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    {skipInvalidRows ? "On" : "Off"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Rollback</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    {rollbackOnFailure ? "On" : "Off"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="skipInvalidRows"
                  type="checkbox"
                  checked={skipInvalidRows}
                  onChange={(event) => setSkipInvalidRows(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-amber-500 dark:border-slate-700 dark:text-amber-400"
                />
                <Label htmlFor="skipInvalidRows">Skip invalid rows</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="rollbackOnFailure"
                  type="checkbox"
                  checked={rollbackOnFailure}
                  onChange={(event) => setRollbackOnFailure(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-amber-500 dark:border-slate-700 dark:text-amber-400"
                />
                <Label htmlFor="rollbackOnFailure">Rollback on failure</Label>
              </div>

              {previewRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-800">
                  Map columns to see a normalized preview here.
                </div>
              ) : (
                <div className="space-y-3">
                  {previewRows.map((row, index) => (
                    <div key={`${row.hrEmail}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {row.companyName} · {row.hrFullName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {row.hrEmail} · {row.hrDesignation} · {row.companyCity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
            <CardHeader>
              <CardTitle>Review and import</CardTitle>
              <CardDescription>
                Validate duplicates first, then import directly into SQLite with rollback safety.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="payload" value={payload} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="submit"
                    name="mode"
                    value="review"
                    disabled={isPending || missingRequiredMappings.length > 0 || mappedRows.length === 0}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    {isPending && state.mode === "review" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Validate data
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    name="mode"
                    value="import"
                    disabled={isPending || missingRequiredMappings.length > 0 || mappedRows.length === 0}
                    className={buttonVariants()}
                  >
                    {isPending && state.mode === "import" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import to SQLite
                      </>
                    )}
                  </button>
                </div>

                {state.message ? (
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm",
                      state.success
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                    )}
                  >
                    {state.message}
                  </div>
                ) : null}

                {reviewSummary ? (
                  <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Total rows
                        </p>
                        <p className="mt-1 text-xl font-semibold">{reviewSummary.totalRows}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Ready to import
                        </p>
                        <p className="mt-1 text-xl font-semibold">{reviewSummary.readyRows}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Invalid rows
                        </p>
                        <p className="mt-1 text-xl font-semibold">{reviewSummary.invalidRows}</p>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={cn("h-full rounded-full transition-all", getStageColor(progressStage))}
                        style={{ width: `${Math.min(100, progressStage * 25)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Import progress, review state, and skipped rows are tracked here for quick migration control.
                    </p>
                  </div>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {reviewRows.length > 0 ? (
        <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Validation results</CardTitle>
            <CardDescription>
              Duplicate company and HR matches are flagged before import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-2">
              {reviewRows.slice(0, 20).map((row) => (
                <ImportRowPreview
                  key={`${row.rowNumber}-${row.hrKey}`}
                  row={row.data}
                  index={row.rowNumber}
                  issues={row.issues}
                  duplicateCompanyId={row.duplicateCompanyId}
                  duplicateHrId={row.duplicateHrId}
                  status={row.status}
                />
              ))}
            </div>

            {reviewRows.length > 20 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm text-muted-foreground dark:border-slate-800">
                Showing first 20 reviewed rows out of {reviewRows.length}.
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
