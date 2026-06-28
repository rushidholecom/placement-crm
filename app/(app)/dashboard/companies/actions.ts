"use server";

import { ActivityType, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { companyFormSchema } from "@/lib/company/validators";
import { revalidateCompanyPages } from "@/lib/company/revalidate";

export type CompanyFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<
    Record<
      | "name"
      | "website"
      | "industry"
      | "companySize"
      | "city"
      | "address"
      | "notes"
      | "status",
      string[]
    >
  >;
};

export const initialCompanyFormState: CompanyFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};

function normalizeCompanyFormData(formData: FormData) {
  return companyFormSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    companySize: formData.get("companySize"),
    city: formData.get("city"),
    address: formData.get("address"),
    notes: formData.get("notes"),
    status: formData.get("status")
  });
}

function getConflictMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "A company with the same name and city already exists.";
  }

  return "Unable to save the company right now. Please try again.";
}

export async function createCompanyAction(
  _previousState: CompanyFormState,
  formData: FormData
): Promise<CompanyFormState> {
  const parsed = normalizeCompanyFormData(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const company = await prisma.company.create({
      data: {
        ...parsed.data,
        website: parsed.data.website || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null
      }
    });

    await prisma.activity.create({
      data: {
        companyId: company.id,
        title: "Company created",
        description: `${company.name} was added to the company pipeline.`,
        type: ActivityType.NOTE
      }
    });

    await revalidateCompanyPages();
  } catch (error) {
    return {
      success: false,
      message: getConflictMessage(error),
      fieldErrors: {}
    };
  }

  redirect("/dashboard/companies?toast=company-created");
}

export async function updateCompanyAction(
  companyId: string,
  _previousState: CompanyFormState,
  formData: FormData
): Promise<CompanyFormState> {
  const parsed = normalizeCompanyFormData(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...parsed.data,
        website: parsed.data.website || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null
      }
    });

    await prisma.activity.create({
      data: {
        companyId: company.id,
        title: "Company updated",
        description: `${company.name} company details were updated.`,
        type: ActivityType.NOTE
      }
    });

    await revalidateCompanyPages();
  } catch (error) {
    return {
      success: false,
      message: getConflictMessage(error),
      fieldErrors: {}
    };
  }

  redirect(`/dashboard/companies/${companyId}?toast=company-updated`);
}

export async function deleteCompanyAction(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true }
  });

  if (!company) {
    redirect("/dashboard/companies?toast=company-missing");
  }

  await prisma.company.delete({
    where: { id: companyId }
  });

  await revalidateCompanyPages();
  redirect("/dashboard/companies?toast=company-deleted");
}
