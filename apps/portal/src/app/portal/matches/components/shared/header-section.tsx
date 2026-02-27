interface HeaderSectionProps {
    stats: {
        total: number;
        newThisWeek: number;
        excellentCount: number;
        avgScore: number;
    };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    {/* Kicker */}
                    <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                        <i className="fa-duotone fa-regular fa-bullseye mr-2" />
                        Matches
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word inline-block opacity-0">
                            Your matched
                        </span>{" "}
                        <span className="hero-headline-word inline-block opacity-0 text-primary">
                            candidates.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10 opacity-0">
                        Scored candidate recommendations for your active roles.
                    </p>

                    {/* Stats */}
                    <div className="header-stat-bar flex flex-wrap gap-8 mt-8 opacity-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-bullseye text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.total}</div>
                                <div className="text-sm uppercase tracking-wider opacity-60">Total Matches</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-sparkles text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.newThisWeek}</div>
                                <div className="text-sm uppercase tracking-wider opacity-60">New This Week</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-stars text-success-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.excellentCount}</div>
                                <div className="text-sm uppercase tracking-wider opacity-60">Excellent</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-chart-bar text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.avgScore}</div>
                                <div className="text-sm uppercase tracking-wider opacity-60">Avg Score</div>
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
