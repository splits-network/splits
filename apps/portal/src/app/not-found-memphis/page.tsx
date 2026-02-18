import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Off the Map | Splits Network",
};

/**
 * Memphis 404 — Portal (Splits Network)
 *
 * Design: "Off the Map" — centered white card on dark background
 * (auth-page style), with map-pin illustration, heading, links.
 * Functional, direct — gets recruiters back to work fast.
 * Completely self-contained, no imports from the original not-found.tsx.
 */
export default function NotFoundMemphis() {
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
                <div className="absolute top-[12%] right-[8%] w-10 h-10 rounded-full border-4 border-teal opacity-10" />
                <div className="absolute bottom-[20%] left-[10%] w-8 h-8 bg-coral opacity-10 rotate-12" />
                <div className="absolute top-[50%] left-[6%] w-6 h-6 rounded-full bg-yellow opacity-10" />
                <div className="absolute bottom-[35%] right-[12%] w-7 h-7 bg-purple opacity-10 rotate-45" />
                <svg
                    className="absolute top-[20%] left-[30%] opacity-10"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                >
                    <line
                        x1="12"
                        y1="2"
                        x2="12"
                        y2="22"
                        className="stroke-purple"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <line
                        x1="2"
                        y1="12"
                        x2="22"
                        y2="12"
                        className="stroke-purple"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* ── Main Content ───────────────────────────────────────────── */}
            <div className="relative z-10 min-h-[calc(100vh-6px)] flex flex-col items-center justify-center px-4 py-16">
                {/* ── Centered Card ──────────────────────────────────────── */}
                <div className="border-4 border-teal bg-white w-full max-w-lg">
                    {/* Top color strip */}
                    <div className="h-1.5 bg-teal" />

                    <div className="p-8 text-center">
                        {/* Map Illustration — pin with X on a gridded frame */}
                        <div
                            className="relative w-36 h-36 mx-auto mb-6"
                            aria-hidden="true"
                        >
                            {/* Map frame */}
                            <div className="absolute inset-2 border-4 border-teal" />
                            {/* Grid lines */}
                            <div className="absolute top-1/2 inset-x-4 h-px bg-teal opacity-20" />
                            <div className="absolute inset-y-4 left-1/2 w-px bg-teal opacity-20" />
                            {/* Map pin — circle + stem */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center">
                                    <i className="fa-solid fa-xmark text-sm text-white" />
                                </div>
                                <div className="w-1.5 h-5 bg-coral -mt-0.5" />
                            </div>
                            {/* Memphis accents */}
                            <div className="absolute -top-1 -right-2 w-5 h-5 rounded-full bg-yellow" />
                            <div className="absolute -bottom-2 -left-1 w-6 h-6 bg-purple rotate-45" />
                        </div>

                        {/* Badge */}
                        <span className="inline-block px-4 py-1.5 bg-teal text-dark text-xs font-black uppercase tracking-[0.2em] mb-6">
                            Off the Map
                        </span>

                        {/* Heading */}
                        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-dark mb-3">
                            Lost Page. Your{" "}
                            <span className="text-teal">Pipeline</span> Is
                            Intact.
                        </h1>

                        {/* Body */}
                        <p className="text-base text-dark/60 mb-8">
                            This URL goes nowhere. Every role, candidate, and
                            active split you&apos;re tracking is still right
                            where you left it.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                            <Link
                                href="/portal/dashboard"
                                className="btn btn-teal btn-md gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-gauge-high" />
                                Open Dashboard
                            </Link>
                            <Link
                                href="/portal/roles"
                                className="btn btn-coral btn-outline btn-md gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase" />
                                View Roles
                            </Link>
                        </div>

                        {/* ── Divider ────────────────────────────────────── */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-dark/10" />
                            <span className="text-xs font-black uppercase tracking-wider text-dark/40">
                                Back to Your{" "}
                                <span className="text-teal">Desk</span>
                            </span>
                            <div className="flex-1 h-px bg-dark/10" />
                        </div>

                        {/* ── Quick Links ────────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/portal/dashboard"
                                className="btn btn-teal btn-outline btn-sm gap-2 justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-gauge-high" />
                                Dashboard
                            </Link>
                            <Link
                                href="/portal/roles"
                                className="btn btn-coral btn-outline btn-sm gap-2 justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase" />
                                Roles
                            </Link>
                            <Link
                                href="/portal/candidates"
                                className="btn btn-purple btn-outline btn-sm gap-2 justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-users" />
                                Candidates
                            </Link>
                            <Link
                                href="/portal/invitations"
                                className="btn btn-yellow btn-outline btn-sm gap-2 justify-start"
                            >
                                <i className="fa-duotone fa-regular fa-envelope" />
                                Invitations
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Support Footer ─────────────────────────────────────── */}
                <p className="mt-8 text-xs text-white/40">
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
