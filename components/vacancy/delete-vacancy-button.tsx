"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteVacancyButtonProps = {
  action: () => void;
  vacancyTitle: string;
  label?: string;
};

export function DeleteVacancyButton({
  action,
  vacancyTitle,
  label
}: DeleteVacancyButtonProps) {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        onClick={(event) => {
          if (!confirm(`Delete ${vacancyTitle}? This will remove the vacancy record and related references.`)) {
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
