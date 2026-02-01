'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface GsapContextValue {
  isReady: boolean;
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
}

const GsapContext = createContext<GsapContextValue | null>(null);

interface GsapProviderProps {
  children: ReactNode;
}

export function GsapProvider({ children }: GsapProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Configure GSAP defaults
    gsap.defaults({
      ease: 'power2.out',
      duration: 0.6,
    });

    // Configure ScrollTrigger defaults
    ScrollTrigger.defaults({
      toggleActions: 'play none none none',
      start: 'top 80%',
    });

    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.globalTimeline.timeScale(100); // Essentially skip animations
    }

    setIsReady(true);

    // Cleanup on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <GsapContext.Provider value={{ isReady, gsap, ScrollTrigger }}>
      {children}
    </GsapContext.Provider>
  );
}

export function useGsapContext() {
  const context = useContext(GsapContext);
  if (!context) {
    throw new Error('useGsapContext must be used within a GsapProvider');
  }
  return context;
}

// Re-export for convenience
export { gsap, ScrollTrigger, useGSAP };
