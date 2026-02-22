import type { InlineImageBlock } from '@splits-network/shared-types';

export function InlineImageBlockComponent({ block }: { block: InlineImageBlock; index: number }) {
    const height = block.height || '45vh';

    return (
        <section
            className="inline-image relative overflow-hidden max-h-[60vh] sm:max-h-none"
            style={{ minHeight: height }}
        >
            <img
                src={block.image}
                alt={block.imageAlt}
                className="w-full h-full object-cover absolute inset-0"
                style={{ minHeight: height }}
            />
            <div className="absolute inset-0 bg-neutral/50" />

            {block.caption && (
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                        {block.caption}
                    </span>
                </div>
            )}
        </section>
    );
}
