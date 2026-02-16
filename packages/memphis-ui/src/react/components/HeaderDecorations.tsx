import React from 'react';

export interface HeaderDecorationsProps {
    variant?: 'desktop' | 'mobile';
    className?: string;
}

/**
 * Memphis background decorations for headers.
 * Uses Tailwind classes with CSS variables for theme colors.
 */
export function HeaderDecorations({ variant = 'desktop', className = '' }: HeaderDecorationsProps) {
    if (variant === 'mobile') {
        return (
            <div className={`absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
                {/* Subtle circle, far right */}
                <div
                    className="absolute rounded-full border-2 border-coral opacity-[0.08]"
                    style={{ top: 12, right: '15%', width: 20, height: 20 }}
                />
                {/* Tiny square, center-left */}
                <div
                    className="absolute bg-yellow opacity-[0.07]"
                    style={{ bottom: 12, left: '30%', width: 12, height: 12, transform: 'rotate(45deg)' }}
                />
            </div>
        );
    }

    return (
        <div className={`absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
            {/* Circle outline — far right, top row */}
            <div
                className="absolute rounded-full border-2 border-teal opacity-10"
                style={{ top: 12, right: '8%', width: 24, height: 24 }}
            />
            {/* Rotated square — right of center */}
            <div
                className="absolute bg-yellow opacity-[0.08]"
                style={{ bottom: 12, right: '30%', width: 16, height: 16, transform: 'rotate(45deg)' }}
            />
            {/* Triangle — left of center */}
            <div
                className="absolute opacity-[0.08]"
                style={{
                    top: 16,
                    left: '42%',
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '9px solid var(--color-purple)',
                    transform: 'rotate(15deg)',
                }}
            />
            {/* Zigzag — far left, bottom */}
            <svg
                className="absolute opacity-[0.07]"
                style={{ bottom: 8, left: '18%' }}
                width="40"
                height="8"
                viewBox="0 0 40 8"
            >
                <polyline
                    points="0,7 6,1 12,7 18,1 24,7 30,1 36,7"
                    fill="none"
                    stroke="var(--color-coral)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
            {/* Dot grid — center, bottom row */}
            <div
                className="absolute opacity-[0.06]"
                style={{
                    bottom: 16,
                    right: '55%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4,
                }}
            >
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-full bg-teal" style={{ width: 4, height: 4 }} />
                ))}
            </div>
        </div>
    );
}
