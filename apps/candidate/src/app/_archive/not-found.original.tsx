import Link from "next/link";

export const metadata = {
    title: "Blank Spot | Applicant Network",
};

export default function NotFound() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-dark">
            {/* ── Color Bar ─────────────────────────────────────────────── */}
            <div className="flex h-1.5">
                <div className="flex-1 bg-coral" />
                <div className="flex-1 bg-teal" />
                <div className="flex-1 bg-yellow" />
                <div className="flex-1 bg-purple" />
            </div>

            {/* ── Memphis Background Shapes ──────────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
            >
                <div className="absolute top-[12%] left-[7%] w-14 h-14 rounded-full border-4 border-purple opacity-15" />
                <div className="absolute top-[25%] right-[10%] w-10 h-10 bg-yellow opacity-10 rotate-45" />
                <div className="absolute bottom-[28%] left-[12%] w-8 h-8 bg-coral opacity-10 rotate-12" />
                <div className="absolute bottom-[15%] right-[8%] w-12 h-12 rounded-full border-4 border-teal opacity-10" />
                <div className="absolute top-[55%] right-[25%] w-6 h-6 bg-purple opacity-10" />

                {/* Plus sign */}
                <svg
                    className="absolute bottom-[40%] left-[25%] opacity-10"
                    width="26"
                    height="26"
                    viewBox="0 0 26 26"
                >
                    <line
                        x1="13"
                        y1="3"
                        x2="13"
                        y2="23"
                        className="stroke-teal"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <line
                        x1="3"
                        y1="13"
                        x2="23"
                        y2="13"
                        className="stroke-teal"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Zigzag */}
                <svg
                    className="absolute top-[70%] right-[35%] opacity-10"
                    width="70"
                    height="18"
                    viewBox="0 0 70 18"
                >
                    <polyline
                        points="0,14 9,4 18,14 27,4 36,14 45,4 54,14 63,4 70,14"
                        className="stroke-yellow"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Triangle */}
                <div
                    className="absolute top-[40%] left-[5%] opacity-10 border-b-4 border-b-purple"
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: "12px solid transparent",
                        borderRight: "12px solid transparent",
                        borderBottom: "21px solid",
                        transform: "rotate(10deg)",
                    }}
                />
            </div>

            {/* ── Main Content ───────────────────────────────────────────── */}
            <div className="relative z-10 min-h-[calc(100vh-6px)] flex flex-col items-center justify-center px-4 py-16">
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-purple text-white text-xs font-black uppercase tracking-[0.2em] mb-10">
                    Blank Spot
                </span>

                {/* ── Giant 4 ◯ 4 ────────────────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 md:gap-6 lg:gap-8 mb-10">
                    <span className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black leading-none text-purple select-none">
                        4
                    </span>
                    <div className="w-24 h-24 md:w-40 md:h-40 lg:w-52 lg:h-52 rounded-full border-4 border-yellow flex-shrink-0" />
                    <span className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black leading-none text-coral select-none">
                        4
                    </span>
                </div>

                {/* ── Message ─────────────────────────────────────────────── */}
                <div className="text-center max-w-2xl mb-12">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">
                        Empty Here. Not Out{" "}
                        <span className="text-purple relative inline-block">
                            There.
                            <span className="absolute -bottom-1 left-0 w-full h-1 bg-purple" />
                        </span>
                    </h1>
                    <p className="text-base text-white/60">
                        This page has nothing for you. The marketplace
                        does — open roles, active recruiters, and real
                        momentum waiting behind every other link.
                    </p>
                </div>

                {/* ── CTAs ────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <Link
                        href="/public/jobs"
                        className="btn btn-purple btn-lg gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-magnifying-glass" />
                        Explore Jobs
                    </Link>
                    <Link
                        href="/portal/profile"
                        className="btn btn-teal btn-outline btn-lg gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-user" />
                        View Profile
                    </Link>
                </div>

                {/* ── Quick Links ─────────────────────────────────────────── */}
                <div className="border-4 border-dark bg-white p-8 max-w-2xl w-full">
                    <h2 className="text-sm font-black uppercase tracking-wider text-dark mb-6">
                        Choose Your{" "}
                        <span className="text-purple">Move</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link
                            href="/public/jobs"
                            className="border-4 border-purple p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 transition-transform"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase text-2xl text-purple" />
                            <span className="text-sm font-black uppercase tracking-wider text-dark">
                                Jobs
                            </span>
                        </Link>
                        <Link
                            href="/portal/profile"
                            className="border-4 border-coral p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 transition-transform"
                        >
                            <i className="fa-duotone fa-regular fa-user text-2xl text-coral" />
                            <span className="text-sm font-black uppercase tracking-wider text-dark">
                                Profile
                            </span>
                        </Link>
                        <Link
                            href="/portal/applications"
                            className="border-4 border-teal p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 transition-transform"
                        >
                            <i className="fa-duotone fa-regular fa-file-lines text-2xl text-teal" />
                            <span className="text-sm font-black uppercase tracking-wider text-dark">
                                Applications
                            </span>
                        </Link>
                        <Link
                            href="/public/recruiters"
                            className="border-4 border-yellow p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 transition-transform"
                        >
                            <i className="fa-duotone fa-regular fa-users text-2xl text-yellow" />
                            <span className="text-sm font-black uppercase tracking-wider text-dark">
                                Recruiters
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ── Support ─────────────────────────────────────────────── */}
                <p className="mt-10 text-xs text-white/40">
                    Something look wrong?{" "}
                    <a
                        href="mailto:support@applicant.network"
                        className="text-purple underline"
                    >
                        support@applicant.network
                    </a>
                </p>
            </div>
        </div>
    );
}
