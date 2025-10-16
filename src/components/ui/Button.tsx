import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center rounded-[14px] font-semibold tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--bg-white)] text-[var(--text-dark)] border border-transparent hover:bg-[#e9e9e9] active:bg-[#dcdcdc] hover:shadow-lg hover:scale-[1.02]",
  secondary:
    "border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-quaternary)] hover:shadow-md",
  ghost:
    "bg-transparent text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] hover:bg-[rgba(126,127,126,0.08)] hover:shadow-sm",
  outline:
    "border border-[var(--border-medium)] bg-transparent text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-tertiary)] hover:shadow-sm",
  danger:
    "border border-transparent bg-[#fb7185] text-white hover:bg-[#ff9aa4] hover:shadow-lg hover:scale-[1.02]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-7 text-lg",
};

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    className?: string;
    asChild?: boolean;
  }
>;

export function Button({
  children,
  className,
  variant = "secondary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const classes = [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(" ");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={classes} {...props}>
      {children}
    </Comp>
  );
}
