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
    <form action={action} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
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
        size="default"
        loadingText="Updating..."
        icon={<Save className="h-4 w-4" />}
        title="Update selection"
        ariaLabel="Update selection"
        className="min-w-[124px] justify-center"
      >
        Update
      </LoadingButton>
    </form>
  );
}
