export function HeaderSection() {
    return (
        <section className="bg-dark -mx-2 -mt-2">
            <div className="relative overflow-hidden py-16 bg-dark -mx-2 -mt-4">
                {/* Memphis shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-4 border-teal opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[8%] w-12 h-12 rounded-full bg-coral opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-8 h-8 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[20%] w-10 h-10 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[20%] right-[35%] w-16 h-6 -rotate-6 border-4 border-teal opacity-0" />
                    <div className="memphis-shape absolute top-[45%] left-[25%] w-8 h-8 rotate-45 bg-coral opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[50%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-yellow"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="header-badge inline-block mb-6 opacity-0">
                            <span className="badge badge-teal badge-lg">
                                <i className="fa-duotone fa-regular fa-gear" />
                                Settings
                            </span>
                        </div>

                        <h1 className="header-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                            Company{" "}
                            <span className="relative inline-block">
                                <span className="text-teal">Settings</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                            </span>
                        </h1>

                        <p className="header-subtitle text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/70 opacity-0">
                            Manage your company profile, billing configuration,
                            and team members in one place.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
