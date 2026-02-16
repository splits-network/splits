import React from 'react';

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
 * Uses `.progress` CSS class with Memphis color variants:
 * - 90+ = teal (excellent)
 * - 75+ = yellow (good)
 * - below 75 = coral (needs improvement)
 */
export function ScoreBar({ score, showLabel = true, className = '' }: ScoreBarProps) {
    const colorClass =
        score >= 90
            ? 'progress-teal'
            : score >= 75
              ? 'progress-yellow'
              : 'progress-coral';

    const labelColorVar =
        score >= 90
            ? 'var(--color-teal)'
            : score >= 75
              ? 'var(--color-yellow)'
              : 'var(--color-coral)';

    const clampedScore = Math.min(100, Math.max(0, score));

    return (
        <div
            className={['flex items-center gap-2', className].filter(Boolean).join(' ')}
        >
            <progress
                className={`progress ${colorClass} w-12`}
                value={clampedScore}
                max={100}
            />
            {showLabel && (
                <span className="text-xs font-bold" style={{ color: labelColorVar }}>
                    {score}
                </span>
            )}
        </div>
    );
}
