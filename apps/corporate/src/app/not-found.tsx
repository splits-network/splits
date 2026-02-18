import Link from "next/link";

export const metadata = {
    title: "Signal Lost | Employment Networks",
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
                {/* Circle outlines */}
                <div className="absolute top-[8%] left-[5%] w-16 h-16 rounded-full border-4 border-coral opacity-15" />
                <div className="absolute bottom-[25%] left-[22%] w-12 h-12 rounded-full border-4 border-teal opacity-10" />
                <div className="absolute bottom-[12%] right-[15%] w-14 h-14 rounded-full bg-purple opacity-10" />

                {/* Filled squares */}
                <div className="absolute top-[22%] right-[8%] w-10 h-10 bg-teal opacity-10 rotate-45" />
                <div className="absolute top-[60%] left-[8%] w-8 h-8 bg-yellow opacity-10 rotate-12" />
                <div className="absolute top-[75%] right-[30%] w-6 h-6 border-4 border-coral opacity-10 rotate-45" />

                {/* Plus sign */}
                <svg
                    className="absolute top-[42%] right-[12%] opacity-10"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                >
                    <line
                        x1="15"
                        y1="3"
                        x2="15"
                        y2="27"
                        className="stroke-yellow"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <line
                        x1="3"
                        y1="15"
                        x2="27"
                        y2="15"
                        className="stroke-yellow"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Zigzag */}
                <svg
                    className="absolute bottom-[18%] left-[35%] opacity-10"
                    width="80"
                    height="20"
                    viewBox="0 0 80 20"
                >
                    <polyline
                        points="0,16 10,4 20,16 30,4 40,16 50,4 60,16 70,4 80,16"
                        className="stroke-purple"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Triangle */}
                <div
                    className="absolute top-[35%] left-[15%] opacity-10 border-b-4 border-b-coral"
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: "14px solid transparent",
                        borderRight: "14px solid transparent",
                        borderBottom: "24px solid",
                        transform: "rotate(-15deg)",
                    }}
                />
            </div>

            {/* ── Main Content ───────────────────────────────────────────── */}
            <div className="relative z-10 min-h-[calc(100vh-6px)] flex flex-col items-center justify-center px-4 py-16">
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-coral text-white text-xs font-black uppercase tracking-[0.2em] mb-10">
                    Signal Lost
                </span>

                {/* ── Giant 4 ◯ 4 ────────────────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 md:gap-6 lg:gap-8 mb-10">
                    <span className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black leading-none text-coral select-none">
                        4
                    </span>
                    <div className="w-24 h-24 md:w-40 md:h-40 lg:w-52 lg:h-52 rounded-full border-4 border-teal flex-shrink-0" />
                    <span className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black leading-none text-yellow select-none">
                        4
                    </span>
                </div>

                {/* ── Message ─────────────────────────────────────────────── */}
                <div className="text-center max-w-2xl mb-12">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">
                        The Signal Dropped. The{" "}
                        <span className="text-coral relative inline-block">
                            Network
                            <span className="absolute -bottom-1 left-0 w-full h-1 bg-coral" />
                        </span>{" "}
                        Didn&apos;t.
                    </h1>
                    <p className="text-base text-white/60">
                        You followed a link that leads nowhere. Meanwhile,
                        split-fee recruiting is reshaping how talent moves
                        across every industry vertical.
                    </p>
                </div>

                {/* ── CTAs ────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <Link
                        href="/"
                        className="btn btn-coral btn-lg gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-house" />
                        Back to Home
                    </Link>
                    <a
                        href="https://splits.network"
                        className="btn btn-teal btn-outline btn-lg gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-handshake" />
                        Open Splits Network
                    </a>
                </div>

                {/* ── Quick Link Cards ────────────────────────────────────── */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
                    <h2 className="md:col-span-3 text-sm font-black uppercase tracking-wider text-white/50 mb-0">
                        Find Your <span className="text-coral">Signal</span>
                    </h2>

                    {/* For Recruiters */}
                    <div className="border-4 border-coral bg-white p-6 text-center">
                        <div className="w-12 h-12 border-4 border-coral flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-users-between-lines text-xl text-coral" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-dark mb-2">
                            For Recruiters
                        </h3>
                        <p className="text-base text-dark/50 mb-4">
                            Access the marketplace where every recruiter is a
                            potential partner
                        </p>
                        <a
                            href="https://splits.network"
                            className="btn btn-coral btn-sm"
                        >
                            Start Splitting
                        </a>
                    </div>

                    {/* For Job Seekers */}
                    <div className="border-4 border-teal bg-white p-6 text-center">
                        <div className="w-12 h-12 border-4 border-teal flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-briefcase text-xl text-teal" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-dark mb-2">
                            For Job Seekers
                        </h3>
                        <p className="text-base text-dark/50 mb-4">
                            Recruiters compete to represent you, not the other
                            way around
                        </p>
                        <a
                            href="https://applicant.network"
                            className="btn btn-teal btn-sm"
                        >
                            Browse Jobs
                        </a>
                    </div>

                    {/* Contact */}
                    <div className="border-4 border-purple bg-white p-6 text-center">
                        <div className="w-12 h-12 border-4 border-purple flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-xl text-purple" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-dark mb-2">
                            Reach Out
                        </h3>
                        <p className="text-base text-dark/50 mb-4">
                            Direct line to our team. No bots, no ticket numbers
                        </p>
                        <a
                            href="mailto:support@employment-networks.com"
                            className="btn btn-purple btn-sm"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>

                {/* ── Error Reference ─────────────────────────────────────── */}
                <p className="mt-12 text-xs text-white/30 font-mono uppercase tracking-wider">
                    Error 404 — Signal Not Found
                </p>
            </div>
        </div>
    );
}
