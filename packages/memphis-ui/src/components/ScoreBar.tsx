import React from 'react';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface ScoreBarProps {
    /** Score value (0-100) */
    score: number;
    /** Whether to show the numeric label */
    showLabel?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * ScoreBar - Score progress bar with color coding
 *
 * Memphis compliant horizontal bar that color-codes by score threshold:
 * - 90+ = teal (excellent)
 * - 75+ = yellow (good)
 * - below 75 = coral (needs improvement)
 * Extracted from tables-six showcase.
 */
export function ScoreBar({ score, showLabel = true, className = '' }: ScoreBarProps) {
    const color =
        score >= 90
            ? ACCENT_HEX.teal
            : score >= 75
              ? ACCENT_HEX.yellow
              : ACCENT_HEX.coral;

    return (
        <div
            className={['flex items-center gap-2', className].filter(Boolean).join(' ')}
        >
            <div
                className="w-12 h-1.5 border"
                style={{ borderColor: 'rgba(26,26,46,0.1)' }}
            >
                <div
                    className="h-full"
                    style={{ width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: color }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-bold" style={{ color }}>
                    {score}
                </span>
            )}
        </div>
    );
}
