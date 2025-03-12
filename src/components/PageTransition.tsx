'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  // Animation variants - using a crossfade effect
  const variants = {
    initial: { opacity: 0, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 0 },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ 
          duration: 0.15,  // Faster transition
          ease: 'easeInOut'
        }}
        style={{ 
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 