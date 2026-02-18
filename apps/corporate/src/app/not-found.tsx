import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Signal Lost | Employment Networks",
};

/**
 * Memphis 404 — Corporate (Employment Networks)
 *
 * Design: "Signal Lost" — dark hero with broken-signal illustration,
 * manifesto headline, then cream-bg card section below.
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
                <div className="absolute top-[10%] left-[6%] w-12 h-12 rounded-full border-4 border-teal opacity-10" />
                <div className="absolute top-[25%] right-[10%] w-8 h-8 bg-yellow opacity-10 rotate-45" />
                <div className="absolute bottom-[40%] left-[15%] w-6 h-6 bg-purple opacity-10" />
                <div className="absolute top-[60%] right-[20%] w-10 h-10 rounded-full border-4 border-coral opacity-10" />
                <svg
                    className="absolute bottom-[25%] left-[35%] opacity-10"
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
                <svg
                    className="absolute top-[45%] left-[8%] opacity-10"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                >
                    <line
                        x1="12"
                        y1="2"
                        x2="12"
                        y2="22"
                        className="stroke-yellow"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <line
                        x1="2"
                        y1="12"
                        x2="22"
                        y2="12"
                        className="stroke-yellow"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* ── Dark Hero Section ──────────────────────────────────────── */}
            <div className="relative z-10 flex flex-col items-center px-4 pt-20 pb-16">
                {/* Signal Lost Illustration — broken compass/signal */}
                <div
                    className="relative w-40 h-40 mx-auto mb-10"
                    aria-hidden="true"
                >
                    {/* Outer ring */}
                    <div className="absolute inset-4 rounded-full border-4 border-coral" />
                    {/* Diagonal slash through the ring */}
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 160 160"
                    >
                        <line
                            x1="40"
                            y1="30"
                            x2="120"
                            y2="130"
                            className="stroke-coral"
                            strokeWidth="4"
                            strokeLinecap="square"
                        />
                    </svg>
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-coral" />
                    </div>
                    {/* Memphis accents */}
                    <div className="absolute -top-2 -right-3 w-6 h-6 bg-yellow rotate-12" />
                    <div className="absolute -bottom-1 -left-3 w-5 h-5 rounded-full border-4 border-teal" />
                    <div className="absolute top-1 -left-5 w-4 h-4 rotate-45 border-4 border-purple" />
                </div>

                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-coral text-white text-xs font-black uppercase tracking-[0.2em] mb-6">
                    Signal Lost
                </span>

                {/* Headline */}
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4 text-center max-w-3xl">
                    The Signal Dropped. The{" "}
                    <span className="text-coral relative inline-block">
                        Network
                        <span className="absolute -bottom-1 left-0 w-full h-1 bg-coral" />
                    </span>{" "}
                    Didn&apos;t.
                </h1>

                {/* Body */}
                <p className="text-base text-white/60 text-center max-w-xl mb-10">
                    You followed a link that leads nowhere. Meanwhile, split-fee
                    recruiting is reshaping how talent moves across every industry
                    vertical.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/" className="btn btn-coral btn-lg gap-2">
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
            </div>

            {/* ── Cream Card Section ─────────────────────────────────────── */}
            <div className="bg-cream relative z-10 px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-sm font-black uppercase tracking-wider text-dark mb-8 text-center">
                        Find Your{" "}
                        <span className="text-coral">Signal</span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* For Recruiters */}
                        <div className="border-4 border-coral bg-white p-6 text-center relative overflow-hidden">
                            <div className="h-1.5 bg-coral absolute top-0 left-0 right-0" />
                            <div className="w-12 h-12 border-4 border-coral flex items-center justify-center mx-auto mb-4 mt-2">
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
                        <div className="border-4 border-teal bg-white p-6 text-center relative overflow-hidden">
                            <div className="h-1.5 bg-teal absolute top-0 left-0 right-0" />
                            <div className="w-12 h-12 border-4 border-teal flex items-center justify-center mx-auto mb-4 mt-2">
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

                        {/* Reach Out */}
                        <div className="border-4 border-purple bg-white p-6 text-center relative overflow-hidden">
                            <div className="h-1.5 bg-purple absolute top-0 left-0 right-0" />
                            <div className="w-12 h-12 border-4 border-purple flex items-center justify-center mx-auto mb-4 mt-2">
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
                </div>
            </div>

            {/* ── Bottom Color Bar + Footer ──────────────────────────────── */}
            <div className="flex h-1.5">
                <div className="flex-1 bg-coral" />
                <div className="flex-1 bg-teal" />
                <div className="flex-1 bg-yellow" />
                <div className="flex-1 bg-purple" />
            </div>
            <div className="bg-dark py-4 text-center">
                <p className="text-xs text-white/30 font-mono uppercase tracking-wider">
                    Error 404 — Signal Not Found
                </p>
            </div>
        </div>
    );
}
