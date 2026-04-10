"use client";

import { MonitorCog, Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

type ThemeToggleProps = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const options: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-3)] p-1">
      <div className="hidden items-center gap-2 px-2 text-[var(--text-soft)] md:flex">
        <MonitorCog className="h-4 w-4" />
      </div>
      {options.map((option) => {
        const active = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
              active
                ? "bg-[var(--bg-4)] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "text-[var(--text-soft)] hover:text-[var(--text)]"
            }`}
            aria-label={`Switch to ${option.label.toLowerCase()} theme`}
            title={`${option.label} theme`}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
