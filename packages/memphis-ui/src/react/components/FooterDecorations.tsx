import React from 'react';

export interface FooterDecorationsProps {
    className?: string;
}

/**
 * Memphis geometric decorations for footers.
 * Uses Tailwind classes for colors/opacity and inline styles for positioning.
 * Each shape has a `footer-shape` class for GSAP animation targeting.
 */
export function FooterDecorations({ className = '' }: FooterDecorationsProps) {
    return (
        <div className={`absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
            {/* Circle outline - top right */}
            <div className="footer-shape rounded-full border-3 border-coral opacity-[0.08]" style={{
                position: 'absolute',
                top: '8%',
                right: '6%',
                width: 20,
                height: 20,
            }} />

            {/* Filled circle - mid left */}
            <div className="footer-shape rounded-full bg-teal opacity-[0.07]" style={{
                position: 'absolute',
                top: '40%',
                left: '3%',
                width: 12,
                height: 12,
            }} />

            {/* Small circle - bottom right */}
            <div className="footer-shape rounded-full bg-yellow opacity-[0.06]" style={{
                position: 'absolute',
                bottom: '25%',
                right: '12%',
                width: 8,
                height: 8,
            }} />

            {/* Rotated square - top left */}
            <div className="footer-shape border-2 border-purple opacity-[0.07]" style={{
                position: 'absolute',
                top: '15%',
                left: '8%',
                width: 14,
                height: 14,
                transform: 'rotate(12deg)',
            }} />

            {/* Filled square - bottom center-right */}
            <div className="footer-shape bg-coral opacity-[0.06]" style={{
                position: 'absolute',
                bottom: '35%',
                right: '25%',
                width: 10,
                height: 10,
                transform: 'rotate(-6deg)',
            }} />

            {/* Triangle - mid left */}
            <div className="footer-shape opacity-[0.07]" style={{
                position: 'absolute',
                top: '55%',
                left: '15%',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '10px solid var(--color-yellow)',
                transform: 'rotate(-15deg)',
            }} />

            {/* Zigzag - center top */}
            <svg
                className="footer-shape opacity-[0.06]"
                style={{ position: 'absolute', top: '30%', right: '35%' }}
                width="40"
                height="12"
                viewBox="0 0 40 12"
            >
                <polyline
                    points="0,10 5,2 10,10 15,2 20,10 25,2 30,10 35,2 40,10"
                    fill="none"
                    stroke="var(--color-teal)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>

            {/* Dot grid - bottom left */}
            <div className="footer-shape grid grid-cols-3 gap-[3px] opacity-[0.05]" style={{
                position: 'absolute',
                bottom: '15%',
                left: '30%',
            }}>
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-full bg-purple" style={{
                        width: 3,
                        height: 3,
                    }} />
                ))}
            </div>

            {/* Plus sign - bottom right area */}
            <svg
                className="footer-shape opacity-[0.06]"
                style={{ position: 'absolute', top: '70%', left: '60%' }}
                width="12"
                height="12"
                viewBox="0 0 12 12"
            >
                <line x1="6" y1="1" x2="6" y2="11" stroke="var(--color-coral)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="6" x2="11" y2="6" stroke="var(--color-coral)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </div>
    );
}
