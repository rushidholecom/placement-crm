"use server";

import { revalidatePath } from "next/cache";

export async function revalidateCompanyPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/companies");
}
