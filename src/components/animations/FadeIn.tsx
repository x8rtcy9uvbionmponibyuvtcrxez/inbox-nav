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
    return <div className={className}>{children}</div>;
  }

  const MotionDiv = motion.motion.div;

  return (
    <MotionDiv
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
    </MotionDiv>
  );
}
