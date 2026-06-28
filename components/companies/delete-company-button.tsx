"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteCompanyButtonProps = {
  action: () => void;
  companyName: string;
  label?: string;
};

export function DeleteCompanyButton({
  action,
  companyName,
  label
}: DeleteCompanyButtonProps) {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        onClick={(event) => {
          if (!confirm(`Delete ${companyName}? This will remove related records.`)) {
            event.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        {label ? <span>{label}</span> : null}
      </Button>
    </form>
  );
}
