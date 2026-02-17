import React from 'react';
import type { MemphisCoreColor, MemphisSize } from '../utils/types';

export interface MemphisPlusProps {
    color?: MemphisCoreColor;
    size?: Exclude<MemphisSize, 'xs'>; // xs too small for plus
    className?: string;
}

/**
 * Memphis Plus Decoration
 *
 * SVG plus sign using Memphis theme colors.
 * Used for decorative accents in hero sections and backgrounds.
 *
 * @example
 * <MemphisPlus color="yellow" size="md" className="absolute top-10 left-20" />
 */
export function MemphisPlus({
    color = 'yellow',
    size = 'md',
    className = '',
}: MemphisPlusProps) {
    // Size variants - dimension, viewBox, strokeWidth, padding
    const sizeMap = {
        sm: { dimension: 21, viewBox: '0 0 21 21', strokeWidth: 3, padding: 3 },
        md: { dimension: 35, viewBox: '0 0 35 35', strokeWidth: 4, padding: 5 },
        lg: { dimension: 49, viewBox: '0 0 49 49', strokeWidth: 5, padding: 7 },
        xl: { dimension: 63, viewBox: '0 0 63 63', strokeWidth: 6, padding: 9 },
        '2xl': { dimension: 77, viewBox: '0 0 77 77', strokeWidth: 7, padding: 11 },
    };

    const { dimension, viewBox, strokeWidth, padding } = sizeMap[size];
    const center = dimension / 2;
    const lineStart = padding;
    const lineEnd = dimension - padding;

    // Color to Tailwind stroke class mapping
    const strokeClass = `stroke-${color}-500`;

    return (
        <svg
            className={`memphis-shape ${className}`}
            width={dimension}
            height={dimension}
            viewBox={viewBox}
            aria-hidden="true"
        >
            {/* Vertical line */}
            <line
                x1={center}
                y1={lineStart}
                x2={center}
                y2={lineEnd}
                className={strokeClass}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            {/* Horizontal line */}
            <line
                x1={lineStart}
                y1={center}
                x2={lineEnd}
                y2={center}
                className={strokeClass}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </svg>
    );
}
