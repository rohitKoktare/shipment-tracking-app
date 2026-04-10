import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
};

export function Input({ label, helperText, className = "", id, ...props }: InputProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-2)] px-3 py-2 text-sm text-[var(--text)] shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none",
          "placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[rgba(59,110,246,0.18)]",
          className,
        )}
        {...props}
      />
      {helperText ? <p className="mt-1.5 text-xs text-[var(--text-soft)]">{helperText}</p> : null}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className = "", id, children, ...props }: SelectProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-2)] px-3 text-sm text-[var(--text)] shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none",
          "focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[rgba(59,110,246,0.18)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className = "", id, ...props }: TextareaProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-2)] px-3 py-2.5 text-sm text-[var(--text)] shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none",
          "placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[rgba(59,110,246,0.18)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}
