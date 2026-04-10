type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "warning" | "success" | "danger" | "accent";
  className?: string;
};

const toneClasses = {
  neutral: "bg-[rgba(148,163,184,0.12)] text-[#94a3b8] border-[rgba(148,163,184,0.16)]",
  info: "bg-[rgba(56,189,248,0.12)] text-[var(--info)] border-[rgba(56,189,248,0.16)]",
  warning: "bg-[rgba(245,158,11,0.12)] text-[var(--warning)] border-[rgba(245,158,11,0.16)]",
  success: "bg-[rgba(34,197,94,0.12)] text-[var(--success)] border-[rgba(34,197,94,0.16)]",
  danger: "bg-[rgba(239,68,68,0.12)] text-[var(--danger)] border-[rgba(239,68,68,0.16)]",
  accent: "bg-[rgba(79,124,255,0.12)] text-[var(--accent)] border-[rgba(79,124,255,0.16)]",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`.trim()}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
