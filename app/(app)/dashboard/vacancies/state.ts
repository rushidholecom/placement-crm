import { vacancyFormSchema } from "@/lib/vacancy/validators";

export type VacancyFormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<keyof typeof vacancyFormSchema.shape, string[]>>;
};

export const initialVacancyFormState: VacancyFormState = {
  success: false,
  message: "",
  fieldErrors: {}
};
