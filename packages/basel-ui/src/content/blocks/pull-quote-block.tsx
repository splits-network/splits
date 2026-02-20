import type { PullQuoteBlock } from '@splits-network/shared-types';

const bgMap: Record<string, { bg: string; text: string; border: string }> = {
    neutral: { bg: 'bg-neutral', text: 'text-neutral-content', border: 'border-secondary' },
    primary: { bg: 'bg-primary', text: 'text-primary-content', border: 'border-primary-content/20' },
    secondary: { bg: 'bg-secondary', text: 'text-secondary-content', border: 'border-secondary-content/20' },
    'base-100': { bg: 'bg-base-100', text: 'text-base-content', border: 'border-primary' },
    'base-200': { bg: 'bg-base-200', text: 'text-base-content', border: 'border-primary' },
};

export function PullQuoteBlockComponent({ block }: { block: PullQuoteBlock; index: number }) {
    const theme = bgMap[block.bg || 'neutral'] || bgMap.neutral;
    const isCentered = block.style === 'centered';

    return (
        <section className={`pull-quote-block py-20 ${theme.bg} ${theme.text} opacity-0`}>
            <div className="container mx-auto px-6 lg:px-12">
                <div
                    className={`max-w-4xl mx-auto ${
                        isCentered ? 'text-center' : `border-l-4 ${theme.border} pl-8 lg:pl-12`
                    }`}
                >
                    {!isCentered && (
                        <i className={`fa-duotone fa-regular fa-quote-left text-4xl ${theme.text}/30 mb-6 block`} />
                    )}
                    {isCentered && (
                        <i className={`fa-duotone fa-regular fa-quote-left text-4xl ${theme.text}/20 mb-6 block`} />
                    )}

                    <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                        &ldquo;{block.quote}&rdquo;
                    </blockquote>

                    {block.citation && (
                        <cite className={`text-sm uppercase tracking-[0.2em] ${theme.text}/50 not-italic`}>
                            -- {block.citation}
                        </cite>
                    )}
                </div>
            </div>
        </section>
    );
}
