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
    return (
        <section className="relative bg-base-300 text-base-content py-16 lg:py-20 overflow-hidden">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            />

            <div className="container mx-auto px-6 lg:px-12 relative ">
                <div className="max-w-4xl">
                    {/* Kicker */}
                    <p className="hero-kicker scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                        <i className="fa-duotone fa-regular fa-users-between-lines mr-2" />
                        Recruiter Marketplace
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="hero-headline-word scroll-reveal fade-up inline-block">
                            Find your
                        </span>{" "}
                        <span className="hero-headline-word scroll-reveal fade-up inline-block text-primary">
                            perfect
                        </span>{" "}
                        <span className="hero-headline-word scroll-reveal fade-up inline-block">
                            recruiter.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle scroll-reveal fade-up text-lg text-base-content/60 leading-relaxed max-w-xl mb-10">
                        Connect with expert recruiters who specialize in your
                        industry. Browse profiles, check reputation scores, and
                        start your next career move.
                    </p>

                    {/* Search bar */}
                    <div className="search-bar scroll-reveal fade-up max-w-xl">
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-search absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search by name, specialty, or location..."
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input input-bordered w-full pl-11 bg-neutral-content/10 border-neutral-content/20 text-base-content placeholder:text-base-content/30 text-sm font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                            />
                            {searchInput && (
                                <button
                                    onClick={onSearchClear}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content text-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="header-stat-bar flex flex-wrap gap-8 mt-10 scroll-reveal fade-up">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-users text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {total}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Active Recruiters
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-medal text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {experienced}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Experienced
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-star text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {topRated}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Top Rated
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
