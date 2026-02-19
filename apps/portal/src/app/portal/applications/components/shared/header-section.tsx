/* ─── Basel Editorial Hero Header for Applications ───────────────────────── */

interface HeaderSectionProps {
    stats: {
        total: number;
        submitted: number;
        interview: number;
        offer: number;
    };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                        <i className="fa-duotone fa-regular fa-file-lines mr-2"></i>
                        Pipeline
                    </p>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word inline-block opacity-0">
                            Every
                        </span>{" "}
                        <span className="hero-headline-word inline-block opacity-0 text-primary">
                            candidate.
                        </span>{" "}
                        <span className="hero-headline-word inline-block opacity-0">
                            One view.
                        </span>
                    </h1>

                    <p className="hero-subtitle text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10 opacity-0">
                        Track each application from submission through offer.
                        AI scoring, stage progression, and recruiter activity
                        — visible at every step.
                    </p>

                    <div className="flex flex-wrap gap-8">
                        {[
                            { value: stats.total.toString(), label: "Total" },
                            { value: stats.submitted.toString(), label: "Submitted" },
                            { value: stats.interview.toString(), label: "Interviewing" },
                            { value: stats.offer.toString(), label: "Offers" },
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

            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            />
        </section>
    );
}
