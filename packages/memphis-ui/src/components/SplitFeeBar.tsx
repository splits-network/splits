import React from 'react';
import { ACCENT_HEX } from '../utils/accent-cycle';

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
                <div className="text-center">
                    <p className="text-2xl font-black" style={{ color: ACCENT_HEX.coral }}>
                        {leftPercent}%
                    </p>
                    <p
                        className="text-[10px] font-bold uppercase"
                        style={{ color: '#1A1A2E', opacity: 0.5 }}
                    >
                        {leftLabel}
                    </p>
                </div>
                <div
                    className="w-8 h-8 flex items-center justify-center border-2"
                    style={{ borderColor: '#1A1A2E' }}
                >
                    <i className="fa-solid fa-slash text-xs" style={{ color: '#1A1A2E' }} />
                </div>
                <div className="text-center">
                    <p className="text-2xl font-black" style={{ color: ACCENT_HEX.teal }}>
                        {rightPercent}%
                    </p>
                    <p
                        className="text-[10px] font-bold uppercase"
                        style={{ color: '#1A1A2E', opacity: 0.5 }}
                    >
                        {rightLabel}
                    </p>
                </div>
            </div>
            <div
                className="flex h-3 border-2 overflow-hidden"
                style={{ borderColor: '#1A1A2E' }}
            >
                <div
                    className="h-full"
                    style={{ width: `${leftPercent}%`, backgroundColor: ACCENT_HEX.coral }}
                />
                <div
                    className="h-full"
                    style={{ width: `${rightPercent}%`, backgroundColor: ACCENT_HEX.teal }}
                />
            </div>
        </div>
    );
}
