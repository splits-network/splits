import type { StatsBarBlock } from '@splits-network/shared-types';

const bgMap: Record<string, { bg: string; text: string }> = {
    neutral: { bg: 'bg-neutral', text: 'text-neutral-content' },
    'base-100': { bg: 'bg-base-100', text: 'text-base-content' },
    'base-200': { bg: 'bg-base-200', text: 'text-base-content' },
};

export function StatsBarBlockComponent({ block }: { block: StatsBarBlock; index: number }) {
    const theme = bgMap[block.bg || 'neutral'] || bgMap.neutral;
    const cols =
        block.stats.length <= 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : block.stats.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4';

    return (
        <section className={`stats-bar ${theme.bg} ${theme.text} py-10`}>
            <div className="container mx-auto px-6">
                <div className={`grid ${cols} gap-8 text-center`}>
                    {block.stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`stat-item opacity-0 ${
                                stat.borderColor ? `border-l-4 border-${stat.borderColor} p-6` : ''
                            }`}
                        >
                            <div className="text-3xl md:text-4xl font-black tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-sm uppercase tracking-wider opacity-70 mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
