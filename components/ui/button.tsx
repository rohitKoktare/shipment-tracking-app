import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "icon";
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
  primary: "border border-transparent bg-[var(--accent)] text-white hover:bg-[#3d6ae8]",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--bg-4)] text-[var(--text)] hover:bg-[var(--bg-3)]",
  ghost: "border border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-4)] hover:text-[var(--text)]",
  destructive:
    "border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.18)]",
};

const sizeClasses = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  icon: "h-10 w-10 px-0",
};

function getClassName(variant: keyof typeof variantClasses, size: keyof typeof sizeClasses, className?: string) {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ""}`.trim();
}

export function Button({
  children,
  variant = "primary",
  size = "md",
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
      className={`${getClassName(variant, size, className)} disabled:cursor-not-allowed disabled:opacity-60`}
      title={title}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
