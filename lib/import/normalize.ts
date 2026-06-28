import type { ImportColumnKey } from "@/lib/import/constants";
import { IMPORT_COLUMN_KEYS, IMPORT_COLUMN_LABELS } from "@/lib/import/constants";
import type { ImportRowInput } from "@/lib/import/validators";

export function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const COLUMN_ALIASES: Record<ImportColumnKey, string[]> = {
  companyName: ["companyname", "company", "organization", "organisation"],
  companyCity: ["companycity", "city"],
  companyWebsite: ["companywebsite", "website", "url"],
  companyIndustry: ["companyindustry", "industry", "sector"],
  companySize: ["companysize", "size"],
  companyStatus: ["companystatus", "status", "companystate"],
  companyAddress: ["companyaddress", "address"],
  companyNotes: ["companynotes", "notes", "remark", "remarks"],
  hrFullName: ["hrfullname", "fullname", "contactname", "hrname", "name"],
  hrEmail: ["hremail", "email", "emailaddress"],
  hrPhone: ["hrphone", "phone", "mobile"],
  hrWhatsapp: ["hrwhatsapp", "whatsapp"],
  hrLinkedIn: ["hrlinkedin", "linkedin", "linkedinprofile"],
  hrDesignation: ["hrdesignation", "designation", "title"],
  hrCity: ["hrcity", "city"],
  hrRemark: ["hrremark", "remark", "notes"],
  hrPriority: ["hrpriority", "priority"],
  hrStatus: ["hrstatus", "status"],
  lastContactDate: ["lastcontactdate", "lastcontact", "lastcalled", "lastinteraction"],
  nextFollowUpDate: ["nextfollowupdate", "followupdate", "nextcontactdate"],
  timelineTitle: ["timelinetitle", "activitytitle", "title"],
  timelineDescription: ["timelinedescription", "activitydescription", "description", "notes"]
};

export function detectColumnMapping(headers: string[]) {
  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  const mapping: Partial<Record<ImportColumnKey, string>> = {};

  for (const key of IMPORT_COLUMN_KEYS) {
    const aliases = COLUMN_ALIASES[key].map(normalizeHeader).concat(normalizeHeader(IMPORT_COLUMN_LABELS[key]));
    const matchIndex = normalizedHeaders.findIndex((header) => aliases.includes(header));

    if (matchIndex >= 0) {
      mapping[key] = headers[matchIndex];
    }
  }

  return mapping;
}

function coerceString(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function mapRowFromColumns(
  row: string[],
  headers: string[],
  mapping: Partial<Record<ImportColumnKey, string>>
): ImportRowInput {
  const byHeader = new Map(headers.map((header, index) => [header, coerceString(row[index])]));
  const get = (key: ImportColumnKey) => {
    const header = mapping[key];
    if (!header) {
      return "";
    }
    return byHeader.get(header) ?? "";
  };

  return {
    companyName: get("companyName"),
    companyCity: get("companyCity"),
    companyWebsite: get("companyWebsite"),
    companyIndustry: get("companyIndustry"),
    companySize: get("companySize") as ImportRowInput["companySize"],
    companyStatus: get("companyStatus") as ImportRowInput["companyStatus"],
    companyAddress: get("companyAddress"),
    companyNotes: get("companyNotes"),
    hrFullName: get("hrFullName"),
    hrEmail: get("hrEmail"),
    hrPhone: get("hrPhone"),
    hrWhatsapp: get("hrWhatsapp"),
    hrLinkedIn: get("hrLinkedIn"),
    hrDesignation: get("hrDesignation"),
    hrCity: get("hrCity"),
    hrRemark: get("hrRemark"),
    hrPriority: get("hrPriority") as ImportRowInput["hrPriority"],
    hrStatus: get("hrStatus") as ImportRowInput["hrStatus"],
    lastContactDate: get("lastContactDate"),
    nextFollowUpDate: get("nextFollowUpDate"),
    timelineTitle: get("timelineTitle"),
    timelineDescription: get("timelineDescription")
  };
}

export function mapRowsFromSheet(
  rows: string[][],
  headers: string[],
  mapping: Partial<Record<ImportColumnKey, string>>
) {
  return rows.map((row) => mapRowFromColumns(row, headers, mapping));
}
