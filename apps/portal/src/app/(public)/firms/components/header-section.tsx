"use client";

interface HeaderSectionProps {
    total: number;
    candidateFirms: number;
    companyFirms: number;
}

export function HeaderSection({
    total,
    candidateFirms,
    companyFirms,
}: HeaderSectionProps) {
    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    {/* Kicker */}
                    <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 scroll-reveal fade-up">
                        <i className="fa-duotone fa-regular fa-building-columns mr-2" />
                        Recruiting Firms
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word inline-block scroll-reveal fade-up">
                            Partner{" "}
                        </span>
                        <span className="hero-headline-word inline-block scroll-reveal fade-up text-primary">
                            better.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10 scroll-reveal fade-up">
                        Discover marketplace-approved recruiting firms and
                        connect with your next split-fee partner.
                    </p>

                    {/* Stats */}
                    <div className="header-stat-bar flex flex-wrap gap-8 mt-8 scroll-reveal fade-up">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building-columns text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{total}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Active Firms
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-handshake text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {candidateFirms}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Candidate Firms
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-paper-plane text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {companyFirms}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Company Firms
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagonal clip-path accent */}
            <div
                className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            />
        </section>
    );
}
