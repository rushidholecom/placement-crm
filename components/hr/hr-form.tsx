"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import type { HrPriority, HrStatus } from "@prisma/client";
import { initialHrFormState, type HrFormState } from "@/app/(app)/dashboard/hr/actions";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HR_PRIORITIES, HR_STATUSES } from "@/lib/hr/constants";
import { formatHrPriority, formatHrStatus } from "@/lib/hr/format";
import type { HrFormInput } from "@/lib/hr/validators";

type CompanyOption = {
  id: string;
  name: string;
  city: string;
};

type HrFormProps = {
  action: (state: HrFormState, formData: FormData) => Promise<HrFormState>;
  submitLabel: string;
  companies: CompanyOption[];
  initialValues?: Partial<
    Omit<HrFormInput, "lastContactDate" | "nextFollowUpDate"> & {
      lastContactDate: string | Date | null;
      nextFollowUpDate: string | Date | null;
    }
  >;
};

function formatInputDate(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function HrForm({
  action,
  submitLabel,
  companies,
  initialValues
}: HrFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialHrFormState
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="fullName" label="HR Name" error={state.fieldErrors.fullName?.[0]}>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={initialValues?.fullName ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="designation" label="Designation" error={state.fieldErrors.designation?.[0]}>
          <Input
            id="designation"
            name="designation"
            defaultValue={initialValues?.designation ?? ""}
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

        <FormField id="city" label="City" error={state.fieldErrors.city?.[0]}>
          <Input
            id="city"
            name="city"
            defaultValue={initialValues?.city ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="email" label="Email" error={state.fieldErrors.email?.[0]}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialValues?.email ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="phone" label="Phone" error={state.fieldErrors.phone?.[0]}>
          <Input
            id="phone"
            name="phone"
            defaultValue={initialValues?.phone ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="whatsapp" label="WhatsApp" error={state.fieldErrors.whatsapp?.[0]}>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={initialValues?.whatsapp ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="linkedIn" label="LinkedIn" error={state.fieldErrors.linkedIn?.[0]}>
          <Input
            id="linkedIn"
            name="linkedIn"
            placeholder="https://linkedin.com/in/contact"
            defaultValue={initialValues?.linkedIn ?? ""}
            disabled={isPending}
          />
        </FormField>

        <FormField id="priority" label="Priority" error={state.fieldErrors.priority?.[0]}>
          <Select
            id="priority"
            name="priority"
            defaultValue={(initialValues?.priority as HrPriority) ?? "MEDIUM"}
            disabled={isPending}
          >
            {HR_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {formatHrPriority(priority)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="status" label="Status" error={state.fieldErrors.status?.[0]}>
          <Select
            id="status"
            name="status"
            defaultValue={(initialValues?.status as HrStatus) ?? "ACTIVE"}
            disabled={isPending}
          >
            {HR_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatHrStatus(status)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id="lastContactDate"
          label="Last Contact Date"
          error={state.fieldErrors.lastContactDate?.[0]}
        >
          <Input
            id="lastContactDate"
            name="lastContactDate"
            type="date"
            defaultValue={formatInputDate(initialValues?.lastContactDate)}
            disabled={isPending}
          />
        </FormField>

        <FormField
          id="nextFollowUpDate"
          label="Next Follow-up Date"
          error={state.fieldErrors.nextFollowUpDate?.[0]}
        >
          <Input
            id="nextFollowUpDate"
            name="nextFollowUpDate"
            type="date"
            defaultValue={formatInputDate(initialValues?.nextFollowUpDate)}
            disabled={isPending}
          />
        </FormField>
      </div>

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
