import { z } from "zod";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email/constants";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "");

export const emailSettingsSchema = z.object({
  smtpHost: z.string().trim().min(2, "SMTP host is required."),
  smtpPort: z.coerce.number().int().min(1, "SMTP port is required.").max(65535),
  smtpSecure: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  smtpUser: optionalString,
  smtpPassword: optionalString,
  fromName: z.string().trim().min(2, "Sender name is required."),
  fromEmail: z.string().trim().email("Sender email must be valid.").toLowerCase(),
  replyTo: optionalString,
  signature: z
    .string()
    .trim()
    .max(500, "Signature must be at most 500 characters.")
    .optional()
    .transform((value) => value || "")
});

export const emailTemplateSchema = z.object({
  key: z.enum(EMAIL_TEMPLATE_KEYS),
  subject: z.string().trim().min(2, "Subject is required."),
  body: z.string().trim().min(20, "Body must be at least 20 characters.")
});

export const emailSendSchema = z.object({
  templateKey: z.enum(EMAIL_TEMPLATE_KEYS),
  companyId: z.string().trim().optional().transform((value) => value || ""),
  hrContactId: z.string().trim().optional().transform((value) => value || ""),
  recipientName: z.string().trim().min(2, "Recipient name is required."),
  recipientEmail: z.string().trim().email("Recipient email must be valid.").toLowerCase(),
  cc: optionalString,
  bcc: optionalString,
  subject: z.string().trim().min(2, "Subject is required."),
  body: z.string().trim().min(20, "Body must be at least 20 characters.")
});

export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;
export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
export type EmailSendInput = z.infer<typeof emailSendSchema>;
