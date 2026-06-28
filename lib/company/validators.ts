import { z } from "zod";
import {
  COMPANY_SIZES,
  COMPANY_SORT_FIELDS,
  COMPANY_STATUSES
} from "@/lib/company/constants";

export const companyFormSchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters."),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) =>
        value.length === 0 ||
        /^https?:\/\/([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(value),
      "Website must be a valid URL starting with http:// or https://."
    ),
  industry: z.string().trim().min(2, "Industry is required."),
  companySize: z.enum(COMPANY_SIZES, {
    message: "Company size is required."
  }),
  city: z.string().trim().min(2, "City is required."),
  address: z.string().trim().max(300, "Address must be at most 300 characters.").optional(),
  notes: z.string().trim().max(1000, "Notes must be at most 1000 characters.").optional(),
  status: z.enum(COMPANY_STATUSES, {
    message: "Status is required."
  })
});

export const companiesQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
  status: z.enum(COMPANY_STATUSES).optional(),
  industry: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  sortBy: z.enum(COMPANY_SORT_FIELDS).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1)
});

export type CompanyFormInput = z.infer<typeof companyFormSchema>;
export type CompaniesQueryInput = z.infer<typeof companiesQuerySchema>;
