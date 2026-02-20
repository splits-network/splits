"use client";

interface HeaderSectionProps {
    total: number;
    experienced: number;
    topRated: number;
    searchInput: string;
    onSearchChange: (value: string) => void;
    onSearchClear: () => void;
}

export default function HeaderSection({
    total,
    experienced,
    topRated,
    searchInput,
    onSearchChange,
    onSearchClear,
}: HeaderSectionProps) {
    const stats = [
        { value: total, label: "Active Recruiters" },
        { value: experienced, label: "Experienced" },
        { value: topRated, label: "Top Rated" },
    ];

    return (
        <section className="relative bg-neutral text-neutral-content py-16 lg:py-20 overflow-hidden">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5"
                style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}
            />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="max-w-4xl">
                    {/* Kicker */}
                    <p className="hero-kicker opacity-0 text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                        <i className="fa-duotone fa-regular fa-users-between-lines mr-2" />
                        Recruiter Marketplace
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word opacity-0 inline-block">
                            Find your
                        </span>{" "}
                        <span className="hero-headline-word opacity-0 inline-block text-primary">
                            perfect
                        </span>{" "}
                        <span className="hero-headline-word opacity-0 inline-block">
                            recruiter.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle opacity-0 text-lg text-neutral-content/60 leading-relaxed max-w-xl mb-10">
                        Connect with expert recruiters who specialize in your
                        industry. Browse profiles, check reputation scores, and
                        start your next career move.
                    </p>

                    {/* Search bar */}
                    <div className="search-bar opacity-0 max-w-xl">
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-search absolute left-4 top-1/2 -translate-y-1/2 text-neutral-content/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search by name, specialty, or location..."
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input input-bordered w-full pl-11 bg-neutral-content/10 border-neutral-content/20 text-neutral-content placeholder:text-neutral-content/30 text-sm font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                            />
                            {searchInput && (
                                <button
                                    onClick={onSearchClear}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-content/40 hover:text-neutral-content text-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8 mt-10">
                        {stats.map((stat, i) => (
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
        </section>
    );
}
