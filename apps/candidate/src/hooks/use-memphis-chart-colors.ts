'use client';

import { useState, useEffect } from 'react';

export interface MemphisChartColors {
    coral: string;
    teal: string;
    yellow: string;
    purple: string;
    dark: string;
    darkGray: string;
    cream: string;
    white: string;
}

/** SSR-safe fallback values matching memphis.css */
const FALLBACK: MemphisChartColors = {
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
    purple: '#A78BFA',
    dark: '#1A1A2E',
    darkGray: '#2D2D44',
    cream: '#F5F0EB',
    white: '#FFFFFF',
};

function readColorsFromCSS(): MemphisChartColors {
    if (typeof document === 'undefined') return FALLBACK;

    const s = getComputedStyle(document.documentElement);
    return {
        coral: s.getPropertyValue('--color-coral').trim() || FALLBACK.coral,
        teal: s.getPropertyValue('--color-teal').trim() || FALLBACK.teal,
        yellow: s.getPropertyValue('--color-yellow').trim() || FALLBACK.yellow,
        purple: s.getPropertyValue('--color-purple').trim() || FALLBACK.purple,
        dark: s.getPropertyValue('--color-dark').trim() || FALLBACK.dark,
        darkGray: s.getPropertyValue('--color-dark-gray').trim() || FALLBACK.darkGray,
        cream: s.getPropertyValue('--color-cream').trim() || FALLBACK.cream,
        white: s.getPropertyValue('--color-white').trim() || FALLBACK.white,
    };
}

/**
 * Theme-reactive Memphis chart colors.
 * Reads from CSS custom properties and re-reads on theme switch.
 */
export function useMemphisChartColors(): MemphisChartColors {
    const [colors, setColors] = useState<MemphisChartColors>(FALLBACK);

    useEffect(() => {
        setColors(readColorsFromCSS());

        const observer = new MutationObserver(() => {
            setColors(readColorsFromCSS());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

    return colors;
}

/** Series color order for multi-dataset charts */
export function getSeriesColors(colors: MemphisChartColors): string[] {
    return [colors.coral, colors.teal, colors.yellow, colors.purple];
}
