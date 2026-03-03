"use client";

const ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

interface GridCardStatsProps {
    stats: { label: string; value: string; icon: string }[];
}

export function GridCardStats({ stats }: GridCardStatsProps) {
    if (stats.length === 0) return null;

    return (
        <div className="border-b border-base-300">
            <div
                className="grid divide-x divide-base-300"
                style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
            >
                {stats.map((stat, i) => {
                    const iconStyle = ICON_STYLES[i % ICON_STYLES.length];
                    return (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2.5 px-3 py-4"
                        >
                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconStyle}`}>
                                <i className={`${stat.icon} text-xs`} />
                            </div>
                            <div>
                                <span className="text-lg font-black text-base-content leading-none block">
                                    {stat.value}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 leading-none">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
