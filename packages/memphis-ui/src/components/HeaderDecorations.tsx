import React from 'react';

export interface HeaderDecorationsProps {
    variant?: 'desktop' | 'mobile';
    className?: string;
}

/**
 * Memphis background decorations for headers.
 * Uses inline styles exclusively to avoid Tailwind cross-package compilation issues.
 */
export function HeaderDecorations({ variant = 'desktop', className = '' }: HeaderDecorationsProps) {
    const base: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
    };

    if (variant === 'mobile') {
        return (
            <div style={base} className={className} aria-hidden="true">
                {/* Subtle circle, far right */}
                <div style={{
                    position: 'absolute',
                    top: 12,
                    right: '15%',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid #FF6B6B',
                    opacity: 0.08,
                }} />
                {/* Tiny square, center-left */}
                <div style={{
                    position: 'absolute',
                    bottom: 12,
                    left: '30%',
                    width: 12,
                    height: 12,
                    backgroundColor: '#FFE66D',
                    transform: 'rotate(45deg)',
                    opacity: 0.07,
                }} />
            </div>
        );
    }

    return (
        <div style={base} className={className} aria-hidden="true">
            {/* Circle outline — far right, top row */}
            <div style={{
                position: 'absolute',
                top: 12,
                right: '8%',
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '2px solid #4ECDC4',
                opacity: 0.10,
            }} />
            {/* Rotated square — right of center */}
            <div style={{
                position: 'absolute',
                bottom: 12,
                right: '30%',
                width: 16,
                height: 16,
                backgroundColor: '#FFE66D',
                transform: 'rotate(45deg)',
                opacity: 0.08,
            }} />
            {/* Triangle — left of center */}
            <div style={{
                position: 'absolute',
                top: 16,
                left: '42%',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '9px solid #A78BFA',
                transform: 'rotate(15deg)',
                opacity: 0.08,
            }} />
            {/* Zigzag — far left, bottom */}
            <svg
                style={{ position: 'absolute', bottom: 8, left: '18%', opacity: 0.07 }}
                width="40"
                height="8"
                viewBox="0 0 40 8"
            >
                <polyline
                    points="0,7 6,1 12,7 18,1 24,7 30,1 36,7"
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
            {/* Dot grid — center, bottom row */}
            <div style={{
                position: 'absolute',
                bottom: 16,
                right: '55%',
                opacity: 0.06,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4,
            }}>
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: '#4ECDC4',
                    }} />
                ))}
            </div>
        </div>
    );
}
