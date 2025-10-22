"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
  disabled: {
    scale: 1,
    opacity: 0.6,
  },
};

const rippleVariants = {
  initial: {
    scale: 0,
    opacity: 0.6,
  },
  animate: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function AnimatedButton({
  children,
  onClick,
  className = "",
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
}: AnimatedButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-[14px] font-semibold tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[var(--border-strong)] disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]",
    secondary: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)]",
    ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variants={buttonVariants}
      whileHover={disabled ? "disabled" : "hover"}
      whileTap={disabled ? "disabled" : "tap"}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-[14px]"
          variants={rippleVariants}
          initial="initial"
          whileTap="animate"
        />
      )}
    </motion.button>
  );
}
