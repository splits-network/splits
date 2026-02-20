import type { FeatureGridBlock } from '@splits-network/shared-types';

const bgMap: Record<string, string> = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
};

const colsMap: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function FeatureGridBlockComponent({ block }: { block: FeatureGridBlock; index: number }) {
    const bg = block.bg ? bgMap[block.bg] || 'bg-base-100' : 'bg-base-100';
    const cols = colsMap[block.columns || 3] || colsMap[3];

    return (
        <section className={`py-20 overflow-hidden ${bg}`}>
            <div className="container mx-auto px-6 lg:px-12">
                {(block.heading || block.kicker) && (
                    <div className="article-block text-center mb-12 opacity-0">
                        {block.kicker && (
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-primary text-primary-content">
                                {block.kicker}
                            </span>
                        )}
                        {block.heading && (
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                {block.heading}
                            </h2>
                        )}
                        {block.subtitle && (
                            <p className="mt-4 text-lg text-base-content/60 max-w-2xl mx-auto">
                                {block.subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className={`grid ${cols} gap-6`}>
                    {block.items.map((item, i) => (
                        <div
                            key={i}
                            className="article-block p-5 sm:p-8 border-l-4 border-primary bg-base-100 border border-base-300 shadow-sm opacity-0"
                        >
                            {item.icon && (
                                <div
                                    className={`w-14 h-14 flex items-center justify-center mb-4 ${
                                        item.iconColor
                                            ? `bg-${item.iconColor}`
                                            : 'bg-primary/10'
                                    }`}
                                >
                                    <i
                                        className={`${item.icon} text-2xl ${
                                            item.iconColor
                                                ? `text-${item.iconColor}-content`
                                                : 'text-primary'
                                        }`}
                                    />
                                </div>
                            )}

                            {item.badge && (
                                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3 bg-accent/10 text-accent">
                                    {item.badge}
                                </span>
                            )}

                            <h3 className="font-black text-xl uppercase tracking-wide mb-4 text-base-content">
                                {item.title}
                            </h3>

                            <p className="text-sm leading-relaxed text-base-content/75">
                                {item.description}
                            </p>

                            {item.stats && (
                                <div className="mt-4 pt-4 border-t border-base-300">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                        {item.stats}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
