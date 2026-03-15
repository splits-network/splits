interface LeaderboardHeroProps {
    title: string;
    subtitle: string;
}

export function LeaderboardHero({ title, subtitle }: LeaderboardHeroProps) {
    return (
        <section className="relative bg-base-300 text-base-content py-16 lg:py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6">
                        <i className="fa-duotone fa-regular fa-ranking-star mr-2" />
                        Rankings
                    </p>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="scroll-reveal fade-up inline-block">
                            {title}
                        </span>{" "}
                        <span className="scroll-reveal fade-up inline-block text-primary">
                            Leaderboard.
                        </span>
                    </h1>

                    <p className="scroll-reveal fade-up text-lg text-base-content/60 leading-relaxed max-w-xl mb-10">
                        {subtitle}
                    </p>

                    <div className="scroll-reveal fade-up flex flex-wrap gap-8 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-check-double text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">247</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Placements
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user-tie text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">84</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Recruiters
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">31</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Companies
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
