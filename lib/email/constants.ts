export const EMAIL_TEMPLATE_KEYS = [
  "INTRODUCTION",
  "FOLLOW_UP",
  "REMINDER",
  "CANDIDATE_SHARED",
  "THANK_YOU"
] as const;

export const EMAIL_TEMPLATE_LABELS: Record<(typeof EMAIL_TEMPLATE_KEYS)[number], string> = {
  INTRODUCTION: "Introduction",
  FOLLOW_UP: "Follow-up",
  REMINDER: "Reminder",
  CANDIDATE_SHARED: "Candidate Shared",
  THANK_YOU: "Thank You"
};

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    key: "INTRODUCTION",
    label: EMAIL_TEMPLATE_LABELS.INTRODUCTION,
    subject: "Introduction from {{senderName}}",
    body:
      "Hi {{recipientName}},\n\n" +
      "I hope you are doing well. I am reaching out from Placement CRM to introduce our student pipeline and support for your hiring plans at {{companyName}}.\n\n" +
      "If you are open to it, I would love to schedule a short conversation to understand your current requirements and share the most relevant profiles.\n\n" +
      "{{signature}}"
  },
  {
    key: "FOLLOW_UP",
    label: EMAIL_TEMPLATE_LABELS.FOLLOW_UP,
    subject: "Follow-up on our last conversation",
    body:
      "Hi {{recipientName}},\n\n" +
      "I wanted to follow up on our previous discussion regarding {{companyName}}.\n\n" +
      "Please let me know if there are any updates from your side or if you would like me to share additional candidate details.\n\n" +
      "{{signature}}"
  },
  {
    key: "REMINDER",
    label: EMAIL_TEMPLATE_LABELS.REMINDER,
    subject: "Gentle reminder regarding the pending update",
    body:
      "Hi {{recipientName}},\n\n" +
      "This is a gentle reminder about the pending update we discussed for {{companyName}}.\n\n" +
      "Whenever you have a moment, please share the next step so we can keep the process moving smoothly.\n\n" +
      "{{signature}}"
  },
  {
    key: "CANDIDATE_SHARED",
    label: EMAIL_TEMPLATE_LABELS.CANDIDATE_SHARED,
    subject: "Candidate profiles shared for review",
    body:
      "Hi {{recipientName}},\n\n" +
      "The candidate profiles for {{companyName}} have been shared for your review.\n\n" +
      "Please let me know if you would like us to arrange interviews, share more profiles, or clarify any requirement.\n\n" +
      "{{signature}}"
  },
  {
    key: "THANK_YOU",
    label: EMAIL_TEMPLATE_LABELS.THANK_YOU,
    subject: "Thank you for your time",
    body:
      "Hi {{recipientName}},\n\n" +
      "Thank you for taking the time to connect with us today.\n\n" +
      "We appreciate your support and look forward to continuing the conversation with {{companyName}}.\n\n" +
      "{{signature}}"
  }
] as const;

export const EMAIL_LOG_PAGE_SIZE = 8;
