"use client";

import { Save } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Select } from "@/components/ui/input";

type StatusSelectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  name: string;
  value: string;
  options: string[];
};

export function StatusSelectForm({
  action,
  hiddenFields,
  name,
  value,
  options,
}: StatusSelectFormProps) {
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {Object.entries(hiddenFields).map(([key, hiddenValue]) => (
        <input key={key} type="hidden" name={key} value={hiddenValue} />
      ))}
      <Select
        name={name}
        defaultValue={value}
        className="min-w-40"
        aria-label="Update selection"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <LoadingButton
        variant="secondary"
        size="sm"
        loadingText="Updating..."
        icon={<Save className="h-4 w-4" />}
        title="Update selection"
        ariaLabel="Update selection"
        className="min-w-28 inline-flex items-center gap-2"
      >
        Update
      </LoadingButton>
    </form>
  );
}
