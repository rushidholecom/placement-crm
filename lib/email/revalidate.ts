"use server";

import { revalidatePath } from "next/cache";

export async function revalidateEmailPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/email");
  revalidatePath("/dashboard/hr");
  revalidatePath("/dashboard/companies");
}
