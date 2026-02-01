'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { duration, easing } from '@/components/landing/shared/animation-utils';

interface AnimatedPayoutProps {
  value: number;
  prefix?: string;
  className?: string;
  highlightChange?: boolean;
}

export function AnimatedPayout({
  value,
  prefix = '$',
  className = '',
  highlightChange = false,
}: AnimatedPayoutProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(value);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    if (prefersReducedMotion) {
      // Skip animation, set value immediately
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    // Animate from previous value to new value
    const startValue = previousValue.current;
    setIsAnimating(true);

    const obj = { val: startValue };
    animationRef.current = gsap.to(obj, {
      val: value,
      duration: duration.counter,
      ease: easing.smooth,
      onUpdate: () => {
        setDisplayValue(Math.round(obj.val));
      },
      onComplete: () => {
        setIsAnimating(false);
        previousValue.current = value;
      },
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [value]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <span
      className={`tabular-nums ${className} ${
        isAnimating && highlightChange ? 'text-primary transition-colors' : ''
      }`}
    >
      {prefix}
      {formatNumber(displayValue)}
    </span>
  );
}
