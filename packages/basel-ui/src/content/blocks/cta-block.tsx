import type { CtaBlock } from '@splits-network/shared-types';

const bgMap: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary', text: 'text-primary-content' },
    secondary: { bg: 'bg-secondary', text: 'text-secondary-content' },
    neutral: { bg: 'bg-neutral', text: 'text-neutral-content' },
    'base-100': { bg: 'bg-base-100', text: 'text-base-content' },
};

export function CtaBlockComponent({ block }: { block: CtaBlock; index: number }) {
    const theme = bgMap[block.bg || 'primary'] || bgMap.primary;

    return (
        <section className={`final-cta py-16 lg:py-28 ${theme.bg} ${theme.text}`}>
            <div className="container mx-auto px-6 lg:px-12">
                <div className="final-cta-content max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                        {block.heading}
                    </h2>

                    {block.subtitle && (
                        <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            {block.subtitle}
                        </p>
                    )}

                    {block.buttons.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            {block.buttons.map((btn, i) => (
                                <a
                                    key={i}
                                    href={btn.href}
                                    className={`btn btn-lg ${
                                        btn.variant === 'outline'
                                            ? 'btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                                            : 'bg-white text-primary hover:bg-white/90 border-0 shadow-lg'
                                    }`}
                                >
                                    {btn.icon && <i className={btn.icon} />}
                                    {btn.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {block.contactEmail && (
                        <p className="text-sm opacity-60">
                            Questions?{' '}
                            <a
                                href={`mailto:${block.contactEmail}`}
                                className="underline hover:opacity-100 transition-opacity"
                            >
                                {block.contactEmail}
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
