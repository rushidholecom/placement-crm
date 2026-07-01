export type CompanyFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<
    Record<
      | "name"
      | "website"
      | "industry"
      | "companySize"
      | "city"
      | "address"
      | "notes"
      | "status",
      string[]
    >
  >;
};

export const initialCompanyFormState: CompanyFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};
