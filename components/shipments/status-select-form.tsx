"use client";

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
    <form action={action}>
      {Object.entries(hiddenFields).map(([key, hiddenValue]) => (
        <input key={key} type="hidden" name={key} value={hiddenValue} />
      ))}
      <select
        name={name}
        defaultValue={value}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 hover:border-slate-400"
        aria-label="Update selection"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </form>
  );
}
