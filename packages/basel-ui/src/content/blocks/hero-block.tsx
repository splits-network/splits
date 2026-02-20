import type { HeroBlock } from '@splits-network/shared-types';

export function HeroBlockComponent({ block }: { block: HeroBlock; index: number }) {
    return (
        <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
            {block.image && (
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[58%] opacity-0"
                    style={{
                        clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0% 100%)',
                    }}
                >
                    <img
                        src={block.image}
                        alt={block.imageAlt || ''}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20" />
                </div>
            )}

            <div className="relative z-10 container mx-auto px-6 lg:px-12 py-16 lg:py-28">
                <div className="max-w-2xl">
                    {block.kicker && (
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                            {block.kickerIcon && (
                                <i className={`${block.kickerIcon} mr-2`} />
                            )}
                            {block.kicker}
                        </p>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                        {block.headlineWords.map((word, i) => (
                            <span
                                key={i}
                                className={`hero-headline-word inline-block opacity-0 ${
                                    word.accent ? 'text-primary' : 'text-base-content'
                                }`}
                            >
                                {word.text}
                            </span>
                        ))}
                    </h1>

                    {block.subtitle && (
                        <p className="hero-subtitle text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-8 opacity-0">
                            {block.subtitle}
                        </p>
                    )}

                    {block.meta && block.meta.length > 0 && (
                        <div className="flex flex-wrap items-center gap-6 mb-8">
                            {block.meta.map((item, i) => (
                                <span
                                    key={i}
                                    className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0"
                                >
                                    {item.icon && (
                                        <i className={`${item.icon} mr-1`} />
                                    )}
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    )}

                    {block.buttons && block.buttons.length > 0 && (
                        <div className="hero-cta-row flex flex-wrap items-center gap-4 opacity-0">
                            {block.buttons.map((btn, i) => (
                                <a
                                    key={i}
                                    href={btn.href}
                                    className={`btn btn-md sm:btn-lg uppercase tracking-wider text-sm ${
                                        btn.variant === 'outline'
                                            ? 'btn-outline'
                                            : `btn-${btn.variant}`
                                    }`}
                                >
                                    {btn.icon && <i className={btn.icon} />}
                                    {btn.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
