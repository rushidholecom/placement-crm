import { z } from "zod";
import { HR_PRIORITIES, HR_SORT_FIELDS, HR_STATUSES } from "@/lib/hr/constants";

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine(
    (value) =>
      value.length === 0 ||
      /^https?:\/\/([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(value),
    "LinkedIn must be a valid URL starting with http:// or https://."
  );

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine(
    (value) => value.length === 0 || !Number.isNaN(Date.parse(value)),
    "Date must be valid."
  );

export const hrFormSchema = z
  .object({
    fullName: z.string().trim().min(2, "HR name must be at least 2 characters."),
    designation: z.string().trim().min(2, "Designation is required."),
    companyId: z.string().trim().min(1, "Company is required."),
    phone: z
      .string()
      .trim()
      .min(7, "Phone number is too short.")
      .max(20, "Phone number is too long."),
    email: z.string().trim().email("Email must be valid.").toLowerCase(),
    whatsapp: z
      .string()
      .trim()
      .max(20, "WhatsApp number is too long.")
      .optional()
      .transform((value) => value || ""),
    linkedIn: optionalUrlSchema,
    city: z.string().trim().min(2, "City is required."),
    remark: z
      .string()
      .trim()
      .max(1000, "Remark must be at most 1000 characters.")
      .optional()
      .transform((value) => value || ""),
    priority: z.enum(HR_PRIORITIES, {
      message: "Priority is required."
    }),
    lastContactDate: optionalDateSchema,
    nextFollowUpDate: optionalDateSchema,
    status: z.enum(HR_STATUSES, {
      message: "Status is required."
    })
  })
  .refine(
    (value) =>
      !value.lastContactDate ||
      !value.nextFollowUpDate ||
      new Date(value.nextFollowUpDate) >= new Date(value.lastContactDate),
    {
      message: "Next follow-up cannot be before last contact.",
      path: ["nextFollowUpDate"]
    }
  );

export const hrQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
  companyId: z.string().trim().optional().default(""),
  priority: z.enum(HR_PRIORITIES).optional(),
  status: z.enum(HR_STATUSES).optional(),
  city: z.string().trim().optional().default(""),
  sortBy: z.enum(HR_SORT_FIELDS).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1)
});

export type HrFormInput = z.infer<typeof hrFormSchema>;
export type HrQueryInput = z.infer<typeof hrQuerySchema>;
