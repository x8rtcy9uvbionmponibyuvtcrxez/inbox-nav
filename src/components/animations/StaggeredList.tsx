"use client";

import { ReactNode, useEffect, useState } from 'react';

type MotionModule = typeof import('framer-motion');

let cachedMotion: MotionModule | null = null;
let loader: Promise<MotionModule> | null = null;

async function loadMotion(): Promise<MotionModule> {
  if (cachedMotion) return cachedMotion;
  if (!loader) {
    loader = import('framer-motion').then((mod) => {
      cachedMotion = mod;
      return mod;
    });
  }
  return loader;
}

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Removed complex variants to avoid TypeScript issues

export default function StaggeredList({ 
  children, 
  className = ""
}: StaggeredListProps) {
  const [motion, setMotion] = useState<MotionModule | null>(() => cachedMotion);

  useEffect(() => {
    if (!motion && typeof window !== 'undefined') {
      let mounted = true;
      loadMotion().then((mod) => {
        if (mounted) setMotion(mod);
      });
      return () => {
        mounted = false;
      };
    }
  }, [motion]);

  if (!motion) {
    return (
      <div className={className}>
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <div key={index}>
              {child}
            </div>
          ))
        ) : (
          <div>{children}</div>
        )}
      </div>
    );
  }

  const MotionDiv = motion.motion.div;

  return (
    <MotionDiv
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <MotionDiv
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {child}
          </MotionDiv>
        ))
      ) : (
          <MotionDiv
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
          {children}
        </MotionDiv>
      )}
    </MotionDiv>
  );
}
