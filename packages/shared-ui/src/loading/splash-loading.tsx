'use client';

/**
 * SplashLoading - Premium loading animation inspired by Monday.com
 *
 * Centers a logo image with orbiting dots and a breathing glow effect.
 * Use for full-page app loading / splash screens.
 *
 * @example
 * <SplashLoading iconSrc="/icon.png" />
 *
 * @example
 * <SplashLoading iconSrc="/icon.png" message="Preparing your workspace..." />
 */

import { useEffect, useState } from 'react';

export interface SplashLoadingProps {
    /** Path to the logo/icon image */
    iconSrc?: string;
    /** Optional loading message below the animation */
    message?: string;
    /** Icon size in pixels (default: 64 fullscreen, 48 inline) */
    iconSize?: number;
    /** Full-screen fixed overlay (true) or inline within container (false). Default: true */
    fullScreen?: boolean;
    /** Additional CSS classes for the container */
    className?: string;
}

interface OrbitDot {
    radius: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
    opacity: number;
}

const ORBIT_DOTS: OrbitDot[] = [
    // Inner ring - fast, small dots (primary navy)
    { radius: 52, size: 6, duration: 2.8, delay: 0, color: '#233876', opacity: 0.9 },
    { radius: 52, size: 5, duration: 2.8, delay: -0.93, color: '#233876', opacity: 0.6 },
    { radius: 52, size: 4, duration: 2.8, delay: -1.87, color: '#233876', opacity: 0.35 },

    // Middle ring - medium dots (teal)
    { radius: 74, size: 8, duration: 3.8, delay: 0, color: '#0f9d8a', opacity: 0.85 },
    { radius: 74, size: 6, duration: 3.8, delay: -1.9, color: '#0f9d8a', opacity: 0.5 },

    // Outer ring - slow, larger dots (accent + mixed)
    { radius: 96, size: 7, duration: 5.2, delay: 0, color: '#945769', opacity: 0.7 },
    { radius: 96, size: 5, duration: 5.2, delay: -2.6, color: '#0f9d8a', opacity: 0.4 },
    { radius: 96, size: 6, duration: 5.2, delay: -1.73, color: '#233876', opacity: 0.3 },
];

const KEYFRAMES = `
@keyframes splash-orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
@keyframes splash-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
}
@keyframes splash-glow-pulse {
    0%, 100% { opacity: 0.15; transform: scale(0.92); }
    50% { opacity: 0.35; transform: scale(1.08); }
}
@keyframes splash-dot-pulse {
    0%, 100% { transform: translateX(var(--dot-radius)) scale(1); }
    50% { transform: translateX(var(--dot-radius)) scale(1.35); }
}
@keyframes splash-fade-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}
@keyframes splash-message-fade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
`;

export function SplashLoading({
    iconSrc = '/icon.png',
    message,
    iconSize,
    fullScreen = true,
    className = '',
}: SplashLoadingProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const resolvedIconSize = iconSize ?? (fullScreen ? 64 : 48);
    const scale = fullScreen ? 1 : 0.8;
    const containerSize = Math.round(240 * scale);
    const center = containerSize / 2;

    const outerClasses = fullScreen
        ? `fixed inset-0 flex flex-col items-center justify-center bg-base-100/80 backdrop-blur-sm z-50 ${className}`
        : `relative flex flex-col items-center justify-center min-h-[400px] w-full ${className}`;

    const dots = ORBIT_DOTS.map((d) => ({
        ...d,
        radius: Math.round(d.radius * scale),
        size: Math.round(d.size * scale),
    }));

    const orbitRadii = [52, 74, 96].map((r) => Math.round(r * scale));

    return (
        <div className={outerClasses}>
            <style>{KEYFRAMES}</style>

            <div
                style={{
                    width: containerSize,
                    height: containerSize,
                    position: 'relative',
                    animation: mounted
                        ? 'splash-fade-in 0.6s ease-out forwards'
                        : 'none',
                    opacity: mounted ? undefined : 0,
                }}
            >
                {/* Glow layers */}
                <div
                    style={{
                        position: 'absolute',
                        left: center - Math.round(44 * scale),
                        top: center - Math.round(44 * scale),
                        width: Math.round(88 * scale),
                        height: Math.round(88 * scale),
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(15, 157, 138, 0.3) 0%, rgba(35, 56, 118, 0.15) 50%, transparent 70%)',
                        animation: 'splash-glow-pulse 3s ease-in-out infinite',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        left: center - Math.round(56 * scale),
                        top: center - Math.round(56 * scale),
                        width: Math.round(112 * scale),
                        height: Math.round(112 * scale),
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(35, 56, 118, 0.12) 0%, transparent 70%)',
                        animation:
                            'splash-glow-pulse 3s ease-in-out infinite 0.5s',
                    }}
                />

                {/* Orbit rings (faint track lines) */}
                {orbitRadii.map((radius) => (
                    <div
                        key={radius}
                        style={{
                            position: 'absolute',
                            left: center - radius,
                            top: center - radius,
                            width: radius * 2,
                            height: radius * 2,
                            borderRadius: '50%',
                            border: '1px solid',
                            borderColor: 'rgba(35, 56, 118, 0.06)',
                        }}
                    />
                ))}

                {/* Orbiting dots */}
                {dots.map((dot, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: center,
                            top: center,
                            width: 0,
                            height: 0,
                            animation: `splash-orbit ${dot.duration}s linear infinite`,
                            animationDelay: `${dot.delay}s`,
                        }}
                    >
                        <div
                            style={
                                {
                                    '--dot-radius': `${dot.radius}px`,
                                    width: dot.size,
                                    height: dot.size,
                                    borderRadius: '50%',
                                    backgroundColor: dot.color,
                                    opacity: dot.opacity,
                                    position: 'absolute',
                                    top: -(dot.size / 2),
                                    left: -(dot.size / 2),
                                    animation: `splash-dot-pulse ${dot.duration * 0.8}s ease-in-out infinite`,
                                    animationDelay: `${dot.delay}s`,
                                    boxShadow: `0 0 ${dot.size * 2}px ${dot.color}40`,
                                    transform: `translateX(${dot.radius}px)`,
                                } as React.CSSProperties
                            }
                        />
                    </div>
                ))}

                {/* Center logo */}
                <div
                    style={{
                        position: 'absolute',
                        left: center - resolvedIconSize / 2,
                        top: center - resolvedIconSize / 2,
                        width: resolvedIconSize,
                        height: resolvedIconSize,
                        animation: 'splash-breathe 3s ease-in-out infinite',
                    }}
                >
                    <img
                        src={iconSrc}
                        alt="Loading"
                        width={resolvedIconSize}
                        height={resolvedIconSize}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 12px rgba(35, 56, 118, 0.2))',
                        }}
                    />
                </div>
            </div>

            {/* Message */}
            {message && (
                <p
                    className="text-base-content/50 text-sm mt-6 tracking-wide"
                    style={{
                        animation: mounted
                            ? 'splash-message-fade 0.8s ease-out 0.3s both'
                            : 'none',
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
