"use client";

import { useActionState } from "react";
import { LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { loginAction, type LoginActionState } from "@/app/(auth)/login/actions";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {
  success: false,
  message: "",
  fieldErrors: {}
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md border-amber-200/60 bg-white/90 dark:border-slate-800 dark:bg-slate-950/85">
      <CardHeader className="space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to access the placement operations dashboard.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                state.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              {state.message}
            </div>
          ) : null}
          <FormField
            id="username"
            label="Username"
            error={state.fieldErrors.username?.[0]}
          >
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
                autoComplete="username"
                className="pl-9"
                disabled={isPending}
              />
            </div>
          </FormField>

          <FormField
            id="password"
            label="Password"
            error={state.fieldErrors.password?.[0]}
            hint="Use the default admin credentials shown on the left to access the app initially."
          >
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="pl-9"
                disabled={isPending}
              />
            </div>
          </FormField>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
