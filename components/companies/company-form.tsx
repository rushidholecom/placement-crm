"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  COMPANY_SIZES,
  COMPANY_STATUSES
} from "@/lib/company/constants";
import {
  formatCompanySize,
  formatCompanyStatus
} from "@/lib/company/format";
import type { CompanyFormInput } from "@/lib/company/validators";
import type {
  CompanyFormState
} from "@/app/(app)/dashboard/companies/actions";
import { initialCompanyFormState } from "@/app/(app)/dashboard/companies/actions";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CompanyFormProps = {
  action: (
    state: CompanyFormState,
    formData: FormData
  ) => Promise<CompanyFormState>;
  submitLabel: string;
  initialValues?: Partial<CompanyFormInput>;
};

export function CompanyForm({
  action,
  submitLabel,
  initialValues
}: CompanyFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialCompanyFormState
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="name" label="Company Name" error={state.fieldErrors.name?.[0]}>
          <Input
            id="name"
            name="name"
            defaultValue={initialValues?.name ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="website" label="Website" error={state.fieldErrors.website?.[0]}>
          <Input
            id="website"
            name="website"
            placeholder="https://example.com"
            defaultValue={initialValues?.website ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="industry" label="Industry" error={state.fieldErrors.industry?.[0]}>
          <Input
            id="industry"
            name="industry"
            defaultValue={initialValues?.industry ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField
          id="companySize"
          label="Company Size"
          error={state.fieldErrors.companySize?.[0]}
        >
          <Select
            id="companySize"
            name="companySize"
            defaultValue={initialValues?.companySize ?? "MID_MARKET"}
            disabled={isPending}
          >
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {formatCompanySize(size)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="city" label="City" error={state.fieldErrors.city?.[0]}>
          <Input
            id="city"
            name="city"
            defaultValue={initialValues?.city ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="status" label="Status" error={state.fieldErrors.status?.[0]}>
          <Select
            id="status"
            name="status"
            defaultValue={initialValues?.status ?? "PROSPECT"}
            disabled={isPending}
          >
            {COMPANY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatCompanyStatus(status)}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id="address" label="Address" error={state.fieldErrors.address?.[0]}>
        <Textarea
          id="address"
          name="address"
          defaultValue={initialValues?.address ?? ""}
          disabled={isPending}
        />
      </FormField>

      <FormField id="notes" label="Notes" error={state.fieldErrors.notes?.[0]}>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initialValues?.notes ?? ""}
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
