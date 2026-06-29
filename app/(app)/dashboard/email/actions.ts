"use server";

import { ActivityType, EmailSendStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidateEmailPages } from "@/lib/email/revalidate";
import {
  emailSendSchema,
  emailSettingsSchema,
  emailTemplateSchema
} from "@/lib/email/validators";
import {
  buildEmailHtml,
  renderEmailTemplate
} from "@/lib/email/render";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email/constants";

type EmailSettingsFieldName =
  | "smtpHost"
  | "smtpPort"
  | "smtpSecure"
  | "smtpUser"
  | "smtpPassword"
  | "fromName"
  | "fromEmail"
  | "replyTo"
  | "signature";

type EmailTemplateFieldName = "subject" | "body";

type EmailSendFieldName =
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

function normalizeSettingsFormData(formData: FormData) {
  return emailSettingsSchema.safeParse({
    smtpHost: formData.get("smtpHost"),
    smtpPort: formData.get("smtpPort"),
    smtpSecure: formData.get("smtpSecure"),
    smtpUser: formData.get("smtpUser"),
    smtpPassword: formData.get("smtpPassword"),
    fromName: formData.get("fromName"),
    fromEmail: formData.get("fromEmail"),
    replyTo: formData.get("replyTo"),
    signature: formData.get("signature")
  });
}

function normalizeTemplateFormData(formData: FormData) {
  return emailTemplateSchema.safeParse({
    key: formData.get("key"),
    subject: formData.get("subject"),
    body: formData.get("body")
  });
}

function normalizeSendFormData(formData: FormData) {
  return emailSendSchema.safeParse({
    templateKey: formData.get("templateKey"),
    companyId: formData.get("companyId"),
    hrContactId: formData.get("hrContactId"),
    recipientName: formData.get("recipientName"),
    recipientEmail: formData.get("recipientEmail"),
    cc: formData.get("cc"),
    bcc: formData.get("bcc"),
    subject: formData.get("subject"),
    body: formData.get("body")
  });
}

function formatEmailList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function templateDefaults(key: string) {
  return DEFAULT_EMAIL_TEMPLATES.find((template) => template.key === key);
}

export async function saveEmailSettingsAction(
  _previousState: EmailSettingsFormState,
  formData: FormData
): Promise<EmailSettingsFormState> {
  const parsed = normalizeSettingsFormData(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const existingSettings = await prisma.emailSettings.findUnique({
    where: { key: "default" },
    select: {
      smtpPassword: true
    }
  });

  const nextPassword =
    parsed.data.smtpPassword.trim().length > 0
      ? parsed.data.smtpPassword
      : existingSettings?.smtpPassword ?? null;

  await prisma.emailSettings.upsert({
    where: { key: "default" },
    update: {
      smtpHost: parsed.data.smtpHost,
      smtpPort: parsed.data.smtpPort,
      smtpSecure: parsed.data.smtpSecure,
      smtpUser: parsed.data.smtpUser || null,
      smtpPassword: nextPassword,
      fromName: parsed.data.fromName,
      fromEmail: parsed.data.fromEmail,
      replyTo: parsed.data.replyTo || null,
      signature: parsed.data.signature || null
    },
    create: {
      key: "default",
      smtpHost: parsed.data.smtpHost,
      smtpPort: parsed.data.smtpPort,
      smtpSecure: parsed.data.smtpSecure,
      smtpUser: parsed.data.smtpUser || null,
      smtpPassword: nextPassword,
      fromName: parsed.data.fromName,
      fromEmail: parsed.data.fromEmail,
      replyTo: parsed.data.replyTo || null,
      signature: parsed.data.signature || null
    }
  });

  await revalidateEmailPages();

  return {
    success: true,
    message: "SMTP settings saved successfully.",
    fieldErrors: {}
  };
}

export async function saveEmailTemplateAction(
  _previousState: EmailTemplateFormState,
  formData: FormData
): Promise<EmailTemplateFormState> {
  const parsed = normalizeTemplateFormData(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const template = templateDefaults(parsed.data.key);

  await prisma.emailTemplate.upsert({
    where: { key: parsed.data.key },
    update: {
      label: template?.label ?? parsed.data.key,
      subject: parsed.data.subject,
      body: parsed.data.body,
      isDefault: true,
      deletedAt: null
    },
    create: {
      key: parsed.data.key,
      label: template?.label ?? parsed.data.key,
      subject: parsed.data.subject,
      body: parsed.data.body,
      isDefault: true,
      deletedAt: null
    }
  });

  await revalidateEmailPages();

  return {
    success: true,
    message: `${template?.label ?? parsed.data.key} template saved.`,
    fieldErrors: {}
  };
}

export async function sendEmailAction(
  _previousState: EmailSendFormState,
  formData: FormData
): Promise<EmailSendFormState> {
  const parsed = normalizeSendFormData(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const [settings, template, hrContact] = await Promise.all([
    prisma.emailSettings.findUnique({
      where: { key: "default" }
    }),
    prisma.emailTemplate.findFirst({
      where: {
        key: parsed.data.templateKey,
        deletedAt: null
      }
    }),
    parsed.data.hrContactId
      ? prisma.hrContact.findFirst({
          where: {
            id: parsed.data.hrContactId,
            deletedAt: null,
            company: {
              deletedAt: null
            }
          },
          select: {
            id: true,
            companyId: true,
            fullName: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })
      : Promise.resolve(null)
  ]);

  if (!settings) {
    return {
      success: false,
      message: "SMTP settings are missing.",
      fieldErrors: {}
    };
  }

  if (!template) {
    return {
      success: false,
      message: "The selected template was not found.",
      fieldErrors: {
        templateKey: ["Selected email template is missing."]
      }
    };
  }

  const company = parsed.data.companyId
    ? await prisma.company.findFirst({
        where: {
          id: parsed.data.companyId,
          deletedAt: null
        },
        select: {
          id: true,
          name: true
        }
      })
    : hrContact?.company ?? null;

  if (parsed.data.companyId && !company) {
    return {
      success: false,
      message: "Selected company was not found.",
      fieldErrors: {
        companyId: ["Selected company is missing."]
      }
    };
  }

  const resolvedSignature =
    settings.signature?.trim() || `Regards,\n${settings.fromName}`;
  const context = {
    senderName: settings.fromName,
    recipientName: parsed.data.recipientName,
    recipientEmail: parsed.data.recipientEmail,
    companyName: company?.name ?? "your company",
    hrName: hrContact?.fullName ?? "",
    signature: resolvedSignature,
    currentDate: new Date().toLocaleDateString("en-IN")
  };
  const rendered = renderEmailTemplate(
    parsed.data.subject,
    parsed.data.body,
    context
  );
  const html = buildEmailHtml({
    subject: rendered.subject,
    body: rendered.body,
    senderName: settings.fromName,
    recipientName: parsed.data.recipientName,
    recipientEmail: parsed.data.recipientEmail,
    companyName: company?.name ?? "",
    hrName: hrContact?.fullName ?? ""
  });

  const emailLog = await prisma.emailLog.create({
    data: {
      companyId: company?.id ?? hrContact?.companyId ?? null,
      hrContactId: hrContact?.id ?? null,
      templateKey: parsed.data.templateKey,
      recipientName: parsed.data.recipientName,
      recipientEmail: parsed.data.recipientEmail,
      cc: parsed.data.cc || null,
      bcc: parsed.data.bcc || null,
      subject: rendered.subject,
      body: rendered.body,
      status: EmailSendStatus.FAILED
    }
  });

  try {
    const sendResult = await sendSmtpEmail({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      user: settings.smtpUser,
      password: settings.smtpPassword,
      from: {
        name: settings.fromName,
        email: settings.fromEmail
      },
      to: [
        {
          name: parsed.data.recipientName,
          email: parsed.data.recipientEmail
        }
      ],
      cc: formatEmailList(parsed.data.cc).map((email) => ({ email })),
      bcc: formatEmailList(parsed.data.bcc).map((email) => ({ email })),
      replyTo: settings.replyTo || null,
      subject: rendered.subject,
      text: rendered.body,
      html
    });

    await prisma.$transaction([
      prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailSendStatus.SUCCESS,
          errorMessage: null
        }
      }),
      prisma.activity.create({
        data: {
          companyId: company?.id ?? hrContact?.companyId ?? null,
          hrContactId: hrContact?.id ?? null,
          title: "Email sent",
          description: `${rendered.subject} was sent to ${parsed.data.recipientName} (${parsed.data.recipientEmail}).`,
          type: ActivityType.EMAIL
        }
      })
    ]);

    await revalidateEmailPages();
    revalidatePath("/dashboard/hr");
    revalidatePath("/dashboard/companies");

    return {
      success: true,
      message: sendResult.message,
      fieldErrors: {}
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to send the email right now.";

    await prisma.$transaction([
      prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailSendStatus.FAILED,
          errorMessage
        }
      }),
      prisma.activity.create({
        data: {
          companyId: company?.id ?? hrContact?.companyId ?? null,
          hrContactId: hrContact?.id ?? null,
          title: "Email failed",
          description: `Failed to send ${rendered.subject} to ${parsed.data.recipientName} (${parsed.data.recipientEmail}).`,
          type: ActivityType.EMAIL
        }
      })
    ]);

    await revalidateEmailPages();

    return {
      success: false,
      message: `Email failed: ${errorMessage}`,
      fieldErrors: {}
    };
  }
}
