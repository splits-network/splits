'use client';

import { useRef, useEffect, useState } from 'react';

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
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (prefersReducedMotion) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const startValue = previousValue.current;
    const diff = value - startValue;
    if (diff === 0) return;

    const animDuration = 600; // ms
    const startTime = performance.now();
    setIsAnimating(true);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + diff * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
        previousValue.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
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
