"use server";

import {
  ActivityType,
  FollowUpStatus,
  FollowUpType,
  Prisma
} from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidateHrPages } from "@/lib/hr/revalidate";
import { hrFormSchema } from "@/lib/hr/validators";

type HrFieldName =
  | "fullName"
  | "designation"
  | "companyId"
  | "phone"
  | "email"
  | "whatsapp"
  | "linkedIn"
  | "city"
  | "remark"
  | "priority"
  | "lastContactDate"
  | "nextFollowUpDate"
  | "status";

export type HrFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<HrFieldName, string[]>>;
};

export const initialHrFormState: HrFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};

function normalizeHrFormData(formData: FormData) {
  return hrFormSchema.safeParse({
    fullName: formData.get("fullName"),
    designation: formData.get("designation"),
    companyId: formData.get("companyId"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    linkedIn: formData.get("linkedIn"),
    city: formData.get("city"),
    remark: formData.get("remark"),
    priority: formData.get("priority"),
    lastContactDate: formData.get("lastContactDate"),
    nextFollowUpDate: formData.get("nextFollowUpDate"),
    status: formData.get("status")
  });
}

function toNullableDate(value: string) {
  return value ? new Date(value) : null;
}

function toNullableString(value: string) {
  return value.length > 0 ? value : null;
}

async function getDuplicateFieldErrors({
  email,
  phone,
  whatsapp,
  currentHrId
}: {
  email: string;
  phone: string;
  whatsapp: string;
  currentHrId?: string;
}) {
  const duplicates = await prisma.hrContact.findMany({
    where: {
      ...(currentHrId ? { id: { not: currentHrId } } : {}),
      OR: [
        { email },
        { phone },
        ...(whatsapp ? [{ whatsapp }] : [])
      ]
    },
    select: {
      email: true,
      phone: true,
      whatsapp: true
    }
  });

  const fieldErrors: HrFormState["fieldErrors"] = {};

  if (duplicates.some((contact) => contact.email === email)) {
    fieldErrors.email = ["An HR contact with this email already exists."];
  }

  if (duplicates.some((contact) => contact.phone === phone)) {
    fieldErrors.phone = ["An HR contact with this phone already exists."];
  }

  if (whatsapp && duplicates.some((contact) => contact.whatsapp === whatsapp)) {
    fieldErrors.whatsapp = ["An HR contact with this WhatsApp already exists."];
  }

  return fieldErrors;
}

function hasFieldErrors(fieldErrors: HrFormState["fieldErrors"]) {
  return Object.values(fieldErrors).some((errors) => errors && errors.length > 0);
}

function getPrismaErrorMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "A duplicate HR contact already exists.";
  }

  return "Unable to save the HR contact right now. Please try again.";
}

async function createFollowUpForHr({
  companyId,
  hrContactId,
  fullName,
  nextFollowUpDate,
  remark
}: {
  companyId: string;
  hrContactId: string;
  fullName: string;
  nextFollowUpDate: Date | null;
  remark: string | null;
}) {
  if (!nextFollowUpDate) {
    return;
  }

  await prisma.followUp.create({
    data: {
      companyId,
      hrContactId,
      subject: `Follow up with ${fullName}`,
      notes: remark || "Follow-up created from HR contact record.",
      type: FollowUpType.CALL,
      status: FollowUpStatus.PENDING,
      dueAt: nextFollowUpDate
    }
  });
}

export async function createHrAction(
  _previousState: HrFormState,
  formData: FormData
): Promise<HrFormState> {
  const parsed = normalizeHrFormData(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const duplicateFieldErrors = await getDuplicateFieldErrors(parsed.data);

  if (hasFieldErrors(duplicateFieldErrors)) {
    return {
      success: false,
      message: "Duplicate HR contact found. Review the highlighted fields.",
      fieldErrors: duplicateFieldErrors
    };
  }

  try {
    const lastContactDate = toNullableDate(parsed.data.lastContactDate);
    const nextFollowUpDate = toNullableDate(parsed.data.nextFollowUpDate);

    const hrContact = await prisma.hrContact.create({
      data: {
        fullName: parsed.data.fullName,
        designation: parsed.data.designation,
        companyId: parsed.data.companyId,
        phone: parsed.data.phone,
        email: parsed.data.email,
        whatsapp: toNullableString(parsed.data.whatsapp),
        linkedIn: toNullableString(parsed.data.linkedIn),
        city: parsed.data.city,
        remark: toNullableString(parsed.data.remark),
        priority: parsed.data.priority,
        lastContactDate,
        nextFollowUpDate,
        status: parsed.data.status
      }
    });

    await prisma.activity.create({
      data: {
        companyId: hrContact.companyId,
        hrContactId: hrContact.id,
        title: "HR contact created",
        description: `${hrContact.fullName} was added to the HR pipeline.`,
        type: ActivityType.HR
      }
    });

    await createFollowUpForHr({
      companyId: hrContact.companyId,
      hrContactId: hrContact.id,
      fullName: hrContact.fullName,
      nextFollowUpDate,
      remark: hrContact.remark
    });

    await revalidateHrPages();
  } catch (error) {
    return {
      success: false,
      message: getPrismaErrorMessage(error),
      fieldErrors: {}
    };
  }

  redirect("/dashboard/hr?toast=hr-created");
}

export async function updateHrAction(
  hrId: string,
  _previousState: HrFormState,
  formData: FormData
): Promise<HrFormState> {
  const parsed = normalizeHrFormData(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const duplicateFieldErrors = await getDuplicateFieldErrors({
    ...parsed.data,
    currentHrId: hrId
  });

  if (hasFieldErrors(duplicateFieldErrors)) {
    return {
      success: false,
      message: "Duplicate HR contact found. Review the highlighted fields.",
      fieldErrors: duplicateFieldErrors
    };
  }

  try {
    const existingHr = await prisma.hrContact.findUnique({
      where: { id: hrId },
      select: { nextFollowUpDate: true }
    });

    const lastContactDate = toNullableDate(parsed.data.lastContactDate);
    const nextFollowUpDate = toNullableDate(parsed.data.nextFollowUpDate);

    const hrContact = await prisma.hrContact.update({
      where: { id: hrId },
      data: {
        fullName: parsed.data.fullName,
        designation: parsed.data.designation,
        companyId: parsed.data.companyId,
        phone: parsed.data.phone,
        email: parsed.data.email,
        whatsapp: toNullableString(parsed.data.whatsapp),
        linkedIn: toNullableString(parsed.data.linkedIn),
        city: parsed.data.city,
        remark: toNullableString(parsed.data.remark),
        priority: parsed.data.priority,
        lastContactDate,
        nextFollowUpDate,
        status: parsed.data.status
      }
    });

    await prisma.activity.create({
      data: {
        companyId: hrContact.companyId,
        hrContactId: hrContact.id,
        title: "HR contact updated",
        description: `${hrContact.fullName} contact details were updated.`,
        type: ActivityType.HR
      }
    });

    const nextFollowUpChanged =
      nextFollowUpDate?.getTime() !== existingHr?.nextFollowUpDate?.getTime();

    if (nextFollowUpChanged) {
      await createFollowUpForHr({
        companyId: hrContact.companyId,
        hrContactId: hrContact.id,
        fullName: hrContact.fullName,
        nextFollowUpDate,
        remark: hrContact.remark
      });
    }

    await revalidateHrPages();
  } catch (error) {
    return {
      success: false,
      message: getPrismaErrorMessage(error),
      fieldErrors: {}
    };
  }

  redirect(`/dashboard/hr/${hrId}?toast=hr-updated`);
}

export async function deleteHrAction(hrId: string) {
  const hrContact = await prisma.hrContact.findUnique({
    where: { id: hrId },
    select: {
      id: true,
      fullName: true
    }
  });

  if (!hrContact) {
    redirect("/dashboard/hr?toast=hr-missing");
  }

  await prisma.hrContact.delete({
    where: { id: hrId }
  });

  await revalidateHrPages();
  redirect("/dashboard/hr?toast=hr-deleted");
}
