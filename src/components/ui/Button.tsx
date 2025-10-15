import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<Variant, string> = {
  primary: "bg-white text-black shadow hover:bg-white/90 focus-visible:ring-white/70",
  secondary: "border border-white/20 bg-white/10 text-white/80 hover:border-white/40 hover:text-white focus-visible:ring-white/50",
  ghost: "border border-transparent text-white/70 hover:text-white focus-visible:ring-white/40",
  outline: "border border-white/20 text-white/80 hover:border-white/40 hover:text-white focus-visible:ring-white/50",
  danger: "bg-red-500 text-white hover:bg-red-400 focus-visible:ring-red-200",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-3 text-base",
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
