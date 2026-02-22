import type { ArticleBodyBlock } from '@splits-network/shared-types';

const bgMap: Record<string, string> = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
};

export function ArticleBodyBlockComponent({ block }: { block: ArticleBodyBlock; index: number }) {
    const bg = block.bg ? bgMap[block.bg] || 'bg-base-100' : 'bg-base-100';
    const kickerColor = block.kickerColor || 'text-primary';

    return (
        <section className={`py-16 lg:py-28 ${bg}`}>
            <div className="container mx-auto px-6 lg:px-12">
                <div className="article-block max-w-3xl mx-auto">
                    {block.kicker && (
                        <p
                            className={`text-sm font-semibold uppercase tracking-[0.2em] ${kickerColor} mb-4`}
                        >
                            {block.sectionNumber && `${block.sectionNumber} -- `}
                            {block.kicker}
                        </p>
                    )}

                    <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                        {block.heading}
                    </h2>

                    <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                        {block.paragraphs.map((p, i) => (
                            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
