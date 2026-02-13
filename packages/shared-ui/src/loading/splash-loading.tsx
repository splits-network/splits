'use client';

/**
 * SplashLoading - "The Split" loading animation
 *
 * A single line draws from center outward, then splits into two parallel lines.
 * The logo is revealed in the gap between them. Energy pulses continuously
 * travel along the split lines, representing network connections flowing
 * through the platform.
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

/*
 * Animation timeline:
 *   0.00s        Container visible
 *   0.00–0.55s   Both lines draw from center outward (scale 0→1)
 *   0.35–0.80s   Lines split apart vertically (slight overshoot bounce)
 *   0.55–1.05s   Logo + glow fade in
 *   0.90–1.40s   Message fades in
 *   1.10s+       Upper pulse begins sweeping right  (loops 2.6s)
 *   1.40s+       Logo breathe + glow pulse begin    (loops 3s / 3.5s)
 *   1.50s+       Lower pulse begins sweeping left   (loops 3.0s)
 *
 * Uses CSS individual transform properties (translate, scale) so the
 * draw and split animations compose without conflict.
 */
const KEYFRAMES = `
@keyframes sn-draw {
    from { scale: 0 1; }
    to   { scale: 1 1; }
}
@keyframes sn-split-up {
    from { translate: 0 0; }
    to   { translate: 0 calc(var(--sn-split) * -1); }
}
@keyframes sn-split-down {
    from { translate: 0 0; }
    to   { translate: 0 var(--sn-split); }
}
@keyframes sn-reveal {
    from { opacity: 0; scale: 0.85; }
    to   { opacity: 1; scale: 1; }
}
@keyframes sn-breathe {
    0%, 100% { scale: 1; }
    50%      { scale: 1.035; }
}
@keyframes sn-glow-pulse {
    0%, 100% { opacity: 0.05; scale: 0.92; }
    50%      { opacity: 0.18; scale: 1.08; }
}
@keyframes sn-sweep-r {
    0%   { left: -80px; opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { left: 100%; opacity: 0; }
}
@keyframes sn-sweep-l {
    0%   { left: 100%; opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { left: -80px; opacity: 0; }
}
@keyframes sn-text-in {
    from { opacity: 0; translate: 0 6px; }
    to   { opacity: 1; translate: 0 0; }
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

    const resolvedSize = iconSize ?? (fullScreen ? 64 : 48);
    const split = fullScreen ? 44 : 32;

    const outerClasses = fullScreen
        ? `fixed inset-0 flex flex-col items-center justify-center bg-base-100/80 backdrop-blur-sm z-50 ${className}`
        : `relative flex flex-col items-center justify-center min-h-[400px] w-full ${className}`;

    if (!mounted) {
        return <div className={outerClasses} style={{ opacity: 0 }} />;
    }

    const lineGradient =
        'linear-gradient(90deg, transparent, oklch(var(--color-primary) / 0.18) 12%, oklch(var(--color-primary) / 0.18) 88%, transparent)';

    return (
        <div
            className={outerClasses}
            style={{ '--sn-split': `${split}px` } as React.CSSProperties}
        >
            <style>{KEYFRAMES}</style>

            <div
                style={{
                    position: 'relative',
                    width: fullScreen ? '50%' : '42%',
                    minWidth: 260,
                    maxWidth: 480,
                    height: split * 2 + 20,
                }}
            >
                {/* Upper split line */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '50% 0 auto 0',
                        height: 1.5,
                        marginTop: -0.75,
                        background: lineGradient,
                        transformOrigin: 'center',
                        overflow: 'hidden',
                        animation:
                            'sn-draw 0.55s ease-out both, sn-split-up 0.45s cubic-bezier(.33,1.4,.64,1) 0.35s both',
                    }}
                >
                    {/* Teal energy pulse sweeping right */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -1,
                            width: 70,
                            height: 3.5,
                            borderRadius: 2,
                            background:
                                'linear-gradient(90deg, transparent 0%, oklch(var(--color-secondary) / 0.6) 35%, oklch(var(--color-secondary) / 0.8) 50%, oklch(var(--color-secondary) / 0.35) 75%, transparent)',
                            animation:
                                'sn-sweep-r 2.6s ease-in-out 1.1s infinite',
                        }}
                    />
                </div>

                {/* Lower split line */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '50% 0 auto 0',
                        height: 1.5,
                        marginTop: -0.75,
                        background: lineGradient,
                        transformOrigin: 'center',
                        overflow: 'hidden',
                        animation:
                            'sn-draw 0.55s ease-out both, sn-split-down 0.45s cubic-bezier(.33,1.4,.64,1) 0.35s both',
                    }}
                >
                    {/* Accent energy pulse sweeping left */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -1,
                            width: 70,
                            height: 3.5,
                            borderRadius: 2,
                            background:
                                'linear-gradient(90deg, transparent 0%, oklch(var(--color-accent) / 0.4) 25%, oklch(var(--color-accent) / 0.55) 50%, oklch(var(--color-accent) / 0.25) 80%, transparent)',
                            animation:
                                'sn-sweep-l 3.0s ease-in-out 1.5s infinite',
                        }}
                    />
                </div>

                {/* Center glow behind logo */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: resolvedSize * 2.4,
                        height: resolvedSize * 1.8,
                        marginTop: -(resolvedSize * 0.9),
                        marginLeft: -(resolvedSize * 1.2),
                        borderRadius: '50%',
                        background:
                            'radial-gradient(ellipse, oklch(var(--color-secondary) / 0.12) 0%, transparent 70%)',
                        animation:
                            'sn-reveal 0.5s ease-out 0.55s both, sn-glow-pulse 3.5s ease-in-out 1.4s infinite',
                        pointerEvents: 'none',
                    }}
                />

                {/* Logo */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: resolvedSize,
                        height: resolvedSize,
                        marginTop: -(resolvedSize / 2),
                        marginLeft: -(resolvedSize / 2),
                        animation:
                            'sn-reveal 0.5s ease-out 0.6s both, sn-breathe 3s ease-in-out 1.4s infinite',
                    }}
                >
                    <img
                        src={iconSrc}
                        alt="Loading"
                        width={resolvedSize}
                        height={resolvedSize}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 1px 8px oklch(var(--color-primary) / 0.12))',
                        }}
                    />
                </div>
            </div>

            {/* Message */}
            {message && (
                <p
                    className="text-base-content/40"
                    style={{
                        marginTop: 28,
                        fontSize: '0.7rem',
                        letterSpacing: '0.12em',
                        fontWeight: 300,
                        textTransform: 'uppercase' as const,
                        animation: 'sn-text-in 0.5s ease-out 0.9s both',
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
