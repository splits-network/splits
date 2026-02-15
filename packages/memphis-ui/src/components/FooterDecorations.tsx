import React from 'react';

export interface FooterDecorationsProps {
    className?: string;
}

/**
 * Memphis geometric decorations for footers.
 * Uses inline styles exclusively to avoid Tailwind cross-package compilation issues.
 * Each shape has a `footer-shape` class for GSAP animation targeting.
 */
export function FooterDecorations({ className = '' }: FooterDecorationsProps) {
    const base: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
    };

    return (
        <div style={base} className={className} aria-hidden="true">
            {/* Circle outline - top right */}
            <div className="footer-shape" style={{
                position: 'absolute',
                top: '8%',
                right: '6%',
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '3px solid #FF6B6B',
                opacity: 0.08,
            }} />

            {/* Filled circle - mid left */}
            <div className="footer-shape" style={{
                position: 'absolute',
                top: '40%',
                left: '3%',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#4ECDC4',
                opacity: 0.07,
            }} />

            {/* Small circle - bottom right */}
            <div className="footer-shape" style={{
                position: 'absolute',
                bottom: '25%',
                right: '12%',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#FFE66D',
                opacity: 0.06,
            }} />

            {/* Rotated square - top left */}
            <div className="footer-shape" style={{
                position: 'absolute',
                top: '15%',
                left: '8%',
                width: 14,
                height: 14,
                border: '2px solid #A78BFA',
                transform: 'rotate(12deg)',
                opacity: 0.07,
            }} />

            {/* Filled square - bottom center-right */}
            <div className="footer-shape" style={{
                position: 'absolute',
                bottom: '35%',
                right: '25%',
                width: 10,
                height: 10,
                backgroundColor: '#FF6B6B',
                transform: 'rotate(-6deg)',
                opacity: 0.06,
            }} />

            {/* Triangle - mid left */}
            <div className="footer-shape" style={{
                position: 'absolute',
                top: '55%',
                left: '15%',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '10px solid #FFE66D',
                transform: 'rotate(-15deg)',
                opacity: 0.07,
            }} />

            {/* Zigzag - center top */}
            <svg
                className="footer-shape"
                style={{ position: 'absolute', top: '30%', right: '35%', opacity: 0.06 }}
                width="40"
                height="12"
                viewBox="0 0 40 12"
            >
                <polyline
                    points="0,10 5,2 10,10 15,2 20,10 25,2 30,10 35,2 40,10"
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>

            {/* Dot grid - bottom left */}
            <div className="footer-shape" style={{
                position: 'absolute',
                bottom: '15%',
                left: '30%',
                opacity: 0.05,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 3,
            }}>
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{
                        width: 3,
                        height: 3,
                        borderRadius: '50%',
                        backgroundColor: '#A78BFA',
                    }} />
                ))}
            </div>

            {/* Plus sign - bottom right area */}
            <svg
                className="footer-shape"
                style={{ position: 'absolute', top: '70%', left: '60%', opacity: 0.06 }}
                width="12"
                height="12"
                viewBox="0 0 12 12"
            >
                <line x1="6" y1="1" x2="6" y2="11" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="6" x2="11" y2="6" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </div>
    );
}
