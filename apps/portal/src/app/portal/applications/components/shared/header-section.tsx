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
                    <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 scroll-reveal fade-up">
                        <i className="fa-duotone fa-regular fa-file-lines mr-2"></i>
                        Pipeline
                    </p>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word inline-block scroll-reveal fade-up">
                            Every
                        </span>{" "}
                        <span className="hero-headline-word inline-block scroll-reveal fade-up text-primary">
                            candidate.
                        </span>{" "}
                        <span className="hero-headline-word inline-block scroll-reveal fade-up">
                            One view.
                        </span>
                    </h1>

                    <p className="hero-subtitle text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10 scroll-reveal fade-up">
                        Track each application from submission through offer.
                        AI scoring, stage progression, and recruiter activity
                        — visible at every step.
                    </p>

                    <div className="header-stat-bar flex flex-wrap gap-8 mt-8 scroll-reveal fade-up">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-file-lines text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.total}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">Total</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-paper-plane text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.submitted}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">Submitted</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-comments text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.interview}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">Interview</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-base-300 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-handshake text-base-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{stats.offer}</div>
                                <div className="text-xs uppercase tracking-wider opacity-60">Offers</div>
                            </div>
                        </div>
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
