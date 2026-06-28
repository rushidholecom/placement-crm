"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  initialEmailSettingsFormState,
  saveEmailSettingsAction
} from "@/app/(app)/dashboard/email/actions";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EmailSettings = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  signature: string;
};

type EmailSettingsFormProps = {
  settings: EmailSettings;
};

export function EmailSettingsForm({ settings }: EmailSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveEmailSettingsAction,
    initialEmailSettingsFormState
  );

  return (
    <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <CardHeader>
        <CardTitle>SMTP configuration</CardTitle>
        <CardDescription>
          Connect your mail server to send tracked emails directly from the CRM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.message ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                state.success
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="smtpHost"
              label="SMTP Host"
              error={state.fieldErrors.smtpHost?.[0]}
            >
              <Input
                id="smtpHost"
                name="smtpHost"
                defaultValue={settings.smtpHost}
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="smtpPort"
              label="SMTP Port"
              error={state.fieldErrors.smtpPort?.[0]}
            >
              <Input
                id="smtpPort"
                name="smtpPort"
                type="number"
                defaultValue={settings.smtpPort}
                disabled={isPending}
              />
            </FormField>

            <div className="space-y-2">
              <Label htmlFor="smtpSecure">Security</Label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                <input
                  id="smtpSecure"
                  name="smtpSecure"
                  type="checkbox"
                  defaultChecked={settings.smtpSecure}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-amber-500 dark:border-slate-700 dark:text-amber-400"
                />
                Use TLS / SSL
              </label>
              <p className="text-xs text-muted-foreground">
                Enable this for port 465 or any server that expects immediate TLS.
              </p>
            </div>

            <FormField
              id="fromName"
              label="From Name"
              error={state.fieldErrors.fromName?.[0]}
            >
              <Input
                id="fromName"
                name="fromName"
                defaultValue={settings.fromName}
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="fromEmail"
              label="From Email"
              error={state.fieldErrors.fromEmail?.[0]}
            >
              <Input
                id="fromEmail"
                name="fromEmail"
                type="email"
                defaultValue={settings.fromEmail}
                disabled={isPending}
              />
            </FormField>

            <FormField id="smtpUser" label="SMTP Username" error={state.fieldErrors.smtpUser?.[0]}>
              <Input
                id="smtpUser"
                name="smtpUser"
                defaultValue={settings.smtpUser}
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="smtpPassword"
              label="SMTP Password"
              error={state.fieldErrors.smtpPassword?.[0]}
              hint="Leave blank to keep the current password."
            >
              <Input
                id="smtpPassword"
                name="smtpPassword"
                type="password"
                defaultValue={settings.smtpPassword}
                disabled={isPending}
              />
            </FormField>

            <FormField id="replyTo" label="Reply-To" error={state.fieldErrors.replyTo?.[0]}>
              <Input
                id="replyTo"
                name="replyTo"
                type="email"
                defaultValue={settings.replyTo}
                disabled={isPending}
              />
            </FormField>
          </div>

          <FormField
            id="signature"
            label="Signature"
            error={state.fieldErrors.signature?.[0]}
            hint="Use a short signature such as 'Regards, Team Placement CRM'."
          >
            <Textarea
              id="signature"
              name="signature"
              defaultValue={settings.signature}
              disabled={isPending}
            />
          </FormField>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save SMTP"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
