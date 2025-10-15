import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-[0.01em] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-gradient-to)] focus-visible:ring-offset-[var(--surface-0)] disabled:cursor-not-allowed disabled:opacity-60 border border-transparent";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--accent-primary)] text-[var(--accent-primary-contrast)] shadow-[0_18px_38px_-24px_rgba(255,255,255,0.7)] hover:bg-white/95 hover:shadow-[0_22px_44px_-26px_rgba(255,255,255,0.8)] active:translate-y-[1px]",
  secondary:
    "border-[var(--border-subtle)] bg-white/[0.08] text-brand-primary hover:border-[var(--border-strong)] hover:bg-white/[0.12]",
  ghost:
    "border-transparent bg-transparent text-brand-secondary hover:text-brand-primary hover:bg-white/[0.08]",
  outline:
    "border-[var(--border-strong)] bg-transparent text-brand-secondary hover:text-brand-primary hover:border-white/50",
  danger:
    "bg-[var(--danger)] text-white shadow-[0_18px_34px_-24px_rgba(251,113,133,0.7)] hover:bg-[#ff8598]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-[52px] px-6 text-lg",
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
