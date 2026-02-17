import React from 'react';
import type { MemphisCoreColor, MemphisSize } from '../utils/types';

export interface MemphisTriangleProps {
    color?: MemphisCoreColor;
    size?: Exclude<MemphisSize, 'xs'>; // xs too small for triangle
    rotation?: number;
    className?: string;
}

/**
 * Memphis Triangle Decoration
 *
 * CSS border-based triangle using Memphis theme colors.
 * Used for decorative accents in hero sections and backgrounds.
 *
 * @example
 * <MemphisTriangle color="yellow" size="md" rotation={-15} className="absolute top-10 left-20" />
 */
export function MemphisTriangle({
    color = 'yellow',
    size = 'md',
    rotation = 0,
    className = '',
}: MemphisTriangleProps) {
    // Size variants - base, height
    const sizeMap = {
        sm: { base: 15, height: 26 }, // 15px base × 26px height
        md: { base: 25, height: 43 }, // 25px base × 43px height (original)
        lg: { base: 35, height: 60 }, // 35px base × 60px height
        xl: { base: 45, height: 77 }, // 45px base × 77px height
        '2xl': { base: 55, height: 94 }, // 55px base × 94px height
    };

    const { base, height } = sizeMap[size];
    const halfBase = base / 2;

    // Color to border-bottom class mapping
    const borderClass = `border-b-${color}-500`;

    return (
        <div
            className={`memphis-shape ${borderClass} ${className}`}
            style={{
                width: 0,
                height: 0,
                borderLeft: `${halfBase}px solid transparent`,
                borderRight: `${halfBase}px solid transparent`,
                borderBottom: `${height}px solid`,
                transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
            }}
            aria-hidden="true"
        />
    );
}
