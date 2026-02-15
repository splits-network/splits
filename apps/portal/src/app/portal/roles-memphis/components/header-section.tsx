import { ACCENT } from "./accent";

interface HeaderSectionProps {
    stats: {
        total: number;
        active: number;
        newJobs: number;
        totalApps: number;
    };
}

export function HeaderSection({ stats }: HeaderSectionProps) {
    return (
        <section className="relative overflow-hidden py-16 bg-dark">
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
                            <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="header-badge inline-block mb-6 opacity-0">
                        <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                            <i className="fa-duotone fa-regular fa-briefcase" />
                            Role Management
                        </span>
                    </div>

                    <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                        Manage{" "}
                        <span className="relative inline-block">
                            <span className="text-coral">Your Roles</span>
                            <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                        </span>
                    </h1>

                    <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/70 opacity-0">
                        Browse, filter, and manage all job roles across your
                        network. Split-fee recruiting, made transparent.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {[
                            { label: "Total Roles", value: stats.total, accent: ACCENT[0] },
                            { label: "Active", value: stats.active, accent: ACCENT[1] },
                            { label: "New", value: stats.newJobs, accent: ACCENT[2] },
                            { label: "Applications", value: stats.totalApps, accent: ACCENT[3] },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className={`stat-pill flex items-center gap-2 px-4 py-2 border-2 opacity-0 ${stat.accent.border}`}
                            >
                                <span className={`text-lg font-black ${stat.accent.text}`}>
                                    {stat.value}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
