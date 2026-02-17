interface HeaderSectionProps {
    stats: {
        total: number;
        totalEarnings: number;
        thisYearEarnings: number;
        avgCommission: number;
    };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    const formatCurrency = (amount: number) => {
        if (amount >= 1000) {
            return `$${Math.round(amount / 1000)}K`;
        }
        return `$${amount}`;
    };

    return (
        <section className="bg-dark -mx-2 -mt-2">
            <div className="relative overflow-hidden py-16 bg-dark -mx-2 -mt-4">
                {/* Memphis shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[4%] w-20 h-20 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[50%] right-[6%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[10%] left-[12%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[20%] right-[18%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[25%] right-[30%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[22%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] right-[42%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-teal"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="header-badge inline-block mb-6 opacity-0">
                            <span className="badge badge-coral badge-lg">
                                <i className="fa-duotone fa-regular fa-handshake" />
                                Placements
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                            Placement{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Tracker</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/70 opacity-0">
                            Track filled roles, monitor guarantee periods, and manage
                            split-fee commissions across your recruiting network.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="retro-metrics grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full">
                {[
                    {
                        label: "Total",
                        value: stats.total,
                        color: "bg-coral",
                        fg: "text-coral-content",
                    },
                    {
                        label: "Total Earnings",
                        value: formatCurrency(stats.totalEarnings),
                        color: "bg-teal",
                        fg: "text-teal-content",
                    },
                    {
                        label: `${new Date().getFullYear()} Earnings`,
                        value: formatCurrency(stats.thisYearEarnings),
                        color: "bg-yellow",
                        fg: "text-yellow-content",
                    },
                    {
                        label: "Avg. Commission",
                        value: formatCurrency(stats.avgCommission),
                        color: "bg-purple",
                        fg: "text-purple-content",
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`metric-block metric-block-sm ${stat.color} ${stat.fg}`}
                    >
                        <div className="retro-metric-value">{stat.value}</div>
                        <div className="retro-metric-label">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
