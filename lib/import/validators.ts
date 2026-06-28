import { z } from "zod";
import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_STATUS_OPTIONS,
  HR_PRIORITY_OPTIONS,
  HR_STATUS_OPTIONS,
  IMPORT_COLUMN_KEYS
} from "@/lib/import/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "");

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine(
    (value) => value.length === 0 || !Number.isNaN(Date.parse(value)),
    "Date must be valid."
  );

export const importRowSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required."),
  companyCity: z.string().trim().min(2, "Company city is required."),
  companyWebsite: optionalString,
  companyIndustry: z.string().trim().min(2, "Company industry is required."),
  companySize: z.enum(COMPANY_SIZE_OPTIONS, {
    message: "Company size is required."
  }),
  companyStatus: z.enum(COMPANY_STATUS_OPTIONS).optional().transform((value) => value || "PROSPECT"),
  companyAddress: optionalString,
  companyNotes: optionalString,
  hrFullName: z.string().trim().min(2, "HR full name is required."),
  hrEmail: z.string().trim().email("HR email must be valid.").toLowerCase(),
  hrPhone: z.string().trim().min(7, "HR phone is required."),
  hrWhatsapp: optionalString,
  hrLinkedIn: optionalString,
  hrDesignation: z.string().trim().min(2, "HR designation is required."),
  hrCity: z.string().trim().min(2, "HR city is required."),
  hrRemark: optionalString,
  hrPriority: z.enum(HR_PRIORITY_OPTIONS).optional().transform((value) => value || "MEDIUM"),
  hrStatus: z.enum(HR_STATUS_OPTIONS).optional().transform((value) => value || "ACTIVE"),
  lastContactDate: optionalDateString,
  nextFollowUpDate: optionalDateString,
  timelineTitle: optionalString,
  timelineDescription: optionalString
});

export const importPayloadSchema = z.object({
  rows: z.array(importRowSchema).min(1, "At least one row is required."),
  skipInvalidRows: z.boolean().default(true),
  rollbackOnFailure: z.boolean().default(true)
});

export const importMappingSchema = z.object({
  headers: z.array(z.string()),
  mapping: z.record(z.enum(IMPORT_COLUMN_KEYS), z.string().optional().default("")),
  rows: z.array(z.array(z.string()))
});

export type ImportRowInput = z.infer<typeof importRowSchema>;
export type ImportPayloadInput = z.infer<typeof importPayloadSchema>;
export type ImportMappingInput = z.infer<typeof importMappingSchema>;
