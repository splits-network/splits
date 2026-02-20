import type { TimelineBlock } from '@splits-network/shared-types';

const bgMap: Record<string, string> = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
};

export function TimelineBlockComponent({ block }: { block: TimelineBlock; index: number }) {
    const bg = block.bg ? bgMap[block.bg] || 'bg-base-100' : 'bg-base-100';

    return (
        <section className={`py-20 overflow-hidden ${bg}`}>
            <div className="container mx-auto px-6 lg:px-12">
                {(block.heading || block.kicker) && (
                    <div className="article-block text-center mb-16 opacity-0">
                        {block.kicker && (
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
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

                <div className="max-w-3xl mx-auto">
                    {block.steps.map((step, i) => (
                        <div
                            key={i}
                            className="article-block relative flex gap-6 pb-12 last:pb-0 opacity-0"
                        >
                            {/* Timeline line */}
                            {i < block.steps.length - 1 && (
                                <div className="absolute left-5 top-12 bottom-0 w-px bg-base-300" />
                            )}

                            {/* Step number / icon */}
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary text-primary-content font-black text-sm relative z-10">
                                {step.icon ? (
                                    <i className={step.icon} />
                                ) : (
                                    step.number ?? i + 1
                                )}
                            </div>

                            {/* Content */}
                            <div className="pt-1">
                                <h3 className="font-black text-lg uppercase tracking-wide mb-2 text-base-content">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-base-content/70">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
