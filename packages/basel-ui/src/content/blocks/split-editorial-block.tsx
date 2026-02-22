import type { SplitEditorialBlock } from '@splits-network/shared-types';

const bgMap: Record<string, string> = {
    'base-100': 'bg-base-100',
    'base-200': 'bg-base-200',
};

export function SplitEditorialBlockComponent({ block }: { block: SplitEditorialBlock; index: number }) {
    const bg = block.bg ? bgMap[block.bg] || 'bg-base-200' : 'bg-base-200';
    const kickerColor = block.kickerColor || 'text-primary';
    const isTextLeft = block.layout === 'text-left';

    const textContent = (
        <div
            className={`${isTextLeft ? 'split-text-left' : 'split-text-right'} lg:col-span-3`}
        >
            {block.kicker && (
                <p
                    className={`text-sm font-semibold uppercase tracking-[0.2em] ${kickerColor} mb-4`}
                >
                    {block.sectionNumber && `${block.sectionNumber} -- `}
                    {block.kicker}
                </p>
            )}

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                {block.heading}
            </h2>

            {block.paragraphs && block.paragraphs.length > 0 && (
                <div className="space-y-6 text-base-content/70 leading-relaxed text-lg mb-10">
                    {block.paragraphs.map((p, i) => (
                        <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                    ))}
                </div>
            )}

            {block.items && block.items.length > 0 && (
                <div className="space-y-6">
                    {block.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                            {item.icon && (
                                <div className="w-10 h-10 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                                    <i className={`${item.icon} text-primary`} />
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-lg mb-1">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-base-content/60 leading-relaxed">
                                    {item.body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const imageClip = isTextLeft
        ? 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)'
        : 'polygon(0 0, 92% 0, 100% 100%, 0% 100%)';

    const imageContent = (
        <div
            className={`${isTextLeft ? 'split-img-right' : 'split-img-left'} lg:col-span-2`}
        >
            <div className="relative overflow-hidden" style={{ clipPath: imageClip }}>
                <img
                    src={block.image}
                    alt={block.imageAlt}
                    className="w-full h-[280px] md:h-[400px] lg:h-[500px] object-cover"
                />
                {block.imageOverlayColor && (
                    <div
                        className={`absolute inset-0 bg-${block.imageOverlayColor}/10`}
                    />
                )}
            </div>
        </div>
    );

    return (
        <section className={`py-16 lg:py-28 ${bg}`}>
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-center">
                    {isTextLeft ? (
                        <>
                            {textContent}
                            {imageContent}
                        </>
                    ) : (
                        <>
                            {imageContent}
                            {textContent}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
