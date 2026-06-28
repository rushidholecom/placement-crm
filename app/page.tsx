import { redirect } from "next/navigation";
import { ensureDefaultAdminUser } from "@/lib/auth/bootstrap";
import { getCurrentSession } from "@/lib/auth/session";

export default async function HomePage() {
  await ensureDefaultAdminUser();
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
