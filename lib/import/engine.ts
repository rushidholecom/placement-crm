import {
  ActivityType,
  CompanySize,
  CompanyStatus,
  HrPriority,
  HrStatus,
  Prisma
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMPANY_SIZE_OPTIONS, COMPANY_STATUS_OPTIONS, HR_PRIORITY_OPTIONS, HR_STATUS_OPTIONS } from "@/lib/import/constants";
import { importPayloadSchema, type ImportRowInput } from "@/lib/import/validators";
import type { ImportActionState, ImportReviewResult, ImportReviewRow, ImportSummary } from "@/lib/import/types";

function normalizeEnum<T extends string>(value: string, allowed: readonly T[], fallback: T) {
  const normalized = value.trim().replace(/[\s-]+/g, "_").toUpperCase();
  return (allowed.includes(normalized as T) ? normalized : fallback) as T;
}

function toNullable(value: string) {
  return value.trim().length > 0 ? value.trim() : null;
}

function parseDate(value: string) {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildKey(companyName: string, companyCity: string) {
  return `${companyName.trim().toLowerCase()}::${companyCity.trim().toLowerCase()}`;
}

function buildHrKey(email: string) {
  return email.trim().toLowerCase();
}

function localValidateRow(row: ImportRowInput) {
  const issues: string[] = [];

  if (row.companyName.trim().length < 2) {
    issues.push("Company name is required.");
  }
  if (row.companyCity.trim().length < 2) {
    issues.push("Company city is required.");
  }
  if (row.companyIndustry.trim().length < 2) {
    issues.push("Company industry is required.");
  }
  if (row.hrFullName.trim().length < 2) {
    issues.push("HR full name is required.");
  }
  if (row.hrEmail.trim().length < 5 || !row.hrEmail.includes("@")) {
    issues.push("HR email must be valid.");
  }
  if (row.hrPhone.trim().length < 7) {
    issues.push("HR phone is required.");
  }
  if (row.hrDesignation.trim().length < 2) {
    issues.push("HR designation is required.");
  }
  if (row.hrCity.trim().length < 2) {
    issues.push("HR city is required.");
  }
  if (row.lastContactDate && Number.isNaN(Date.parse(row.lastContactDate))) {
    issues.push("Last contact date must be valid.");
  }
  if (row.nextFollowUpDate && Number.isNaN(Date.parse(row.nextFollowUpDate))) {
    issues.push("Next follow-up date must be valid.");
  }

  return issues;
}

async function findDuplicateMaps(rows: ImportRowInput[]) {
  const companyKeys = Array.from(
    new Set(rows.map((row) => buildKey(row.companyName, row.companyCity)))
  );
  const hrEmails = Array.from(new Set(rows.map((row) => buildHrKey(row.hrEmail))));

  const [companies, hrContacts] = await Promise.all([
    prisma.company.findMany({
      where: {
        OR: companyKeys.map((key) => {
          const [name, city] = key.split("::");
          return {
            name,
            city
          };
        })
      },
      select: {
        id: true,
        name: true,
        city: true
      }
    }),
    prisma.hrContact.findMany({
      where: {
        email: {
          in: hrEmails
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    })
  ]);

  const companyMap = new Map(
    companies.map((company) => [buildKey(company.name, company.city), company])
  );
  const hrMap = new Map(hrContacts.map((contact) => [buildHrKey(contact.email), contact]));

  return { companyMap, hrMap };
}

function computeStatus(issues: string[], duplicateCompany: boolean, duplicateHr: boolean): ImportReviewRow["status"] {
  if (issues.length > 0) {
    return "INVALID";
  }
  if (duplicateCompany && duplicateHr) {
    return "DUPLICATE_BOTH";
  }
  if (duplicateCompany) {
    return "DUPLICATE_COMPANY";
  }
  if (duplicateHr) {
    return "DUPLICATE_HR";
  }
  return "VALID";
}

export async function reviewImportPayload(rawPayload: unknown): Promise<ImportReviewResult> {
  const parsed = importPayloadSchema.safeParse(rawPayload);

  if (!parsed.success) {
    const summary: ImportSummary = {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      duplicateCompanyRows: 0,
      duplicateHrRows: 0,
      readyRows: 0,
      createdCompanies: 0,
      updatedCompanies: 0,
      createdHrContacts: 0,
      updatedHrContacts: 0,
      activitiesCreated: 0
    };

    return {
      rows: [],
      summary
    };
  }

  const duplicateMaps = await findDuplicateMaps(parsed.data.rows);
  const seenCompanyKeys = new Set<string>();
  const seenHrKeys = new Set<string>();

  const rows = parsed.data.rows.map((row, index) => {
    const issues = localValidateRow(row);
    const companyKey = buildKey(row.companyName, row.companyCity);
    const hrKey = buildHrKey(row.hrEmail);
    const duplicateCompany = duplicateMaps.companyMap.has(companyKey) || seenCompanyKeys.has(companyKey);
    const duplicateHr = duplicateMaps.hrMap.has(hrKey) || seenHrKeys.has(hrKey);

    seenCompanyKeys.add(companyKey);
    seenHrKeys.add(hrKey);

    const status = computeStatus(issues, duplicateCompany, duplicateHr);

    return {
      rowNumber: index + 2,
      status,
      issues,
      companyKey,
      hrKey,
      data: row,
      duplicateCompanyId: duplicateMaps.companyMap.get(companyKey)?.id ?? null,
      duplicateHrId: duplicateMaps.hrMap.get(hrKey)?.id ?? null,
      existingCompanyName: duplicateMaps.companyMap.get(companyKey)?.name,
      existingHrName: duplicateMaps.hrMap.get(hrKey)?.fullName
    } satisfies ImportReviewRow;
  });

  const summary: ImportSummary = {
    totalRows: rows.length,
    validRows: rows.filter((row) => row.status !== "INVALID").length,
    invalidRows: rows.filter((row) => row.status === "INVALID").length,
    duplicateCompanyRows: rows.filter((row) => row.status === "DUPLICATE_COMPANY" || row.status === "DUPLICATE_BOTH").length,
    duplicateHrRows: rows.filter((row) => row.status === "DUPLICATE_HR" || row.status === "DUPLICATE_BOTH").length,
    readyRows: rows.filter((row) => row.status !== "INVALID").length,
    createdCompanies: 0,
    updatedCompanies: 0,
    createdHrContacts: 0,
    updatedHrContacts: 0,
    activitiesCreated: 0
  };

  return { rows, summary };
}

function buildCompanyData(row: ImportRowInput) {
  return {
    name: row.companyName.trim(),
    city: row.companyCity.trim(),
    website: toNullable(row.companyWebsite),
    industry: row.companyIndustry.trim(),
    companySize: normalizeEnum(row.companySize, COMPANY_SIZE_OPTIONS, "MID_MARKET") as CompanySize,
    status: normalizeEnum(row.companyStatus, COMPANY_STATUS_OPTIONS, "PROSPECT") as CompanyStatus,
    address: toNullable(row.companyAddress),
    notes: toNullable(row.companyNotes)
  };
}

function buildHrData(row: ImportRowInput, companyId: string) {
  return {
    companyId,
    fullName: row.hrFullName.trim(),
    email: row.hrEmail.trim().toLowerCase(),
    phone: row.hrPhone.trim(),
    whatsapp: toNullable(row.hrWhatsapp),
    linkedIn: toNullable(row.hrLinkedIn),
    designation: row.hrDesignation.trim(),
    city: row.hrCity.trim(),
    remark: toNullable(row.hrRemark),
    priority: normalizeEnum(row.hrPriority, HR_PRIORITY_OPTIONS, "MEDIUM") as HrPriority,
    status: normalizeEnum(row.hrStatus, HR_STATUS_OPTIONS, "ACTIVE") as HrStatus,
    lastContactDate: parseDate(row.lastContactDate),
    nextFollowUpDate: parseDate(row.nextFollowUpDate)
  };
}

async function upsertCompany(tx: Prisma.TransactionClient, row: ImportRowInput) {
  const data = buildCompanyData(row);
  const existing = await tx.company.findUnique({
    where: {
      name_city: {
        name: data.name,
        city: data.city
      }
    }
  });

  if (existing) {
    const updated = await tx.company.update({
      where: { id: existing.id },
      data: {
        website: data.website ?? existing.website,
        industry: data.industry || existing.industry,
        companySize: data.companySize ?? existing.companySize,
        status: data.status ?? existing.status,
        address: data.address ?? existing.address,
        notes: data.notes ?? existing.notes
      }
    });

    return { company: updated, action: "updated" as const };
  }

  const company = await tx.company.create({
    data
  });

  return { company, action: "created" as const };
}

async function upsertHr(tx: Prisma.TransactionClient, row: ImportRowInput, companyId: string) {
  const data = buildHrData(row, companyId);
  const existing = await tx.hrContact.findUnique({
    where: { email: data.email }
  });

  if (existing) {
    const updated = await tx.hrContact.update({
      where: { id: existing.id },
      data: {
        companyId,
        fullName: data.fullName,
        phone: data.phone,
        whatsapp: data.whatsapp ?? existing.whatsapp,
        linkedIn: data.linkedIn ?? existing.linkedIn,
        designation: data.designation,
        city: data.city,
        remark: data.remark ?? existing.remark,
        priority: data.priority,
        status: data.status,
        lastContactDate: data.lastContactDate ?? existing.lastContactDate,
        nextFollowUpDate: data.nextFollowUpDate ?? existing.nextFollowUpDate
      }
    });

    return { hrContact: updated, action: "updated" as const };
  }

  const hrContact = await tx.hrContact.create({
    data
  });

  return { hrContact, action: "created" as const };
}

function buildTimelineDescription(row: ImportRowInput, companyAction: string, hrAction: string) {
  const parts = [
    `${row.companyName.trim()} / ${row.hrFullName.trim()}`,
    `company ${companyAction}`,
    `HR ${hrAction}`
  ];

  if (row.timelineDescription.trim()) {
    parts.push(row.timelineDescription.trim());
  }

  return parts.join(" - ");
}

async function importRows(rows: ImportReviewRow[], skipInvalidRows: boolean) {
  const summary: ImportSummary = {
    totalRows: rows.length,
    validRows: 0,
    invalidRows: 0,
    duplicateCompanyRows: 0,
    duplicateHrRows: 0,
    readyRows: 0,
    createdCompanies: 0,
    updatedCompanies: 0,
    createdHrContacts: 0,
    updatedHrContacts: 0,
    activitiesCreated: 0
  };

  const validRows = rows.filter((row) => row.status !== "INVALID");
  const invalidRows = rows.length - validRows.length;

  summary.validRows = validRows.length;
  summary.invalidRows = invalidRows;
  summary.duplicateCompanyRows = rows.filter((row) => row.status === "DUPLICATE_COMPANY" || row.status === "DUPLICATE_BOTH").length;
  summary.duplicateHrRows = rows.filter((row) => row.status === "DUPLICATE_HR" || row.status === "DUPLICATE_BOTH").length;
  summary.readyRows = skipInvalidRows ? validRows.length : rows.length;

  if (!skipInvalidRows && invalidRows > 0) {
    throw new Error("Fix the invalid rows or enable Skip Invalid Rows to continue.");
  }

  await prisma.$transaction(async (tx) => {
    for (const row of validRows) {
      const companyResult = await upsertCompany(tx, row.data);
      const hrResult = await upsertHr(tx, row.data, companyResult.company.id);

      if (companyResult.action === "created") {
        summary.createdCompanies += 1;
      } else {
        summary.updatedCompanies += 1;
      }

      if (hrResult.action === "created") {
        summary.createdHrContacts += 1;
      } else {
        summary.updatedHrContacts += 1;
      }

      const importTitle = row.data.timelineTitle.trim() || "Excel import processed";
      const importDescription = buildTimelineDescription(
        row.data,
        companyResult.action,
        hrResult.action
      );

      await tx.activity.create({
        data: {
          companyId: companyResult.company.id,
          hrContactId: hrResult.hrContact.id,
          title: importTitle,
          description: importDescription,
          type: ActivityType.NOTE
        }
      });

      if (row.data.hrRemark.trim()) {
        await tx.activity.create({
          data: {
            companyId: companyResult.company.id,
            hrContactId: hrResult.hrContact.id,
            title: "HR remark imported",
            description: row.data.hrRemark.trim(),
            type: ActivityType.NOTE
          }
        });
      }

      if (row.data.nextFollowUpDate.trim()) {
        await tx.activity.create({
          data: {
            companyId: companyResult.company.id,
            hrContactId: hrResult.hrContact.id,
            title: "Follow-up date imported",
            description: `Next follow-up set for ${row.data.nextFollowUpDate.trim()}.`,
            type: ActivityType.FOLLOW_UP
          }
        });
      }

      summary.activitiesCreated += 1;
      if (row.data.hrRemark.trim()) {
        summary.activitiesCreated += 1;
      }
      if (row.data.nextFollowUpDate.trim()) {
        summary.activitiesCreated += 1;
      }
    }
  });

  return summary;
}

export async function processImportAction(rawPayload: unknown, mode: "review" | "import") {
  const review = await reviewImportPayload(rawPayload);
  const payload = importPayloadSchema.safeParse(rawPayload);

  if (!payload.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      mode,
      review,
      importedRows: 0,
      skippedRows: 0,
      summary: null
    } satisfies ImportActionState;
  }

  if (mode === "review") {
    return {
      success: true,
      message: `Validated ${review.summary.readyRows} row(s). Review the duplicates and invalid rows below.`,
      mode,
      review,
      importedRows: 0,
      skippedRows: review.summary.invalidRows,
      summary: review.summary
    } satisfies ImportActionState;
  }

  const summary = await importRows(review.rows, payload.data.skipInvalidRows);

  return {
    success: true,
    message: `Imported ${summary.createdCompanies + summary.updatedCompanies} companies and ${summary.createdHrContacts + summary.updatedHrContacts} HR contacts.`,
    mode,
    review,
    importedRows: summary.readyRows,
    skippedRows: summary.invalidRows,
    summary
  } satisfies ImportActionState;
}
