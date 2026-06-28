"use server";

import { redirect } from "next/navigation";
import { ensureDefaultAdminUser } from "@/lib/auth/bootstrap";
import { createSession } from "@/lib/auth/session";
import { findUserByUsername } from "@/lib/auth/queries";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validators/auth";

export type LoginActionState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<"username" | "password", string[]>>;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await ensureDefaultAdminUser();
  const user = await findUserByUsername(parsed.data.username);

  if (!user) {
    return {
      success: false,
      message: "Invalid username or password.",
      fieldErrors: {}
    };
  }

  const isPasswordValid = await verifyPassword(
    parsed.data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid username or password.",
      fieldErrors: {}
    };
  }

  await createSession(user.id);
  redirect("/dashboard?toast=welcome");
}
