import { COMPANY_SIZES, COMPANY_STATUSES } from "@/lib/company/constants";
import { HR_PRIORITIES, HR_STATUSES } from "@/lib/hr/constants";

export const IMPORT_COLUMN_KEYS = [
  "companyName",
  "companyCity",
  "companyWebsite",
  "companyIndustry",
  "companySize",
  "companyStatus",
  "companyAddress",
  "companyNotes",
  "hrFullName",
  "hrEmail",
  "hrPhone",
  "hrWhatsapp",
  "hrLinkedIn",
  "hrDesignation",
  "hrCity",
  "hrRemark",
  "hrPriority",
  "hrStatus",
  "lastContactDate",
  "nextFollowUpDate",
  "timelineTitle",
  "timelineDescription"
] as const;

export type ImportColumnKey = (typeof IMPORT_COLUMN_KEYS)[number];

export const IMPORT_COLUMN_LABELS: Record<ImportColumnKey, string> = {
  companyName: "Company Name",
  companyCity: "Company City",
  companyWebsite: "Company Website",
  companyIndustry: "Company Industry",
  companySize: "Company Size",
  companyStatus: "Company Status",
  companyAddress: "Company Address",
  companyNotes: "Company Notes",
  hrFullName: "HR Full Name",
  hrEmail: "HR Email",
  hrPhone: "HR Phone",
  hrWhatsapp: "HR WhatsApp",
  hrLinkedIn: "HR LinkedIn",
  hrDesignation: "HR Designation",
  hrCity: "HR City",
  hrRemark: "HR Remark",
  hrPriority: "HR Priority",
  hrStatus: "HR Status",
  lastContactDate: "Last Contact Date",
  nextFollowUpDate: "Next Follow-up Date",
  timelineTitle: "Timeline Title",
  timelineDescription: "Timeline Description"
};

export const COMPANY_SIZE_OPTIONS = [...COMPANY_SIZES];
export const COMPANY_STATUS_OPTIONS = [...COMPANY_STATUSES];
export const HR_PRIORITY_OPTIONS = [...HR_PRIORITIES];
export const HR_STATUS_OPTIONS = [...HR_STATUSES];

export const REQUIRED_IMPORT_COLUMNS: ImportColumnKey[] = [
  "companyName",
  "companyCity",
  "companyIndustry",
  "companySize",
  "hrFullName",
  "hrEmail",
  "hrPhone",
  "hrDesignation",
  "hrCity"
];

export const IMPORT_SAMPLE_HEADERS = IMPORT_COLUMN_KEYS.map(
  (key) => IMPORT_COLUMN_LABELS[key]
);

export const IMPORT_SAMPLE_ROWS = [
  [
    "Apex Talent Systems",
    "Bengaluru",
    "https://apextalent.example",
    "SaaS",
    "MID_MARKET",
    "ACTIVE",
    "Indiranagar, Bengaluru",
    "Strong campus hiring partner.",
    "Neha Kapoor",
    "neha.kapoor@apextalent.example",
    "+91-9876501001",
    "+91-9876501001",
    "https://linkedin.com/in/neha-kapoor",
    "Senior Talent Partner",
    "Bengaluru",
    "Primary contact for assessment scheduling.",
    "HIGH",
    "FOLLOW_UP",
    "2026-06-29",
    "2026-07-01",
    "Imported from Excel",
    "Imported row created from migration template."
  ],
  [
    "Bluefin Analytics",
    "Mumbai",
    "https://bluefin.example",
    "Fintech",
    "SMALL",
    "ACTIVE",
    "BKC, Mumbai",
    "Data roles open every quarter.",
    "Aisha Khan",
    "aisha.khan@bluefin.example",
    "+91-9876501003",
    "+91-9876501003",
    "https://linkedin.com/in/aisha-khan",
    "HR Business Partner",
    "Mumbai",
    "Prefers email summaries after calls.",
    "MEDIUM",
    "ACTIVE",
    "2026-06-28",
    "2026-07-02",
    "Imported from Excel",
    "Imported row created from migration template."
  ]
] as const;

export const IMPORT_PAGE_SIZE = 50;

export const IMPORT_TEMPLATE_LINKS = {
  csv: "/api/import/sample-template?format=csv",
  xlsx: "/api/import/sample-template?format=xlsx"
} as const;
