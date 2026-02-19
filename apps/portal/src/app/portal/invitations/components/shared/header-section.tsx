interface HeaderSectionProps {
    stats: {
        total: number;
        pending: number;
        accepted: number;
        declined: number;
    };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    {/* Kicker */}
                    <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                        <i className="fa-duotone fa-regular fa-paper-plane mr-2" />
                        Candidate Invitations
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word inline-block opacity-0">
                            Track every
                        </span>{" "}
                        <span className="hero-headline-word inline-block opacity-0 text-primary">
                            invitation,
                        </span>{" "}
                        <span className="hero-headline-word inline-block opacity-0">
                            transparently.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10 opacity-0">
                        Manage your candidate representation invitations.
                        Consent-based recruiting, built on trust.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8">
                        {[
                            { value: stats.total.toString(), label: "Total" },
                            { value: stats.pending.toString(), label: "Pending" },
                            { value: stats.accepted.toString(), label: "Representing" },
                            { value: stats.declined.toString(), label: "Declined" },
                        ].map((stat, i) => (
                            <div key={i} className="hero-stat opacity-0">
                                <div className="text-2xl font-black tracking-tight text-primary">
                                    {stat.value}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-neutral-content/40">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
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
