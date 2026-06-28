import { IMPORT_SAMPLE_HEADERS, IMPORT_SAMPLE_ROWS } from "@/lib/import/constants";

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildSampleCsv() {
  const rows = [IMPORT_SAMPLE_HEADERS, ...IMPORT_SAMPLE_ROWS];
  return rows.map((row) => row.map((value) => escapeCsvValue(value)).join(",")).join("\n");
}

export function buildSampleWorkbookData() {
  return [
    IMPORT_SAMPLE_HEADERS,
    ...IMPORT_SAMPLE_ROWS.map((row) => [...row])
  ];
}
