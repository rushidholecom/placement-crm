export type HrFieldName =
  | "fullName"
  | "designation"
  | "companyId"
  | "phone"
  | "email"
  | "whatsapp"
  | "linkedIn"
  | "city"
  | "remark"
  | "priority"
  | "lastContactDate"
  | "nextFollowUpDate"
  | "status";

export type HrFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<HrFieldName, string[]>>;
};

export const initialHrFormState: HrFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};
