"use client";

import { useActionState, useEffect, useState } from "react";
import { LoaderCircle, Mail, Send } from "lucide-react";
import { initialEmailSendFormState, sendEmailAction } from "@/app/(app)/dashboard/email/actions";
import { FormField } from "@/components/form/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { renderEmailTemplate } from "@/lib/email/render";

type Template = {
  key: string;
  label: string;
  subject: string;
  body: string;
};

type CompanyOption = {
  id: string;
  name: string;
  city: string;
};

type HrOption = {
  id: string;
  fullName: string;
  email: string;
  company: {
    id: string;
    name: string;
  };
};

type EmailSendFormProps = {
  templates: Template[];
  companies: CompanyOption[];
  hrContacts: HrOption[];
  senderName: string;
  signature: string;
};

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

export function EmailSendForm({
  templates,
  companies,
  hrContacts,
  senderName,
  signature
}: EmailSendFormProps) {
  const [state, formAction, isPending] = useActionState(
    sendEmailAction,
    initialEmailSendFormState
  );
  const [templateKey, setTemplateKey] = useState<string>(templates[0]?.key ?? "INTRODUCTION");
  const [companyId, setCompanyId] = useState("");
  const [hrContactId, setHrContactId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(templates[0]?.subject ?? "");
  const [body, setBody] = useState(templates[0]?.body ?? "");

  const selectedTemplate = templates.find((template) => template.key === templateKey) ?? templates[0];
  const selectedCompany = companies.find((company) => company.id === companyId);
  const selectedHr = hrContacts.find((contact) => contact.id === hrContactId);
  const previewContext = {
    senderName,
    recipientName: recipientName || "Recipient",
    recipientEmail: recipientEmail || "recipient@example.com",
    companyName: selectedHr?.company.name || selectedCompany?.name || "your company",
    hrName: selectedHr?.fullName || "",
    signature: signature || `Regards,\n${senderName}`,
    currentDate: new Date().toLocaleDateString("en-IN")
  };
  const preview = renderEmailTemplate(subject || selectedTemplate?.subject || "", body || selectedTemplate?.body || "", previewContext);

  useEffect(() => {
    const template = templates.find((item) => item.key === templateKey);

    if (!template) {
      return;
    }

    setSubject(template.subject);
    setBody(template.body);
  }, [templateKey, templates]);

  useEffect(() => {
    const hr = hrContacts.find((contact) => contact.id === hrContactId);

    if (!hr) {
      return;
    }

    setRecipientName(hr.fullName);
    setRecipientEmail(hr.email);
    setCompanyId(hr.company.id);
  }, [hrContactId, hrContacts]);

  return (
    <Card className="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
      <CardHeader>
        <CardTitle>Send email</CardTitle>
        <CardDescription>
          Choose a template, preview the message, then send it with timeline logging.
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
            <FormField id="templateKey" label="Template" error={state.fieldErrors.templateKey?.[0]}>
              <Select
                id="templateKey"
                name="templateKey"
                value={templateKey}
                onChange={(event) => setTemplateKey(event.target.value)}
                disabled={isPending}
              >
                {templates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField id="companyId" label="Company" error={state.fieldErrors.companyId?.[0]}>
              <Select
                id="companyId"
                name="companyId"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
                disabled={isPending}
              >
                <option value="">No company linked</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} - {company.city}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              id="hrContactId"
              label="HR Contact"
              error={state.fieldErrors.hrContactId?.[0]}
            >
              <Select
                id="hrContactId"
                name="hrContactId"
                value={hrContactId}
                onChange={(event) => setHrContactId(event.target.value)}
                disabled={isPending}
              >
                <option value="">No HR contact linked</option>
                {hrContacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.fullName} - {contact.email}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              id="recipientName"
              label="Recipient Name"
              error={state.fieldErrors.recipientName?.[0]}
            >
              <Input
                id="recipientName"
                name="recipientName"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                disabled={isPending}
              />
            </FormField>

            <FormField
              id="recipientEmail"
              label="Recipient Email"
              error={state.fieldErrors.recipientEmail?.[0]}
            >
              <Input
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                disabled={isPending}
              />
            </FormField>

            <FormField id="cc" label="CC" error={state.fieldErrors.cc?.[0]} hint="Comma-separated emails.">
              <Input
                id="cc"
                name="cc"
                value={cc}
                onChange={(event) => setCc(event.target.value)}
                disabled={isPending}
              />
            </FormField>

            <FormField id="bcc" label="BCC" error={state.fieldErrors.bcc?.[0]} hint="Comma-separated emails.">
              <Input
                id="bcc"
                name="bcc"
                value={bcc}
                onChange={(event) => setBcc(event.target.value)}
                disabled={isPending}
              />
            </FormField>
          </div>

          <div className="grid gap-5">
            <FormField id="subject" label="Subject" error={state.fieldErrors.subject?.[0]}>
              <Input
                id="subject"
                name="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                disabled={isPending}
              />
            </FormField>

            <FormField id="body" label="Body" error={state.fieldErrors.body?.[0]}>
              <Textarea
                id="body"
                name="body"
                className="min-h-56"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                disabled={isPending}
              />
            </FormField>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                    Preview
                  </p>
                  <p className="text-xs text-muted-foreground">
                    What the recipient will see before the email is sent.
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-200 bg-white text-amber-700 dark:border-amber-500/20 dark:bg-slate-900 dark:text-amber-300">
                  <Mail className="h-3.5 w-3.5" />
                  Live preview
                </Badge>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {preview.subject}
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="font-medium text-slate-950 dark:text-slate-50">To:</span>{" "}
                    {recipientName || "Recipient"} &lt;{recipientEmail || "recipient@example.com"}&gt;
                  </p>
                  <p>
                    <span className="font-medium text-slate-950 dark:text-slate-50">CC:</span>{" "}
                    {splitList(cc) || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-950 dark:text-slate-50">BCC:</span>{" "}
                    {splitList(bcc) || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-950 dark:text-slate-50">Company:</span>{" "}
                    {selectedCompany?.name || selectedHr?.company.name || "Not linked"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-950 dark:text-slate-50">HR:</span>{" "}
                    {selectedHr?.fullName || "Not linked"}
                  </p>
                </div>
                <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  {preview.body}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/70">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                    Timeline logging
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Successful and failed attempts are written to the activity feed so the company and HR timelines stay in sync.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                    Activity record
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Email sends are stored with the selected template, recipient, and delivery result.
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send email
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
