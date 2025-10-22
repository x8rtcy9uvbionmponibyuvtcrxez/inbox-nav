"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const fadeInVariants = {
  hidden: (direction: string) => ({
    opacity: 0,
    y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
    x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
  },
};

export default function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  direction = 'up',
  className = "" 
}: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      custom={direction}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
