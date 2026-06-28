import { z } from "zod";
import {
  VACANCY_PRIORITIES,
  VACANCY_SORT_FIELDS,
  VACANCY_STATUSES
} from "@/lib/vacancy/constants";

export const vacancyFormSchema = z.object({
  title: z.string().trim().min(2, "Job title is required."),
  companyId: z.string().trim().min(1, "Company is required."),
  experience: z.string().trim().min(1, "Experience is required."),
  location: z.string().trim().min(2, "Location is required."),
  skills: z.string().trim().min(2, "Skills are required."),
  technology: z.string().trim().optional().transform((value) => value || ""),
  compensationLpa: z.coerce.number().positive("Salary must be greater than zero."),
  openings: z.coerce.number().int().min(1, "At least one opening is required."),
  priority: z.enum(VACANCY_PRIORITIES),
  status: z.enum(VACANCY_STATUSES),
  assignedRecruiterId: z.string().trim().optional().transform((value) => value || ""),
  remark: z.string().trim().max(1000, "Remark must be at most 1000 characters.").optional().transform((value) => value || "")
});

export const vacanciesQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
  companyId: z.string().trim().optional().default(""),
  priority: z.enum(VACANCY_PRIORITIES).optional(),
  status: z.enum(VACANCY_STATUSES).optional(),
  location: z.string().trim().optional().default(""),
  sortBy: z.enum(VACANCY_SORT_FIELDS).optional().default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1)
});

export type VacancyFormInput = z.infer<typeof vacancyFormSchema>;
export type VacanciesQueryInput = z.infer<typeof vacanciesQuerySchema>;
