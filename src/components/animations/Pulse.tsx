"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PulseProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
}

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function Pulse({ 
  children, 
  className = "",
  duration = 2,
  scale = 1.05 
}: PulseProps) {
  return (
    <motion.div
      variants={pulseVariants}
      animate="animate"
      className={className}
      style={{
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </motion.div>
  );
}
