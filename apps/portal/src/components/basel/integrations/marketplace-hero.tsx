"use client";

interface MarketplaceHeroProps {
    activeCount: number;
}

export function MarketplaceHero({ activeCount }: MarketplaceHeroProps) {
    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20 overflow-hidden">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
            />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative z-10 container mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-5 gap-10 items-end">
                    {/* Left: Title */}
                    <div className="lg:col-span-3">
                        <p className="mkt-kicker text-sm font-semibold uppercase tracking-widest text-secondary mb-4 opacity-0">
                            Integrations
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-4">
                            <span className="mkt-title-word inline-block opacity-0">
                                Connect
                            </span>{" "}
                            <span className="mkt-title-word inline-block opacity-0">
                                your
                            </span>{" "}
                            <span className="mkt-title-word inline-block opacity-0 text-primary">
                                tools.
                            </span>
                        </h1>
                        <p className="mkt-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            Link your calendar, email, and recruiting tools to
                            streamline your workflow and keep everything in sync.
                        </p>
                    </div>

                    {/* Right: Stats strip */}
                    <div className="lg:col-span-2 flex gap-6 lg:justify-end">
                        <div className="mkt-desc opacity-0">
                            <p className="text-3xl font-black text-primary">{activeCount}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-content/40">
                                Connected
                            </p>
                        </div>
                        <div className="w-px bg-neutral-content/10" />
                        <div className="mkt-desc opacity-0">
                            <p className="text-3xl font-black text-secondary">4</p>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-content/40">
                                Available
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
