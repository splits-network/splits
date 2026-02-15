import React from 'react';
import { ACCENT_COLORS, ACCENT_HEX, type AccentColor } from '../utils/accent-cycle';

export interface AccentCycleProps {
    children: (color: AccentColor, hex: string, index: number) => React.ReactNode;
    count?: number;
    startIndex?: number;
}

/**
 * Memphis Accent Cycle
 *
 * Utility render-prop component that cycles through accent colors.
 * Useful for rendering lists of items with rotating accent colors.
 *
 * Usage:
 * ```tsx
 * <AccentCycle count={items.length}>
 *   {(color, hex, index) => (
 *     <Card key={index} accent={color}>...</Card>
 *   )}
 * </AccentCycle>
 * ```
 */
export function AccentCycle({ children, count = 4, startIndex = 0 }: AccentCycleProps) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => {
                const colorIndex = (startIndex + i) % ACCENT_COLORS.length;
                const color = ACCENT_COLORS[colorIndex];
                const hex = ACCENT_HEX[color];
                return children(color, hex, i);
            })}
        </>
    );
}
