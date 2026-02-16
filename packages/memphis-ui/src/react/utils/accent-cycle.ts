import { useState, useCallback } from 'react';

/**
 * Memphis accent color palette for cycling through colors.
 */
export const ACCENT_COLORS = ['coral', 'teal', 'yellow', 'purple'] as const;

export type AccentColor = (typeof ACCENT_COLORS)[number];

/**
 * Hex values for each accent color.
 */
export const ACCENT_HEX: Record<AccentColor, string> = {
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
    purple: '#A78BFA',
};

/**
 * Light (transparent) hex values for each accent color.
 */
export const ACCENT_HEX_LIGHT: Record<AccentColor, string> = {
    coral: '#FF6B6B20',
    teal: '#4ECDC420',
    yellow: '#FFE66D20',
    purple: '#A78BFA20',
};

/**
 * Text color (for contrast) appropriate for each accent background.
 */
export const ACCENT_TEXT: Record<AccentColor, string> = {
    coral: '#FFFFFF',
    teal: '#1A1A2E',
    yellow: '#1A1A2E',
    purple: '#FFFFFF',
};

/**
 * Get an accent color name by index, cycling through the palette.
 */
export function getAccentColor(index: number): AccentColor {
    return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

/**
 * Get the hex value for an accent color by index.
 */
export function getAccentHex(index: number): string {
    return ACCENT_HEX[getAccentColor(index)];
}

/**
 * Get the light hex value for an accent color by index.
 */
export function getAccentHexLight(index: number): string {
    return ACCENT_HEX_LIGHT[getAccentColor(index)];
}

/**
 * Get the text color for an accent color by index.
 */
export function getAccentText(index: number): string {
    return ACCENT_TEXT[getAccentColor(index)];
}

/**
 * Hook for cycling through accent colors.
 * Returns the current accent color and a function to advance to the next.
 */
export function useAccentCycle(startIndex: number = 0) {
    const [index, setIndex] = useState(startIndex);

    const next = useCallback(() => {
        setIndex((prev) => (prev + 1) % ACCENT_COLORS.length);
    }, []);

    const reset = useCallback(() => {
        setIndex(startIndex);
    }, [startIndex]);

    return {
        color: getAccentColor(index),
        hex: getAccentHex(index),
        hexLight: getAccentHexLight(index),
        textColor: getAccentText(index),
        index,
        next,
        reset,
    };
}
