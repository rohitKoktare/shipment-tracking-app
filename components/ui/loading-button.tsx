"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type LoadingButtonProps = {
  children: React.ReactNode;
  loadingText?: string;
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: "submit" | "button";
  title?: string;
  ariaLabel?: string;
};

export function LoadingButton({
  children,
  loadingText,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  icon,
  type = "submit",
  title,
  ariaLabel,
}: LoadingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || pending}
      title={title}
      ariaLabel={ariaLabel}
      className={`disabled:pointer-events-none ${className}`.trim()}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      <span>{pending ? (loadingText ?? children) : children}</span>
    </Button>
  );
}
