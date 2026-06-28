export const VACANCY_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const VACANCY_STATUSES = ["OPEN", "IN_PROGRESS", "ON_HOLD", "CLOSED"] as const;
export const VACANCY_SORT_FIELDS = [
  "title",
  "company",
  "location",
  "priority",
  "status",
  "createdAt",
  "updatedAt"
] as const;
export const VACANCIES_PAGE_SIZE = 10;
