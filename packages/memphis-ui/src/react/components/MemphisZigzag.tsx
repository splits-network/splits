import React from 'react';
import type { MemphisCoreColor, MemphisSize } from '../utils/types';

export interface MemphisZigzagProps {
    color?: MemphisCoreColor;
    size?: Exclude<MemphisSize, 'xs'>; // xs too small for zigzag
    className?: string;
}

/**
 * Memphis Zigzag Decoration
 *
 * SVG zigzag pattern using Memphis theme colors.
 * Used for decorative accents in hero sections and backgrounds.
 *
 * @example
 * <MemphisZigzag color="purple" size="md" className="absolute top-10 left-20" />
 */
export function MemphisZigzag({
    color = 'purple',
    size = 'md',
    className = '',
}: MemphisZigzagProps) {
    // Size variants - width, height, viewBox
    const sizeMap = {
        sm: { width: 60, height: 21, viewBox: '0 0 60 21', strokeWidth: 2 },
        md: { width: 100, height: 35, viewBox: '0 0 100 35', strokeWidth: 3 },
        lg: { width: 140, height: 49, viewBox: '0 0 140 49', strokeWidth: 4 },
        xl: { width: 180, height: 63, viewBox: '0 0 180 63', strokeWidth: 5 },
        '2xl': { width: 220, height: 77, viewBox: '0 0 220 77', strokeWidth: 6 },
    };

    // Points patterns for each size
    const pointsMap = {
        sm: '0,15 7.2,4.8 15,15 22.8,4.8 30,15 37.2,4.8 45,15 52.8,4.8 60,15',
        md: '0,25 12,8 25,25 38,8 50,25 62,8 75,25 88,8 100,25',
        lg: '0,35 16.8,11.2 35,35 53.2,11.2 70,35 86.8,11.2 105,35 123.2,11.2 140,35',
        xl: '0,45 21.6,14.4 45,45 68.4,14.4 90,45 111.6,14.4 135,45 158.4,14.4 180,45',
        '2xl': '0,55 26.4,17.6 55,55 83.6,17.6 110,55 136.4,17.6 165,55 193.6,17.6 220,55',
    };

    const { width, height, viewBox, strokeWidth } = sizeMap[size];
    const points = pointsMap[size];

    // Color to Tailwind stroke class mapping
    const strokeClass = `stroke-${color}-500`;

    return (
        <svg
            className={`memphis-shape ${className}`}
            width={width}
            height={height}
            viewBox={viewBox}
            aria-hidden="true"
        >
            <polyline
                points={points}
                fill="none"
                className={strokeClass}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </svg>
    );
}
