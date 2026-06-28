"use server";

import { revalidatePath } from "next/cache";

export async function revalidateHrPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/hr");
  revalidatePath("/dashboard/companies");
}
