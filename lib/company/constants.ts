export const COMPANY_STATUSES = [
  "ACTIVE",
  "PROSPECT",
  "ON_HOLD",
  "INACTIVE"
] as const;

export const COMPANY_SIZES = [
  "STARTUP",
  "SMALL",
  "MID_MARKET",
  "ENTERPRISE"
] as const;

export const COMPANY_SORT_FIELDS = [
  "name",
  "industry",
  "city",
  "status",
  "createdAt"
] as const;

export const COMPANIES_PAGE_SIZE = 10;
