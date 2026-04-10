import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "default" | "icon";
  className?: string;
  href?: string;
  type?: "button" | "submit";
  icon?: React.ReactNode;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const variantClasses = {
  default: "border border-transparent bg-[var(--accent)] text-white hover:bg-[#2d5de0]",
  primary: "border border-transparent bg-[var(--accent)] text-white hover:bg-[#2d5de0]",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--bg-2)] text-[var(--text)] hover:bg-[var(--bg-3)]",
  outline: "border border-[var(--border-strong)] bg-transparent text-[var(--text)] hover:bg-[var(--bg-3)]",
  ghost: "border border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-3)] hover:text-[var(--text)]",
  destructive:
    "border border-[#fecaca] bg-[#fff0f0] text-[var(--danger)] hover:bg-[#ffe4e4]",
};

const sizeClasses = {
  sm: "h-9 rounded-lg px-3 text-xs",
  md: "h-10 rounded-xl px-4 text-sm",
  default: "h-10 rounded-xl px-4 text-sm",
  icon: "h-10 w-10 rounded-xl px-0",
};

function getClassName(variant: keyof typeof variantClasses, size: keyof typeof sizeClasses, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  children,
  variant = "default",
  size = "default",
  className,
  href,
  type = "button",
  icon,
  title,
  ariaLabel,
  disabled = false,
  onClick,
}: ButtonProps) {
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={getClassName(variant, size, className)} title={title} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(getClassName(variant, size, className), "disabled:cursor-not-allowed")}
      title={title}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
