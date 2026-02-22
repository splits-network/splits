import type { BenefitsCardsBlock } from '@splits-network/shared-types';

const bgMap: Record<string, string> = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
};

export function BenefitsCardsBlockComponent({ block }: { block: BenefitsCardsBlock; index: number }) {
    const bg = block.bg ? bgMap[block.bg] || 'bg-base-100' : 'bg-base-100';
    const cols =
        block.cards.length <= 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : block.cards.length === 3
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    return (
        <section className={`py-20 overflow-hidden ${bg}`}>
            <div className="container mx-auto px-6 lg:px-12">
                {(block.heading || block.kicker) && (
                    <div className="article-block text-center mb-12">
                        {block.kicker && (
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
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
                    {block.cards.map((card, i) => (
                        <div
                            key={i}
                            className="article-block p-5 sm:p-8 border-l-4 border-accent bg-base-100 border border-base-300 shadow-sm text-center"
                        >
                            {card.icon && (
                                <div className="w-14 h-14 mx-auto flex items-center justify-center mb-4 bg-accent/10">
                                    <i className={`${card.icon} text-2xl text-accent`} />
                                </div>
                            )}

                            <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-base-content">
                                {card.title}
                            </h3>

                            <p className="text-sm leading-relaxed text-base-content/70 mb-4">
                                {card.description}
                            </p>

                            {card.metric && (
                                <div className="pt-4 border-t border-base-300">
                                    <div className="text-2xl font-black text-accent">
                                        {card.metric}
                                    </div>
                                    {card.metricLabel && (
                                        <div className="text-xs font-bold uppercase tracking-wider text-base-content/50 mt-1">
                                            {card.metricLabel}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
