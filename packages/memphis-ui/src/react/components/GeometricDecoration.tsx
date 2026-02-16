import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export type GeometricShape = 'circle' | 'square' | 'triangle' | 'cross' | 'zigzag';

export interface GeometricDecorationProps {
    shape: GeometricShape;
    color?: AccentColor;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Memphis Geometric Decoration
 *
 * Renders Memphis-style geometric shapes as SVG elements.
 * Used for decorative accents throughout the UI.
 */
export function GeometricDecoration({
    shape,
    color = 'coral',
    size = 40,
    className = '',
    style,
}: GeometricDecorationProps) {
    const renderShape = () => {
        switch (shape) {
            case 'circle':
                return (
                    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="var(--accent)"
                            stroke="var(--color-dark)"
                            strokeWidth="3"
                        />
                    </svg>
                );
            case 'square':
                return (
                    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
                        <rect
                            x="4"
                            y="4"
                            width="32"
                            height="32"
                            fill="var(--accent)"
                            stroke="var(--color-dark)"
                            strokeWidth="3"
                        />
                    </svg>
                );
            case 'triangle':
                return (
                    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
                        <polygon
                            points="20,4 36,36 4,36"
                            fill="var(--accent)"
                            stroke="var(--color-dark)"
                            strokeWidth="3"
                        />
                    </svg>
                );
            case 'cross':
                return (
                    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
                        <rect
                            x="14"
                            y="4"
                            width="12"
                            height="32"
                            fill="var(--accent)"
                            stroke="var(--color-dark)"
                            strokeWidth="3"
                        />
                        <rect
                            x="4"
                            y="14"
                            width="32"
                            height="12"
                            fill="var(--accent)"
                            stroke="var(--color-dark)"
                            strokeWidth="3"
                        />
                    </svg>
                );
            case 'zigzag':
                return (
                    <svg width={size} height={size * 0.5} viewBox="0 0 80 20" fill="none">
                        <polyline
                            points="0,18 10,2 20,18 30,2 40,18 50,2 60,18 70,2 80,18"
                            stroke="var(--accent)"
                            strokeWidth="4"
                            fill="none"
                        />
                    </svg>
                );
        }
    };

    return (
        <div
            className={['inline-block', `accent-${color}`, className].filter(Boolean).join(' ')}
            style={style}
            aria-hidden="true"
        >
            {renderShape()}
        </div>
    );
}
