"use client";

interface HeaderSectionProps {
    total: number;
    activeCount: number;
    newCount: number;
    remoteCount: number;
}

export function HeaderSection({
    total,
    activeCount,
    newCount,
    remoteCount,
}: HeaderSectionProps) {
    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    {/* Kicker */}
                    <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                        <i className="fa-duotone fa-regular fa-briefcase mr-2" />
                        Career Opportunities
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word inline-block opacity-0">
                            Find your{" "}
                        </span>
                        <span className="hero-headline-word inline-block opacity-0 text-primary">
                            next{" "}
                        </span>
                        <span className="hero-headline-word inline-block opacity-0">
                            opportunity.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10 opacity-0">
                        Browse open positions from top employers across the
                        Splits Network. Your next career move starts here.
                    </p>

                    {/* Stats */}
                    <div className="header-stat-bar flex flex-wrap gap-8 mt-8 opacity-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-briefcase text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{total}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">Total Roles</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-bolt text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{activeCount}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">Active</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-sparkles text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{newCount}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">New This Week</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-base-300 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-globe text-base-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{remoteCount}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">Remote</div>
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
