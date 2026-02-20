"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { DashboardAnimator } from "./dashboard-animator";
import CandidateDashboard from "./components/candidate-dashboard";

const PERIODS = [
    { label: "3M", value: 3 },
    { label: "6M", value: 6 },
    { label: "1Y", value: 12 },
    { label: "2Y", value: 24 },
];

export default function DashboardPage() {
    const { user } = useUser();
    const [trendPeriod, setTrendPeriod] = useState(6);

    const firstName = user?.firstName || "there";

    return (
        // Break out of the portal layout's bg-base-300 p-6 wrapper
        // so Basel sections can span full width with their own backgrounds
        <div className="-mx-6 -mb-6 -mt-6">
            <DashboardAnimator>
                {/* ═══════════════════════════════════════════════════════
                HERO HEADER — Editorial Basel pattern
               ═══════════════════════════════════════════════════════ */}
                <section className="relative py-16 lg:py-20 bg-base-100">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-3xl">
                            {/* Kicker */}
                            <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-6 opacity-0">
                                <i className="fa-duotone fa-regular fa-grid-2 mr-2" />
                                Dashboard
                            </p>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                                <span className="hero-headline-word inline-block opacity-0">
                                    Welcome back,
                                </span>{" "}
                                <span className="hero-headline-word inline-block opacity-0 text-primary">
                                    {firstName}.
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="hero-subtitle text-lg text-base-content/60 leading-relaxed max-w-xl mb-8 opacity-0">
                                Here&apos;s an overview of your job search.
                                Track your applications, monitor your momentum,
                                and take the next step in your career.
                            </p>

                            {/* Hero actions */}
                            <div className="hero-actions flex flex-wrap items-center gap-3 opacity-0">
                                {/* Trend period selector */}
                                <div className="flex gap-1 bg-base-200 p-1">
                                    {PERIODS.map((p) => (
                                        <button
                                            key={p.value}
                                            onClick={() =>
                                                setTrendPeriod(p.value)
                                            }
                                            className={`btn btn-sm ${
                                                trendPeriod === p.value
                                                    ? "btn-primary"
                                                    : "btn-ghost"
                                            }`}
                                            style={{ borderRadius: 0 }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="hidden lg:block w-px h-6 bg-base-content/10" />

                                <Link
                                    href="/jobs"
                                    className="btn btn-primary btn-sm"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-search w-3.5" />
                                    Browse Jobs
                                </Link>
                                <Link
                                    href="/portal/profile"
                                    className="btn btn-ghost btn-sm"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-user w-3.5" />
                                    My Profile
                                </Link>
                                <Link
                                    href="/portal/documents"
                                    className="btn btn-ghost btn-sm"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-file-lines w-3.5" />
                                    Documents
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Diagonal clip-path accent */}
                    <div
                        className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block"
                        style={{
                            clipPath:
                                "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                        }}
                    />
                </section>

                {/* ═══════════════════════════════════════════════════════
                DASHBOARD CONTENT
               ═══════════════════════════════════════════════════════ */}
                <CandidateDashboard
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
            </DashboardAnimator>
        </div>
    );
}
