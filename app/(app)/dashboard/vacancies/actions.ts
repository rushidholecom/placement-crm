"use server";

import { ActivityType } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidateVacancyPages } from "@/lib/vacancy/revalidate";
import { vacancyFormSchema } from "@/lib/vacancy/validators";

type Field = keyof typeof vacancyFormSchema.shape;
export type VacancyFormState = { success: boolean; message: string; fieldErrors: Partial<Record<Field, string[]>> };
export const initialVacancyFormState: VacancyFormState = { success: false, message: "", fieldErrors: {} };

function parse(formData: FormData) {
  return vacancyFormSchema.safeParse({
    title: formData.get("title"),
    companyId: formData.get("companyId"),
    experience: formData.get("experience"),
    location: formData.get("location"),
    skills: formData.get("skills"),
    technology: formData.get("technology"),
    compensationLpa: formData.get("compensationLpa"),
    openings: formData.get("openings"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    assignedRecruiterId: formData.get("assignedRecruiterId"),
    remark: formData.get("remark")
  });
}

function data(input: ReturnType<typeof vacancyFormSchema.parse>) {
  return {
    ...input,
    technology: input.technology || null,
    assignedRecruiterId: input.assignedRecruiterId || null,
    remark: input.remark || null
  };
}

async function validateReferences({
  companyId,
  assignedRecruiterId
}: {
  companyId: string;
  assignedRecruiterId: string | null;
}) {
  const fieldErrors: VacancyFormState["fieldErrors"] = {};

  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!company) {
    fieldErrors.companyId = ["Selected company was not found."];
  }

  if (assignedRecruiterId) {
    const recruiter = await prisma.hrContact.findFirst({
      where: {
        id: assignedRecruiterId,
        deletedAt: null
      },
      select: { id: true, fullName: true, companyId: true }
    });

    if (!recruiter) {
      fieldErrors.assignedRecruiterId = ["Selected recruiter was not found."];
    } else if (recruiter.companyId !== companyId) {
      fieldErrors.assignedRecruiterId = [
        "Selected recruiter must belong to the chosen company."
      ];
    }
  }

  return fieldErrors;
}

export async function createVacancyAction(_state: VacancyFormState, formData: FormData): Promise<VacancyFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { success: false, message: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  const referenceErrors = await validateReferences({
    companyId: parsed.data.companyId,
    assignedRecruiterId: parsed.data.assignedRecruiterId || null
  });

  if (Object.values(referenceErrors).some((errors) => errors && errors.length > 0)) {
    return {
      success: false,
      message: "Please review the highlighted references.",
      fieldErrors: referenceErrors
    };
  }

  const vacancy = await prisma.vacancy.create({ data: data(parsed.data) });
  await prisma.activity.create({
    data: { companyId: vacancy.companyId, hrContactId: vacancy.assignedRecruiterId, title: "Vacancy created", description: `${vacancy.title} was added.`, type: ActivityType.VACANCY }
  });
  await revalidateVacancyPages();
  redirect("/dashboard/vacancies?toast=vacancy-created");
}

export async function updateVacancyAction(vacancyId: string, _state: VacancyFormState, formData: FormData): Promise<VacancyFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { success: false, message: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  const referenceErrors = await validateReferences({
    companyId: parsed.data.companyId,
    assignedRecruiterId: parsed.data.assignedRecruiterId || null
  });

  if (Object.values(referenceErrors).some((errors) => errors && errors.length > 0)) {
    return {
      success: false,
      message: "Please review the highlighted references.",
      fieldErrors: referenceErrors
    };
  }

  const vacancy = await prisma.vacancy.update({ where: { id: vacancyId }, data: data(parsed.data) });
  await prisma.activity.create({
    data: { companyId: vacancy.companyId, hrContactId: vacancy.assignedRecruiterId, title: "Vacancy updated", description: `${vacancy.title} details were updated.`, type: ActivityType.VACANCY }
  });
  await revalidateVacancyPages();
  redirect(`/dashboard/vacancies/${vacancyId}?toast=vacancy-updated`);
}

export async function deleteVacancyAction(vacancyId: string) {
  const vacancy = await prisma.vacancy.findFirst({
    where: {
      id: vacancyId,
      deletedAt: null
    },
    select: {
      id: true,
      companyId: true,
      assignedRecruiterId: true,
      title: true
    }
  });
  if (!vacancy) redirect("/dashboard/vacancies?toast=vacancy-missing");
  await prisma.activity.create({
    data: {
      companyId: vacancy.companyId,
      hrContactId: vacancy.assignedRecruiterId,
      title: "Vacancy deleted",
      description: `${vacancy.title} was removed from the pipeline.`,
      type: ActivityType.VACANCY
    }
  });
  await prisma.vacancy.update({
    where: { id: vacancyId },
    data: {
      deletedAt: new Date()
    }
  });
  await revalidateVacancyPages();
  redirect("/dashboard/vacancies?toast=vacancy-deleted");
}
