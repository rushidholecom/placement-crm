export const HR_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const HR_STATUSES = [
  "ACTIVE",
  "FOLLOW_UP",
  "DO_NOT_CONTACT",
  "INACTIVE"
] as const;

export const HR_SORT_FIELDS = [
  "fullName",
  "designation",
  "city",
  "priority",
  "status",
  "nextFollowUpDate",
  "createdAt"
] as const;

export const HR_PAGE_SIZE = 10;
