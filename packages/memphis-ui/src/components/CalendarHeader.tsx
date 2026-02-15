import React from 'react';

export interface CalendarHeaderProps {
    /** Month name (e.g. "February") */
    month: string;
    /** Year (e.g. 2026) */
    year: number;
    /** Called when previous button is clicked */
    onPrev: () => void;
    /** Called when next button is clicked */
    onNext: () => void;
    /** View mode options for toggle buttons */
    viewModes?: string[];
    /** Currently active view mode */
    activeViewMode?: string;
    /** Called when a view mode is selected */
    onViewModeChange?: (mode: string) => void;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    yellow: '#FFE66D',
};

/**
 * CalendarHeader - Memphis-styled calendar navigation header
 *
 * Month/year display with prev/next buttons and optional view mode toggle.
 * Extracted from calendars-six showcase.
 */
export function CalendarHeader({
    month,
    year,
    onPrev,
    onNext,
    viewModes,
    activeViewMode,
    onViewModeChange,
    className = '',
}: CalendarHeaderProps) {
    return (
        <div className={['flex flex-wrap items-center justify-between gap-4', className].filter(Boolean).join(' ')}>
            {/* Navigation */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onPrev}
                    className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
                    style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, color: COLORS.dark }}
                >
                    <i className="fa-duotone fa-solid fa-chevron-left" />
                </button>
                <h2
                    className="text-2xl font-black uppercase tracking-tight"
                    style={{ color: COLORS.dark }}
                >
                    {month} {year}
                </h2>
                <button
                    onClick={onNext}
                    className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
                    style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, color: COLORS.dark }}
                >
                    <i className="fa-duotone fa-solid fa-chevron-right" />
                </button>
            </div>

            {/* View mode toggle */}
            {viewModes && onViewModeChange && (
                <div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}` }}>
                    {viewModes.map((v, i) => (
                        <button
                            key={v}
                            onClick={() => onViewModeChange(v)}
                            className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-colors"
                            style={{
                                background: activeViewMode === v ? COLORS.dark : '#fff',
                                color: activeViewMode === v ? COLORS.yellow : COLORS.dark,
                                borderRight: i < viewModes.length - 1 ? `2px solid ${COLORS.dark}` : 'none',
                            }}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
