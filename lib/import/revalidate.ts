"use server";

import { revalidatePath } from "next/cache";

export async function revalidateImportSurfaces() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/import");
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard/hr");
}
