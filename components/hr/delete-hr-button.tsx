"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteHrButtonProps = {
  action: () => void;
  hrName: string;
  label?: string;
};

export function DeleteHrButton({ action, hrName, label }: DeleteHrButtonProps) {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        onClick={(event) => {
          if (!confirm(`Delete ${hrName}? This will remove related HR records.`)) {
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
