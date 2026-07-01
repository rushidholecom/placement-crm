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
import { type HrFormState } from "@/app/(app)/dashboard/hr/state";

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
      deletedAt: null,
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

async function logHrActivity({
  companyId,
  hrContactId,
  title,
  description,
  type
}: {
  companyId: string;
  hrContactId: string;
  title: string;
  description: string;
  type: ActivityType;
}) {
  await prisma.activity.create({
    data: {
      companyId,
      hrContactId,
      title,
      description,
      type
    }
  });
}

async function syncFollowUpForHr({
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
  const templateSubject = `Follow up with ${fullName}`;
  const templateNotes = remark || "Follow-up created from HR contact record.";

  const existingFollowUp = await prisma.followUp.findFirst({
    where: {
      hrContactId,
      deletedAt: null,
      status: FollowUpStatus.PENDING,
      subject: {
        startsWith: "Follow up with "
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!nextFollowUpDate) {
    if (!existingFollowUp) {
      return { action: null as const, followUp: null };
    }

    const cancelledFollowUp = await prisma.followUp.update({
      where: { id: existingFollowUp.id },
      data: {
        status: FollowUpStatus.CANCELLED,
        notes: existingFollowUp.notes
      }
    });

    return { action: "cancelled" as const, followUp: cancelledFollowUp };
  }

  if (existingFollowUp) {
    const updatedFollowUp = await prisma.followUp.update({
      where: { id: existingFollowUp.id },
      data: {
        companyId,
        hrContactId,
        subject: templateSubject,
        notes: remark || existingFollowUp.notes || templateNotes,
        type: FollowUpType.CALL,
        status: FollowUpStatus.PENDING,
        dueAt: nextFollowUpDate,
        completedAt: null
      }
    });

    return { action: "updated" as const, followUp: updatedFollowUp };
  }

  const createdFollowUp = await prisma.followUp.create({
    data: {
      companyId,
      hrContactId,
      subject: templateSubject,
      notes: templateNotes,
      type: FollowUpType.CALL,
      status: FollowUpStatus.PENDING,
      dueAt: nextFollowUpDate
    }
  });

  return { action: "created" as const, followUp: createdFollowUp };
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
    const remark = toNullableString(parsed.data.remark);

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
        remark,
        priority: parsed.data.priority,
        lastContactDate,
        nextFollowUpDate,
        status: parsed.data.status
      }
    });

    await logHrActivity({
      companyId: hrContact.companyId,
      hrContactId: hrContact.id,
      title: "HR created",
      description: `${hrContact.fullName} was added to the HR pipeline.`,
      type: ActivityType.HR
    });

    const followUpResult = await syncFollowUpForHr({
      companyId: hrContact.companyId,
      hrContactId: hrContact.id,
      fullName: hrContact.fullName,
      nextFollowUpDate,
      remark
    });

    if (followUpResult.action === "created") {
      await logHrActivity({
        companyId: hrContact.companyId,
        hrContactId: hrContact.id,
        title: "Follow-up scheduled",
        description: `Follow-up planned for ${nextFollowUpDate?.toLocaleDateString("en-IN") ?? "the next review"}.`,
        type: ActivityType.FOLLOW_UP
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
    const existingHr = await prisma.hrContact.findFirst({
      where: {
        id: hrId,
        deletedAt: null
      },
      select: {
        companyId: true,
        fullName: true,
        remark: true,
        nextFollowUpDate: true,
        lastContactDate: true,
        email: true,
        phone: true,
        whatsapp: true,
        linkedIn: true,
        designation: true,
        city: true,
        priority: true,
        status: true
      }
    });

    const lastContactDate = toNullableDate(parsed.data.lastContactDate);
    const nextFollowUpDate = toNullableDate(parsed.data.nextFollowUpDate);
    const remark = toNullableString(parsed.data.remark);

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
        remark,
        priority: parsed.data.priority,
        lastContactDate,
        nextFollowUpDate,
        status: parsed.data.status
      }
    });

    const hasCoreChanges =
      existingHr?.companyId !== parsed.data.companyId ||
      existingHr?.fullName !== parsed.data.fullName ||
      existingHr?.designation !== parsed.data.designation ||
      existingHr?.phone !== parsed.data.phone ||
      existingHr?.email !== parsed.data.email ||
      existingHr?.whatsapp !== toNullableString(parsed.data.whatsapp) ||
      existingHr?.linkedIn !== toNullableString(parsed.data.linkedIn) ||
      existingHr?.city !== parsed.data.city ||
      existingHr?.priority !== parsed.data.priority ||
      existingHr?.status !== parsed.data.status ||
      existingHr?.lastContactDate?.getTime() !== lastContactDate?.getTime();

    if (hasCoreChanges) {
      await logHrActivity({
        companyId: hrContact.companyId,
        hrContactId: hrContact.id,
        title: "HR updated",
        description: `${hrContact.fullName} contact details were updated.`,
        type: ActivityType.HR
      });
    }

    const remarkChanged = existingHr?.remark !== remark;

    if (remarkChanged) {
      await logHrActivity({
        companyId: hrContact.companyId,
        hrContactId: hrContact.id,
        title: remark ? "Remark updated" : "Remark cleared",
        description: remark
          ? `Remark changed to: ${remark}`
          : `${hrContact.fullName}'s remark was cleared.`,
        type: ActivityType.NOTE
      });
    }

    const nextFollowUpChanged =
      nextFollowUpDate?.getTime() !== existingHr?.nextFollowUpDate?.getTime();
    const shouldSyncFollowUp =
      nextFollowUpChanged || (remarkChanged && nextFollowUpDate !== null);

    if (shouldSyncFollowUp) {
      const followUpResult = await syncFollowUpForHr({
        companyId: hrContact.companyId,
        hrContactId: hrContact.id,
        fullName: hrContact.fullName,
        nextFollowUpDate,
        remark
      });

      if (followUpResult.action === "created") {
        await logHrActivity({
          companyId: hrContact.companyId,
          hrContactId: hrContact.id,
          title: "Follow-up scheduled",
          description: nextFollowUpDate
            ? `Follow-up scheduled for ${nextFollowUpDate.toLocaleDateString("en-IN")}.`
            : "Follow-up schedule was cleared.",
          type: ActivityType.FOLLOW_UP
        });
      }

      if (followUpResult.action === "updated") {
        await logHrActivity({
          companyId: hrContact.companyId,
          hrContactId: hrContact.id,
          title: "Follow-up updated",
          description: nextFollowUpDate
            ? `Follow-up moved to ${nextFollowUpDate.toLocaleDateString("en-IN")}.`
            : "Follow-up schedule was cleared.",
          type: ActivityType.FOLLOW_UP
        });
      }

      if (followUpResult.action === "cancelled") {
        await logHrActivity({
          companyId: hrContact.companyId,
          hrContactId: hrContact.id,
          title: "Follow-up cleared",
          description: `${hrContact.fullName}'s pending follow-up was cancelled.`,
          type: ActivityType.FOLLOW_UP
        });
      }
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
  const hrContact = await prisma.hrContact.findFirst({
    where: {
      id: hrId,
      deletedAt: null
    },
    select: {
      id: true,
      companyId: true,
      fullName: true
    }
  });

  if (!hrContact) {
    redirect("/dashboard/hr?toast=hr-missing");
  }

  await logHrActivity({
    companyId: hrContact.companyId,
    hrContactId: hrContact.id,
    title: "HR deleted",
    description: `${hrContact.fullName} was removed from the HR pipeline.`,
    type: ActivityType.HR
  });

  await prisma.hrContact.update({
    where: { id: hrId },
    data: {
      deletedAt: new Date()
    }
  });

  await revalidateHrPages();
  redirect("/dashboard/hr?toast=hr-deleted");
}
