"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import type { VacancyPriority, VacancyStatus } from "@prisma/client";
import {
  initialVacancyFormState,
  type VacancyFormState
} from "@/app/(app)/dashboard/vacancies/actions";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VACANCY_PRIORITIES, VACANCY_STATUSES } from "@/lib/vacancy/constants";
import {
  formatVacancyPriority,
  formatVacancyStatus
} from "@/lib/vacancy/format";
import type { VacancyFormInput } from "@/lib/vacancy/validators";

type CompanyOption = {
  id: string;
  name: string;
  city: string;
};

type RecruiterOption = {
  id: string;
  fullName: string;
  designation: string;
  company: {
    id: string;
    name: string;
    city: string;
  };
};

type VacancyFormProps = {
  action: (state: VacancyFormState, formData: FormData) => Promise<VacancyFormState>;
  submitLabel: string;
  companies: CompanyOption[];
  recruiters: RecruiterOption[];
  initialValues?: Partial<VacancyFormInput>;
};

export function VacancyForm({
  action,
  submitLabel,
  companies,
  recruiters,
  initialValues
}: VacancyFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialVacancyFormState
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="title" label="Job Title" error={state.fieldErrors.title?.[0]}>
          <Input
            id="title"
            name="title"
            defaultValue={initialValues?.title ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="companyId" label="Company" error={state.fieldErrors.companyId?.[0]}>
          <Select
            id="companyId"
            name="companyId"
            defaultValue={initialValues?.companyId ?? ""}
            disabled={isPending}
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} - {company.city}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="experience" label="Experience" error={state.fieldErrors.experience?.[0]}>
          <Input
            id="experience"
            name="experience"
            placeholder="0-2 years"
            defaultValue={initialValues?.experience ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="location" label="Location" error={state.fieldErrors.location?.[0]}>
          <Input
            id="location"
            name="location"
            defaultValue={initialValues?.location ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="technology" label="Technology" error={state.fieldErrors.technology?.[0]}>
          <Input
            id="technology"
            name="technology"
            placeholder="React, Node.js, SQL"
            defaultValue={initialValues?.technology ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="compensationLpa" label="Salary (LPA)" error={state.fieldErrors.compensationLpa?.[0]}>
          <Input
            id="compensationLpa"
            name="compensationLpa"
            type="number"
            min="0.1"
            step="0.1"
            defaultValue={initialValues?.compensationLpa ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="openings" label="Openings" error={state.fieldErrors.openings?.[0]}>
          <Input
            id="openings"
            name="openings"
            type="number"
            min="1"
            step="1"
            defaultValue={initialValues?.openings ?? 1}
            disabled={isPending}
          />
        </FormField>

        <FormField id="priority" label="Priority" error={state.fieldErrors.priority?.[0]}>
          <Select
            id="priority"
            name="priority"
            defaultValue={(initialValues?.priority as VacancyPriority) ?? "MEDIUM"}
            disabled={isPending}
          >
            {VACANCY_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {formatVacancyPriority(priority)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="status" label="Status" error={state.fieldErrors.status?.[0]}>
          <Select
            id="status"
            name="status"
            defaultValue={(initialValues?.status as VacancyStatus) ?? "OPEN"}
            disabled={isPending}
          >
            {VACANCY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatVacancyStatus(status)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id="assignedRecruiterId"
          label="Assigned Recruiter"
          error={state.fieldErrors.assignedRecruiterId?.[0]}
          hint="Optional. The recruiter should belong to the chosen company."
        >
          <Select
            id="assignedRecruiterId"
            name="assignedRecruiterId"
            defaultValue={initialValues?.assignedRecruiterId ?? ""}
            disabled={isPending}
          >
            <option value="">Unassigned</option>
            {recruiters.map((recruiter) => (
              <option key={recruiter.id} value={recruiter.id}>
                {recruiter.fullName} - {recruiter.company.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id="skills" label="Skills" error={state.fieldErrors.skills?.[0]}>
        <Textarea
          id="skills"
          name="skills"
          placeholder="TypeScript, problem solving, communication"
          defaultValue={initialValues?.skills ?? ""}
          disabled={isPending}
        />
      </FormField>

      <FormField id="remark" label="Remark" error={state.fieldErrors.remark?.[0]}>
        <Textarea
          id="remark"
          name="remark"
          defaultValue={initialValues?.remark ?? ""}
          disabled={isPending}
        />
      </FormField>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
