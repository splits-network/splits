"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DashboardAnimator } from "./dashboard-animator";
import CandidateDashboard from "./components/candidate-dashboard";

export default function DashboardPage() {
    const { user } = useUser();
    const [trendPeriod, setTrendPeriod] = useState(6);

    const firstName = user?.firstName || "there";

    return (
        <div className="-mx-6 -mb-6 -mt-6">
            <DashboardAnimator>
                {/* ── Compact hero greeting ── */}
                <section className="bg-base-100 py-6 sm:py-8 px-6 sm:px-8 lg:px-12 border-b border-base-200">
                    <div className="container mx-auto">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2 scroll-reveal fade-up">
                            <i className="fa-duotone fa-regular fa-grid-2 mr-2" />
                            Dashboard
                        </p>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight scroll-reveal fade-up">
                            Welcome back,{" "}
                            <span className="text-primary">{firstName}.</span>
                        </h1>
                    </div>
                </section>

                <CandidateDashboard
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
            </DashboardAnimator>
        </div>
    );
}
