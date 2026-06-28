"use server";

import { revalidatePath } from "next/cache";

export async function revalidateVacancyPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vacancies");
  revalidatePath("/dashboard/vacancies/[vacancyId]");
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard/companies/[companyId]");
  revalidatePath("/dashboard/hr");
}
