export type SearchCompanyResult = {
  id: string;
  name: string;
  website: string | null;
  city: string;
  industry: string;
  remark: string | null;
  phone: string | null;
  email: string | null;
  nextFollowUp: string | null;
  href: string;
  editHref: string;
};

export type SearchHrResult = {
  id: string;
  fullName: string;
  designation: string;
  companyName: string;
  city: string;
  phone: string;
  email: string;
  linkedIn: string | null;
  remark: string | null;
  nextFollowUp: string | null;
  href: string;
  editHref: string;
};

export type SearchVacancyResult = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  technology: string | null;
  skills: string | null;
  phone: string | null;
  email: string | null;
  remark: string | null;
  nextFollowUp: string | null;
  href: string;
  editHref: string;
};

export type GlobalSearchResponse = {
  query: string;
  totalCount: number;
  companies: SearchCompanyResult[];
  hr: SearchHrResult[];
  vacancies: SearchVacancyResult[];
};
