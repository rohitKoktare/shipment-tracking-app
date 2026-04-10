import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "warning" | "success" | "danger" | "accent";
  className?: string;
};

const toneClasses = {
  neutral: "border-[#d8dde6] bg-[#f1f3f6] text-[#475569]",
  info: "border-[#bae6fd] bg-[#e0f2fe] text-[#0369a1]",
  warning: "border-[#fde68a] bg-[#fef3c7] text-[#92400e]",
  success: "border-[#bbf7d0] bg-[#dcfce7] text-[#15803d]",
  danger: "border-[#fecaca] bg-[#fee2e2] text-[#991b1b]",
  accent: "border-[#ddd6fe] bg-[#ede9fe] text-[#5b21b6]",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold", toneClasses[tone], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
