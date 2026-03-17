"use client";

interface MarketplaceHeroProps {
    activeCount: number;
}

export function MarketplaceHero({ activeCount }: MarketplaceHeroProps) {
    return (
        <section className="relative bg-base-300 text-base-content py-16 lg:py-20 overflow-hidden">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
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

            <div className="relative  container mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-5 gap-10 items-end">
                    {/* Left: Title */}
                    <div className="lg:col-span-3">
                        <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
                            Integrations
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-4">
                            <span className="scroll-reveal fade-up inline-block">
                                Connect
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block">
                                your
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block text-primary">
                                tools.
                            </span>
                        </h1>
                        <p className="scroll-reveal fade-up text-base text-base-content/50 max-w-xl">
                            Link your calendar, email, and recruiting tools to
                            streamline your workflow and keep everything in
                            sync.
                        </p>
                    </div>

                    {/* Right: Stats strip */}
                    <div className="lg:col-span-2 flex gap-6 lg:justify-end">
                        <div className="scroll-reveal fade-up">
                            <p className="text-3xl font-black text-primary">
                                {activeCount}
                            </p>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                                Connected
                            </p>
                        </div>
                        <div className="w-px bg-base-content/10" />
                        <div className="scroll-reveal fade-up">
                            <p className="text-3xl font-black text-secondary">
                                4
                            </p>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                                Available
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
