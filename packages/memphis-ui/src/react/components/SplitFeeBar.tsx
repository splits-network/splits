import React from 'react';

export interface SplitFeeBarProps {
    /** Left side percentage (0-100) */
    leftPercent: number;
    /** Left side label */
    leftLabel?: string;
    /** Right side label */
    rightLabel?: string;
    /** Custom class name */
    className?: string;
}

/**
 * SplitFeeBar - Split fee visualization bar
 *
 * Memphis compliant horizontal bar showing a percentage split between two parties.
 * Uses coral for the left side and teal for the right side.
 * Extracted from details-six showcase.
 */
export function SplitFeeBar({
    leftPercent,
    leftLabel = 'Sourcing',
    rightLabel = 'Closing',
    className = '',
}: SplitFeeBarProps) {
    const rightPercent = 100 - leftPercent;

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-center accent-coral">
                    <p className="text-2xl font-black text-accent">
                        {leftPercent}%
                    </p>
                    <p
                        className="text-[10px] font-bold uppercase text-dark/50"
                    >
                        {leftLabel}
                    </p>
                </div>
                <div
                    className="w-8 h-8 flex items-center justify-center border-xs"
                >
                    <i className="fa-solid fa-slash text-xs text-dark" />
                </div>
                <div className="text-center accent-teal">
                    <p className="text-2xl font-black text-accent">
                        {rightPercent}%
                    </p>
                    <p
                        className="text-[10px] font-bold uppercase text-dark/50"
                    >
                        {rightLabel}
                    </p>
                </div>
            </div>
            <div
                className="flex h-3 border-2 overflow-hidden border-dark"
            >
                <div
                    className="h-full accent-coral bg-accent"
                    style={{ width: `${leftPercent}%` }}
                />
                <div
                    className="h-full accent-teal bg-accent"
                    style={{ width: `${rightPercent}%` }}
                />
            </div>
        </div>
    );
}
