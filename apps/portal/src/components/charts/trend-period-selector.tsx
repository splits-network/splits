'use client';

// Time period options - shared across all charts
export const TIME_PERIODS = [
    { value: 3, label: '3M' },
    { value: 6, label: '6M' },
    { value: 12, label: '1Y' },
    { value: 24, label: '2Y' },
] as const;

interface TrendPeriodSelectorProps {
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
}

export function TrendPeriodSelector({ trendPeriod, onTrendPeriodChange }: TrendPeriodSelectorProps) {
    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="text-xs text-base-content/50 hover:text-base-content cursor-pointer flex items-center gap-1 transition-colors"
            >
                {TIME_PERIODS.find(p => p.value === trendPeriod)?.label || '6M'}
                <i className="fa-duotone fa-regular fa-chevron-down text-[10px]"></i>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-20 p-1 shadow-lg border border-base-300 mt-1">
                {TIME_PERIODS.map((period) => (
                    <li key={period.value}>
                        <button
                            className={`text-xs justify-center ${trendPeriod === period.value ? 'active' : ''}`}
                            onClick={() => onTrendPeriodChange(period.value)}
                        >
                            {period.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
