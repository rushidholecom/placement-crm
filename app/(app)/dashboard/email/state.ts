export type EmailSettingsFieldName =
  | "smtpHost"
  | "smtpPort"
  | "smtpSecure"
  | "smtpUser"
  | "smtpPassword"
  | "fromName"
  | "fromEmail"
  | "replyTo"
  | "signature";

export type EmailTemplateFieldName = "subject" | "body";

export type EmailSendFieldName =
  | "templateKey"
  | "companyId"
  | "hrContactId"
  | "recipientName"
  | "recipientEmail"
  | "cc"
  | "bcc"
  | "subject"
  | "body";

export type EmailSettingsFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<EmailSettingsFieldName, string[]>>;
};

export type EmailTemplateFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<EmailTemplateFieldName, string[]>>;
};

export type EmailSendFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<EmailSendFieldName, string[]>>;
};

export const initialEmailSettingsFormState: EmailSettingsFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};

export const initialEmailTemplateFormState: EmailTemplateFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};

export const initialEmailSendFormState: EmailSendFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};
