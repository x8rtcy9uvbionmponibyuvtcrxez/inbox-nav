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

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  duration: 0.4,
};

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
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
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </MotionDiv>
  );
}
