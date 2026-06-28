"use server";

import { revalidatePath } from "next/cache";

export async function revalidateReminderSurfaces() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/hr");
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard/vacancies");
}
