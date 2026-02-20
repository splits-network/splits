'use client';

import { useState } from 'react';
import type { FaqBlock } from '@splits-network/shared-types';

const bgMap: Record<string, { bg: string; text: string }> = {
    neutral: { bg: 'bg-neutral', text: 'text-neutral-content' },
    'base-100': { bg: 'bg-base-100', text: 'text-base-content' },
    'base-200': { bg: 'bg-base-200', text: 'text-base-content' },
};

export function FaqBlockComponent({ block }: { block: FaqBlock; index: number }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const theme = bgMap[block.bg || 'base-100'] || bgMap['base-100'];

    return (
        <section className={`py-20 overflow-hidden ${theme.bg} ${theme.text}`}>
            <div className="container mx-auto px-6 lg:px-12">
                {(block.heading || block.kicker) && (
                    <div className="article-block text-center mb-12 opacity-0">
                        {block.kicker && (
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                {block.kicker}
                            </span>
                        )}
                        {block.heading && (
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                                {block.heading}
                            </h2>
                        )}
                        {block.subtitle && (
                            <p className="mt-4 text-lg opacity-60 max-w-2xl mx-auto">
                                {block.subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className="max-w-3xl mx-auto space-y-3">
                    {block.items.map((item, i) => (
                        <div
                            key={i}
                            className="faq-card border border-base-300 opacity-0"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-bold text-base pr-4">
                                    {item.question}
                                </span>
                                <i
                                    className={`fa-duotone fa-regular ${
                                        openIndex === i ? 'fa-minus' : 'fa-plus'
                                    } flex-shrink-0 text-primary`}
                                />
                            </button>

                            {openIndex === i && (
                                <div className="px-6 pb-6 text-sm leading-relaxed opacity-70">
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
