import { EMAIL_TEMPLATE_LABELS } from "@/lib/email/constants";

export type EmailRenderContext = {
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  companyName: string;
  hrName: string;
  signature: string;
  currentDate: string;
};

function replacePlaceholders(input: string, context: EmailRenderContext) {
  return input.replace(/\{\{(\w+)\}\}/g, (match, key: keyof EmailRenderContext) => {
    const value = context[key];
    return typeof value === "string" ? value : match;
  });
}

export function renderEmailTemplate(
  subject: string,
  body: string,
  context: EmailRenderContext
) {
  return {
    subject: replacePlaceholders(subject, context).trim(),
    body: replacePlaceholders(body, context).trim()
  };
}

export function getTemplateLabel(key: keyof typeof EMAIL_TEMPLATE_LABELS) {
  return EMAIL_TEMPLATE_LABELS[key];
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function bodyToHtml(body: string) {
  return escapeHtml(body)
    .split("\n")
    .map((line) => (line.trim().length === 0 ? "<br />" : line))
    .join("\n");
}

export function buildEmailHtml({
  subject,
  body,
  senderName,
  recipientName,
  recipientEmail,
  companyName,
  hrName
}: {
  subject: string;
  body: string;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  companyName: string;
  hrName: string;
}) {
  const renderedBody = bodyToHtml(body);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7fb;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="border-radius:24px;background:#ffffff;border:1px solid #e2e8f0;overflow:hidden;">
        <div style="padding:28px 28px 16px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#fff7ed,#ffffff);">
          <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#b45309;font-weight:700;">Placement CRM</div>
          <h1 style="margin:12px 0 0;font-size:24px;line-height:1.3;">${escapeHtml(subject)}</h1>
        </div>
        <div style="padding:28px;font-size:15px;line-height:1.8;">
          <p style="margin:0 0 18px;color:#475569;">
            Recipient: <strong>${escapeHtml(recipientName)}</strong> (${escapeHtml(
              recipientEmail
            )})<br />
            Company: <strong>${escapeHtml(companyName || "Not linked")}</strong><br />
            HR Contact: <strong>${escapeHtml(hrName || "Not linked")}</strong><br />
            Sender: <strong>${escapeHtml(senderName)}</strong>
          </p>
          <div style="white-space:pre-wrap;">${renderedBody}</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
