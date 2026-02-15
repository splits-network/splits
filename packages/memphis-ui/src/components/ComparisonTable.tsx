import React from 'react';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface ComparisonRow {
    /** Feature name */
    feature: string;
    /** Values for each tier (true = checkmark, false = dash, string = text) */
    values: (boolean | string)[];
}

export interface ComparisonTier {
    /** Tier name */
    name: string;
    /** Header color (hex) */
    color: string;
}

export interface ComparisonTableProps {
    /** Tier columns */
    tiers: ComparisonTier[];
    /** Comparison rows */
    rows: ComparisonRow[];
    /** Custom class name */
    className?: string;
}

/**
 * ComparisonTable - Feature comparison table
 *
 * Memphis compliant table comparing features across pricing tiers.
 * Boolean values render as checkmarks or dashes, strings render as text.
 * Extracted from pricing-six showcase.
 */
export function ComparisonTable({
    tiers,
    rows,
    className = '',
}: ComparisonTableProps) {
    return (
        <div
            className={['border-4 overflow-hidden', className]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: '#1A1A2E', backgroundColor: '#FFFFFF' }}
        >
            <table className="w-full">
                <thead>
                    <tr style={{ backgroundColor: '#1A1A2E' }}>
                        <th
                            className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider"
                            style={{ color: '#FFFFFF' }}
                        >
                            Feature
                        </th>
                        {tiers.map((tier, i) => (
                            <th
                                key={i}
                                className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider"
                                style={{ color: tier.color }}
                            >
                                {tier.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr
                            key={i}
                            className="border-b-2"
                            style={{ borderColor: '#F5F0EB' }}
                        >
                            <td
                                className="px-6 py-3 text-xs font-bold"
                                style={{ color: '#1A1A2E' }}
                            >
                                {row.feature}
                            </td>
                            {row.values.map((val, vi) => (
                                <td key={vi} className="px-4 py-3 text-center">
                                    {val === true ? (
                                        <div
                                            className="w-5 h-5 mx-auto flex items-center justify-center"
                                            style={{ backgroundColor: ACCENT_HEX.teal }}
                                        >
                                            <i
                                                className="fa-solid fa-check text-[8px]"
                                                style={{ color: '#1A1A2E' }}
                                            />
                                        </div>
                                    ) : val === false ? (
                                        <span
                                            className="text-xs"
                                            style={{ color: '#1A1A2E', opacity: 0.2 }}
                                        >
                                            --
                                        </span>
                                    ) : (
                                        <span
                                            className="text-xs font-bold"
                                            style={{ color: '#1A1A2E' }}
                                        >
                                            {val}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
