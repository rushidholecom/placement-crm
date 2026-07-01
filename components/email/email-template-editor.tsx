"use client";

import { useActionState } from "react";
import { LoaderCircle, PencilLine } from "lucide-react";
import { saveEmailTemplateAction } from "@/app/(app)/dashboard/email/actions";
import { initialEmailTemplateFormState } from "@/app/(app)/dashboard/email/state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/form/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type EmailTemplate = {
  key: string;
  label: string;
  subject: string;
  body: string;
};

type EmailTemplateEditorProps = {
  templates: EmailTemplate[];
};

function EmailTemplateCard({ template }: { template: EmailTemplate }) {
  const [state, formAction, isPending] = useActionState(
    saveEmailTemplateAction,
    initialEmailTemplateFormState
  );

  return (
    <Card className="border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/70">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            {template.label}
          </Badge>
          <PencilLine className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">{template.label}</CardTitle>
        <CardDescription>Update the subject and body for this default email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="key" value={template.key} />

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

          <FormField
            id={`subject-${template.key}`}
            label="Subject"
            error={state.fieldErrors.subject?.[0]}
          >
            <Input
              id={`subject-${template.key}`}
              name="subject"
              defaultValue={template.subject}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id={`body-${template.key}`}
            label="Body"
            error={state.fieldErrors.body?.[0]}
            hint="You can use {{senderName}}, {{recipientName}}, {{companyName}}, and {{signature}} placeholders."
          >
            <Textarea
              id={`body-${template.key}`}
              name="body"
              className="min-h-56"
              defaultValue={template.body}
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
              "Save template"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function EmailTemplateEditor({ templates }: EmailTemplateEditorProps) {
  return (
    <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <CardHeader>
        <CardTitle>Editable templates</CardTitle>
        <CardDescription>
          The default templates are ready to use and can be customized inline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 xl:grid-cols-2">
          {templates.map((template) => (
            <EmailTemplateCard key={template.key} template={template} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
