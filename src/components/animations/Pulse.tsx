"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PulseProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
}

// Removed complex variants to avoid TypeScript issues

export default function Pulse({ 
  children, 
  className = "",
  duration = 2
}: PulseProps) {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1], 
        opacity: [1, 0.8, 1] 
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
