import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blank Spot | Applicant Network",
};

/**
 * Memphis 404 — Candidate (Applicant Network)
 *
 * Design: "Blank Spot" — asymmetric split layout on desktop
 * (text left, compass illustration right), single column on mobile.
 * Empowering, bold — redirects candidates back into the marketplace.
 */
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
                <div className="absolute top-[15%] left-[5%] w-12 h-12 rounded-full border-4 border-purple opacity-10" />
                <div className="absolute top-[30%] right-[8%] w-8 h-8 bg-coral opacity-10 rotate-45" />
                <div className="absolute bottom-[20%] left-[20%] w-6 h-6 bg-yellow opacity-10" />
                <div className="absolute bottom-[40%] right-[6%] w-10 h-10 rounded-full border-4 border-teal opacity-10" />
                <svg
                    className="absolute bottom-[30%] right-[25%] opacity-10"
                    width="70"
                    height="18"
                    viewBox="0 0 70 18"
                >
                    <polyline
                        points="0,14 9,4 18,14 27,4 36,14 45,4 54,14 63,4 70,14"
                        className="stroke-purple"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
                <svg
                    className="absolute top-[55%] left-[12%] opacity-10"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                >
                    <line
                        x1="12"
                        y1="2"
                        x2="12"
                        y2="22"
                        className="stroke-teal"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <line
                        x1="2"
                        y1="12"
                        x2="22"
                        y2="12"
                        className="stroke-teal"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* ── Main Content ───────────────────────────────────────────── */}
            <div className="relative z-10 min-h-[calc(100vh-6px)] flex flex-col items-center justify-center px-4 py-16">
                {/* ── Two-column on desktop ──────────────────────────────── */}
                <div className="flex flex-col lg:flex-row items-center gap-12 max-w-4xl w-full mb-16">
                    {/* Left: Text + CTAs */}
                    <div className="lg:flex-1 text-center lg:text-left">
                        <span className="inline-block px-4 py-1.5 bg-purple text-white text-xs font-black uppercase tracking-[0.2em] mb-6">
                            Blank Spot
                        </span>

                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">
                            Empty Here. Not Out{" "}
                            <span className="text-purple relative inline-block">
                                There.
                                <span className="absolute -bottom-1 left-0 w-full h-1 bg-purple" />
                            </span>
                        </h1>

                        <p className="text-base text-white/60 mb-8">
                            This page has nothing for you. The marketplace does
                            — open roles, active recruiters, and real momentum
                            waiting behind every other link.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
                    </div>

                    {/* Right: Compass Rose Illustration */}
                    <div className="lg:flex-1 flex justify-center">
                        <div
                            className="relative w-48 h-48"
                            aria-hidden="true"
                        >
                            {/* Outer circle */}
                            <div className="absolute inset-4 rounded-full border-4 border-purple" />
                            {/* Cardinal directions — 4 color bars */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-purple" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-coral" />
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 h-1.5 w-12 bg-teal" />
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 h-1.5 w-12 bg-yellow" />
                            {/* Center question mark */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <i className="fa-solid fa-question text-3xl text-purple opacity-30" />
                            </div>
                            {/* Memphis accents */}
                            <div className="absolute -top-3 -left-3 w-6 h-6 bg-coral rotate-12" />
                            <div className="absolute -bottom-2 -right-4 w-5 h-5 rounded-full border-4 border-yellow" />
                            <div className="absolute top-4 -right-5 w-4 h-4 bg-teal rotate-45" />
                        </div>
                    </div>
                </div>

                {/* ── Quick Links ─────────────────────────────────────────── */}
                <div className="border-4 border-dark bg-white p-8 max-w-2xl w-full">
                    <h2 className="text-sm font-black uppercase tracking-wider text-dark mb-6 text-center">
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

                {/* ── Support Footer ─────────────────────────────────────── */}
                <p className="mt-8 text-xs text-white/40">
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
