import type { FullBleedImageBlock } from '@splits-network/shared-types';

export function FullBleedImageBlockComponent({ block }: { block: FullBleedImageBlock; index: number }) {
    const height = block.height || '45vh';

    return (
        <section
            className="inline-image relative overflow-hidden opacity-0 max-h-[60vh] sm:max-h-none"
            style={{ minHeight: height }}
        >
            <img
                src={block.image}
                alt={block.imageAlt}
                className="w-full h-full object-cover absolute inset-0"
                style={{ minHeight: height }}
            />
            <div className="absolute inset-0 bg-neutral/50" />

            {block.overlayText ? (
                <div className="absolute inset-0 flex items-center justify-center px-6">
                    <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center leading-[0.95] tracking-tight">
                        {block.overlayText}{' '}
                        {block.overlayAccentText && (
                            <span className="text-secondary">
                                {block.overlayAccentText}
                            </span>
                        )}
                    </p>
                </div>
            ) : block.caption ? (
                <div className="absolute bottom-6 left-6 lg:left-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                        {block.caption}
                    </span>
                </div>
            ) : null}
        </section>
    );
}
