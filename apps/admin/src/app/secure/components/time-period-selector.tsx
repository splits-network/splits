'use client';

import React from 'react';
import type { TimePeriod } from '@/hooks/use-admin-stats';

const PERIODS: { label: string; value: TimePeriod }[] = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '1y', value: '1y' },
    { label: 'All', value: 'all' },
];

interface TimePeriodSelectorProps {
    value: TimePeriod;
    onChange: (period: TimePeriod) => void;
}

export function TimePeriodSelector({ value, onChange }: TimePeriodSelectorProps) {
    return (
        <div className="join">
            {PERIODS.map((p) => (
                <button
                    key={p.value}
                    className={`join-item btn btn-sm ${value === p.value ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => onChange(p.value)}
                    type="button"
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}
