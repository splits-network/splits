import React from 'react';

export interface ComparisonRow {
    /** Feature name */
    feature: string;
    /** Values for each tier (true = checkmark, false = dash, string = text) */
    values: (boolean | string)[];
}

export interface ComparisonTier {
    /** Tier name */
    name: string;
    /** Header color (hex or CSS variable) */
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
 * Uses Memphis `.table` CSS class for base table styling.
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
            className={['overflow-hidden border-4 border-solid border-dark', className]
                .filter(Boolean)
                .join(' ')}
        >
            <table className="table">
                <thead>
                    <tr>
                        <th className="text-left">
                            Feature
                        </th>
                        {tiers.map((tier, i) => (
                            <th
                                key={i}
                                className="text-center"
                                style={{ color: tier.color }}
                            >
                                {tier.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            <td className="font-bold text-dark">
                                {row.feature}
                            </td>
                            {row.values.map((val, vi) => (
                                <td key={vi} className="text-center">
                                    {val === true ? (
                                        <div
                                            className="w-5 h-5 mx-auto flex items-center justify-center bg-teal"
                                        >
                                            <i
                                                className="fa-solid fa-check text-[8px] text-dark"
                                            />
                                        </div>
                                    ) : val === false ? (
                                        <span
                                            className="text-xs text-dark opacity-20"
                                        >
                                            --
                                        </span>
                                    ) : (
                                        <span
                                            className="text-sm font-bold text-dark"
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
