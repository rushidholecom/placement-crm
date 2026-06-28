import { EmailSendStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_LOG_PAGE_SIZE
} from "@/lib/email/constants";

const DEFAULT_EMAIL_SETTINGS = {
  smtpHost: "smtp.example.com",
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: "",
  smtpPassword: "",
  fromName: "Placement CRM",
  fromEmail: "noreply@example.com",
  replyTo: "",
  signature: "Regards,\nPlacement CRM"
};

async function ensureEmailDefaults() {
  const [settings] = await Promise.all([
    prisma.emailSettings.upsert({
      where: { key: "default" },
      update: {},
      create: {
        key: "default",
        ...DEFAULT_EMAIL_SETTINGS
      }
    }),
    ...DEFAULT_EMAIL_TEMPLATES.map((template) =>
      prisma.emailTemplate.upsert({
        where: { key: template.key },
        update: {},
        create: {
          key: template.key,
          label: template.label,
          subject: template.subject,
          body: template.body,
          isDefault: true
        }
      })
    )
  ]);

  return settings;
}

export async function getEmailPage() {
  const settings = await ensureEmailDefaults();

  const [loadedSettings, templates, logs, companies, hrContacts, emailStats] =
    await Promise.all([
      prisma.emailSettings.findUnique({
        where: { key: settings.key },
        select: {
          key: true,
          smtpHost: true,
          smtpPort: true,
          smtpSecure: true,
          smtpUser: true,
          smtpPassword: true,
          fromName: true,
          fromEmail: true,
          replyTo: true,
          signature: true
        }
      }),
      prisma.emailTemplate.findMany({
        orderBy: {
          label: "asc"
        }
      }),
      prisma.emailLog.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: EMAIL_LOG_PAGE_SIZE,
        include: {
          company: {
            select: {
              id: true,
              name: true
            }
          },
          hrContact: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }),
      prisma.company.findMany({
        select: {
          id: true,
          name: true,
          city: true
        },
        orderBy: {
          name: "asc"
        }
      }),
      prisma.hrContact.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          fullName: "asc"
        }
      }),
      prisma.emailLog.groupBy({
        by: ["status"],
        _count: {
          status: true
        }
      })
    ]);

  const settingsData = loadedSettings
    ? {
        key: loadedSettings.key,
        smtpHost: loadedSettings.smtpHost,
        smtpPort: loadedSettings.smtpPort,
        smtpSecure: loadedSettings.smtpSecure,
        smtpUser: loadedSettings.smtpUser ?? "",
        smtpPassword: "",
        fromName: loadedSettings.fromName,
        fromEmail: loadedSettings.fromEmail,
        replyTo: loadedSettings.replyTo ?? "",
        signature: loadedSettings.signature ?? ""
      }
    : null;

  const stats = {
    totalTemplates: templates.length,
    successfulSends:
      emailStats.find((item) => item.status === EmailSendStatus.SUCCESS)?._count
        .status ?? 0,
    failedSends:
      emailStats.find((item) => item.status === EmailSendStatus.FAILED)?._count
        .status ?? 0,
    hasConfiguredSmtp:
      Boolean(settingsData?.smtpHost) &&
      Boolean(settingsData?.fromEmail) &&
      Boolean(settingsData?.fromName)
  };

  return {
    settings: settingsData,
    templates: templates.sort(
      (left, right) =>
        DEFAULT_EMAIL_TEMPLATES.findIndex((template) => template.key === left.key) -
        DEFAULT_EMAIL_TEMPLATES.findIndex((template) => template.key === right.key)
    ),
    logs,
    companies,
    hrContacts,
    stats
  };
}
