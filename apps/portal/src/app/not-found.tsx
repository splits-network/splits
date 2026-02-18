import Link from "next/link";

export const metadata = {
    title: "Off the Map | Splits Network",
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
                <div className="absolute top-[10%] right-[6%] w-14 h-14 rounded-full border-4 border-teal opacity-15" />
                <div className="absolute top-[50%] left-[5%] w-10 h-10 bg-coral opacity-10 rotate-45" />
                <div className="absolute bottom-[20%] right-[20%] w-12 h-12 rounded-full bg-yellow opacity-10" />
                <div className="absolute top-[30%] left-[18%] w-8 h-8 border-4 border-purple opacity-10" />
                <div className="absolute bottom-[35%] left-[30%] w-6 h-6 bg-teal opacity-10 rotate-12" />

                {/* Plus sign */}
                <svg
                    className="absolute top-[65%] right-[10%] opacity-10"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                >
                    <line
                        x1="12"
                        y1="2"
                        x2="12"
                        y2="22"
                        className="stroke-coral"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <line
                        x1="2"
                        y1="12"
                        x2="22"
                        y2="12"
                        className="stroke-coral"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Zigzag */}
                <svg
                    className="absolute top-[18%] left-[40%] opacity-10"
                    width="70"
                    height="18"
                    viewBox="0 0 70 18"
                >
                    <polyline
                        points="0,14 9,4 18,14 27,4 36,14 45,4 54,14 63,4 70,14"
                        className="stroke-teal"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* ── Main Content ───────────────────────────────────────────── */}
            <div className="relative z-10 min-h-[calc(100vh-6px)] flex flex-col items-center justify-center px-4 py-16">
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-teal text-dark text-xs font-black uppercase tracking-[0.2em] mb-10">
                    Off the Map
                </span>

                {/* ── Giant 4 ◯ 4 ────────────────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 md:gap-6 lg:gap-8 mb-10">
                    <span className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black leading-none text-teal select-none">
                        4
                    </span>
                    <div className="w-24 h-24 md:w-40 md:h-40 lg:w-52 lg:h-52 rounded-full border-4 border-coral flex-shrink-0" />
                    <span className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black leading-none text-purple select-none">
                        4
                    </span>
                </div>

                {/* ── Message ─────────────────────────────────────────────── */}
                <div className="text-center max-w-2xl mb-12">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">
                        Lost Page. Your{" "}
                        <span className="text-teal relative inline-block">
                            Pipeline
                            <span className="absolute -bottom-1 left-0 w-full h-1 bg-teal" />
                        </span>{" "}
                        Is Intact.
                    </h1>
                    <p className="text-base text-white/60">
                        This URL goes nowhere. Every role, candidate, and active
                        split you&apos;re tracking is still right where you left
                        it.
                    </p>
                </div>

                {/* ── CTAs ────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <Link
                        href="/portal/dashboard"
                        className="btn btn-teal btn-lg gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-gauge-high" />
                        Open Dashboard
                    </Link>
                    <Link
                        href="/portal/roles"
                        className="btn btn-coral btn-outline btn-lg gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-briefcase" />
                        View Roles
                    </Link>
                </div>

                {/* ── Quick Links ─────────────────────────────────────────── */}
                <div className="border-4 border-dark bg-white p-8 max-w-2xl w-full">
                    <h2 className="text-sm font-black uppercase tracking-wider text-dark mb-6">
                        Back to Your{" "}
                        <span className="text-teal">Desk</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/portal/dashboard"
                            className="btn btn-teal btn-outline gap-2 justify-start"
                        >
                            <i className="fa-duotone fa-regular fa-gauge-high" />
                            Dashboard
                        </Link>
                        <Link
                            href="/portal/roles"
                            className="btn btn-coral btn-outline gap-2 justify-start"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase" />
                            Roles
                        </Link>
                        <Link
                            href="/portal/candidates"
                            className="btn btn-purple btn-outline gap-2 justify-start"
                        >
                            <i className="fa-duotone fa-regular fa-users" />
                            Candidates
                        </Link>
                        <Link
                            href="/portal/invitations"
                            className="btn btn-yellow btn-outline gap-2 justify-start"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            Invitations
                        </Link>
                    </div>
                </div>

                {/* ── Support ─────────────────────────────────────────────── */}
                <p className="mt-10 text-xs text-white/40">
                    Something broken?{" "}
                    <a
                        href="mailto:support@splits.network"
                        className="text-teal underline"
                    >
                        support@splits.network
                    </a>
                </p>
            </div>
        </div>
    );
}
