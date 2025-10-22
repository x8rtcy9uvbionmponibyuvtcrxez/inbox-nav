"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const floatingVariants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

export default function FloatingActionButton({
  children,
  onClick,
  className = "",
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      variants={floatingVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-lg border border-[var(--border-medium)] hover:shadow-xl transition-all duration-200 ${positionClasses[position]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
