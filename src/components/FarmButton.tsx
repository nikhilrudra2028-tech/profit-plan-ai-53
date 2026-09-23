import type { ButtonHTMLAttributes, ReactNode } from "react";

type FarmButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "light";
};

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-button hover:bg-primary-hover",
  secondary:
    "border border-border-strong bg-surface/80 text-foreground hover:bg-secondary",
  light: "bg-surface text-primary shadow-button hover:bg-secondary",
};

export function FarmButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: FarmButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}