'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';

// ===== ANIMATED COUNTER HOOK =====

interface UseAnimatedCounterOptions {
    /** Duration of animation in ms */
    duration?: number;
    /** Delay before animation starts in ms */
    delay?: number;
    /** Whether to trigger on visibility */
    triggerOnVisible?: boolean;
    /** Easing function */
    easing?: 'linear' | 'easeOut' | 'easeInOut';
}

function useAnimatedCounter(
    targetValue: number,
    options: UseAnimatedCounterOptions = {}
): { count: number; ref: React.RefObject<HTMLDivElement | null> } {
    const {
        duration = 1000,
        delay = 300,
        triggerOnVisible = true,
        easing = 'easeOut',
    } = options;

    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Easing functions
    const easingFunctions = {
        linear: (t: number) => t,
        easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
        easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    };

    const animate = useCallback(() => {
        if (hasAnimated) return;
        setHasAnimated(true);

        // Add delay before starting animation
        timeoutRef.current = setTimeout(() => {
            const startTime = performance.now();
            const startValue = 0;
            const easeFn = easingFunctions[easing];

            const updateCount = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeFn(progress);
                const currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress);

                setCount(currentValue);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(updateCount);
                }
            };

            animationRef.current = requestAnimationFrame(updateCount);
        }, delay);
    }, [targetValue, duration, delay, easing, hasAnimated]);

    // Intersection Observer for visibility trigger
    useEffect(() => {
        if (!triggerOnVisible) {
            animate();
            return;
        }

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        animate();
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [triggerOnVisible, animate, hasAnimated]);

    // Update count immediately if target changes after animation
    useEffect(() => {
        if (hasAnimated) {
            setCount(targetValue);
        }
    }, [targetValue, hasAnimated]);

    return { count, ref };
}

// ===== STAT CARD COMPONENT =====

export interface StatCardProps {
    /** Main stat value (number or formatted string) */
    value: string | number;
    /** Title/label describing the stat */
    title: string;
    /** Optional description/subtitle */
    description?: string;
    /** FontAwesome icon class (e.g., 'fa-briefcase') */
    icon?: string;
    /** Icon color variant */
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
    /** Trend percentage (positive = green, negative = red) */
    trend?: number;
    /** Trend comparison label (e.g., 'vs last month') */
    trendLabel?: string;
    /** Optional link href - makes the card a clickable link */
    href?: string;
    /** Optional click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    loading?: boolean;
    /** Whether to animate the value counting up (only works with numeric values) */
    animate?: boolean;
    /** Animation duration in ms (default: 1000) */
    animationDuration?: number;
}

const statColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
};

const iconColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
};

/**
 * StatCard - Uses DaisyUI stat component
 * 
 * Based on: https://daisyui.com/components/stat/
 * 
 * Features:
 * - Large value display with title
 * - Optional icon with colored background
 * - Trend indicator (+X% / -X%) with color coding
 * - Hover effect when clickable
 * - Loading skeleton state
 * - Animated counting effect when visible
 */
export function StatCard({
    value,
    title,
    description,
    icon,
    color = 'primary',
    trend,
    trendLabel,
    href,
    onClick,
    className = '',
    loading = false,
    animate = true,
    animationDuration = 1000,
}: StatCardProps) {
    // Parse numeric value for animation
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    const isNumeric = !isNaN(numericValue) && typeof value === 'number';
    const shouldAnimate = animate && isNumeric;

    // Animated counter hook
    const { count, ref } = useAnimatedCounter(shouldAnimate ? numericValue : 0, {
        duration: animationDuration,
        triggerOnVisible: true,
        easing: 'easeOut',
    });

    // Display value - animated or static
    const displayValue = shouldAnimate ? count : value;

    if (loading) {
        return (
            <div className={`stat ${className}`}>
                <div className="animate-pulse">
                    <div className="stat-figure text-base-300">
                        <div className="w-8 h-8 bg-base-300 rounded-full"></div>
                    </div>
                    <div className="stat-title">
                        <div className="h-4 bg-base-300 rounded w-20"></div>
                    </div>
                    <div className="stat-value">
                        <div className="h-8 bg-base-300 rounded w-16 mt-1"></div>
                    </div>
                    <div className="stat-desc">
                        <div className="h-3 bg-base-300 rounded w-24 mt-1"></div>
                    </div>
                </div>
            </div>
        );
    }

    const trendIsPositive = trend !== undefined && trend >= 0;
    const trendColor = trendIsPositive ? 'text-success' : 'text-error';
    const trendArrow = trendIsPositive ? '↗︎' : '↘︎';

    const statContent = (
        <>
            {icon && (
                <div className={`stat-figure ${iconColorClasses[color]}`}>
                    <i className={`fa-duotone fa-regular ${icon} text-3xl`}></i>
                </div>
            )}
            <div className="stat-title">{title}</div>
            <div className={`stat-value ${statColorClasses[color]}`}>{displayValue}</div>
            {(description || trend !== undefined) && (
                <div className="stat-desc">
                    {trend !== undefined && (
                        <span className={trendColor}>
                            {trendArrow} {Math.abs(Math.round(trend))}%
                        </span>
                    )}
                    {(trendLabel || description) && (
                        <span className="ml-1">
                            {trendLabel || description}
                        </span>
                    )}
                </div>
            )}
        </>
    );

    const interactiveClasses = (href || onClick)
        ? 'hover:bg-base-200 transition-colors cursor-pointer'
        : '';

    // If href is provided, wrap in a Link
    if (href) {
        return (
            <Link href={href} className="block">
                <div
                    ref={ref}
                    className={`stat ${interactiveClasses} ${className}`}
                >
                    {statContent}
                </div>
            </Link>
        );
    }

    return (
        <div
            ref={ref}
            className={`stat ${interactiveClasses} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {statContent}
        </div>
    );
}
