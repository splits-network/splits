"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ═════════════════════════════════════════════════════════════════════════════
// EMPTY STATE 1 — No Search Results
// ═════════════════════════════════════════════════════════════════════════════

function NoSearchResults() {
    return (
        <div className="border-2 border-neutral/10 bg-base-100">
            {/* Mock search bar */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center gap-3">
                <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/20 text-sm" />
                <span className="text-sm text-base-content/40 tracking-tight">quantum blockchain recruiter specialist...</span>
                <div className="flex-1" />
                <span className="px-2 py-0.5 bg-base-200 text-[8px] uppercase tracking-[0.15em] font-bold text-base-content/20">
                    0 results
                </span>
            </div>

            {/* Empty state content */}
            <div className="py-20 px-6 text-center">
                <div className="relative inline-block mb-8">
                    <div className="text-[8rem] font-black tracking-tighter text-neutral/4 select-none leading-none">
                        00
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-magnifying-glass text-3xl text-base-content/8" />
                    </div>
                </div>

                <h3 className="text-xl font-black tracking-tight mb-2">No Results Found</h3>
                <p className="text-sm text-base-content/40 max-w-sm mx-auto mb-8 leading-relaxed">
                    We couldn't find any matches for your search. Try adjusting your
                    filters or using different keywords.
                </p>

                <div className="space-y-3 max-w-xs mx-auto">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/25 font-bold">
                        Suggestions
                    </p>
                    <div className="grid grid-cols-1 gap-[2px] bg-neutral/10">
                        {[
                            { icon: "fa-spell-check", text: "Check your spelling" },
                            { icon: "fa-filter-slash", text: "Remove some filters" },
                            { icon: "fa-arrows-rotate", text: "Try broader search terms" },
                            { icon: "fa-bell", text: "Set up an alert for this search" },
                        ].map((tip) => (
                            <div key={tip.text} className="bg-base-100 flex items-center gap-3 px-4 py-3 text-left">
                                <i className={`fa-duotone fa-regular ${tip.icon} text-xs text-base-content/15 w-4 text-center`} />
                                <span className="text-xs text-base-content/40 tracking-tight">{tip.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-[2px] justify-center mt-8">
                    <button className="px-5 py-2.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors">
                        Clear Search
                    </button>
                    <button className="px-5 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors">
                        Browse All
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// EMPTY STATE 2 — First-Time User / No Data
// ═════════════════════════════════════════════════════════════════════════════

function NoDataYet() {
    return (
        <div className="border-2 border-neutral/10 bg-base-100">
            {/* Mock header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-neutral/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-briefcase text-[10px] text-base-content/20" />
                    </div>
                    <span className="text-xs font-bold tracking-tight text-base-content/40">My Job Listings</span>
                </div>
                <button className="px-3 py-1.5 bg-neutral text-neutral-content text-[9px] uppercase tracking-[0.2em] font-black">
                    + New
                </button>
            </div>

            <div className="py-20 px-6 text-center">
                <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 border-2 border-dashed border-neutral/10 flex items-center justify-center mx-auto">
                        <i className="fa-duotone fa-regular fa-folder-open text-3xl text-base-content/8" />
                    </div>
                </div>

                <h3 className="text-xl font-black tracking-tight mb-2">Welcome to Splits Network</h3>
                <p className="text-sm text-base-content/40 max-w-md mx-auto mb-8 leading-relaxed">
                    You haven't created any job listings yet. Post your first role and
                    connect with our network of 12,000+ verified recruiters.
                </p>

                {/* Getting started steps */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="grid grid-cols-3 gap-[2px] bg-neutral/10">
                        {[
                            { step: "01", label: "Create a Role", icon: "fa-plus", desc: "Define the position" },
                            { step: "02", label: "Set Terms", icon: "fa-handshake", desc: "Configure split fee" },
                            { step: "03", label: "Go Live", icon: "fa-rocket", desc: "Publish to network" },
                        ].map((item) => (
                            <div key={item.step} className="bg-base-100 p-5 text-center">
                                <span className="text-xl font-black tracking-tighter text-neutral/10 block mb-2">
                                    {item.step}
                                </span>
                                <i className={`fa-duotone fa-regular ${item.icon} text-base-content/15 mb-2 block`} />
                                <div className="text-[10px] font-bold tracking-tight mb-0.5">{item.label}</div>
                                <div className="text-[8px] text-base-content/25 uppercase tracking-[0.1em]">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="px-6 py-3 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.3em] font-black hover:bg-primary hover:text-primary-content transition-colors flex items-center gap-2 mx-auto">
                    <i className="fa-duotone fa-regular fa-plus text-xs" />
                    Post Your First Role
                </button>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// EMPTY STATE 3 — Error / Something Went Wrong
// ═════════════════════════════════════════════════════════════════════════════

function ErrorState() {
    return (
        <div className="border-2 border-error/20 bg-base-100">
            {/* Error bar */}
            <div className="px-6 py-3 bg-error/5 border-b border-error/10 flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-xs" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-error">
                    Service Unavailable
                </span>
                <div className="flex-1" />
                <span className="text-[9px] text-base-content/20 tracking-wide">
                    Error 503
                </span>
            </div>

            <div className="py-20 px-6 text-center">
                <div className="relative inline-block mb-8">
                    <div className="text-[8rem] font-black tracking-tighter text-error/5 select-none leading-none">
                        !!
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-error/15 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-bolt text-2xl text-error/20" />
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-black tracking-tight mb-2">Something Went Wrong</h3>
                <p className="text-sm text-base-content/40 max-w-sm mx-auto mb-6 leading-relaxed">
                    We're experiencing technical difficulties. Our team has been
                    notified and is working to resolve the issue.
                </p>

                <div className="border-2 border-neutral/10 p-5 max-w-sm mx-auto mb-8 text-left">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/25 font-bold mb-3">
                        Error Details
                    </p>
                    <div className="space-y-2">
                        {[
                            { label: "Status", value: "503 Service Unavailable" },
                            { label: "Timestamp", value: new Date().toISOString().split("T")[0] },
                            { label: "Request ID", value: "req_7f3a9b2c" },
                        ].map((row) => (
                            <div key={row.label} className="flex items-baseline justify-between">
                                <span className="text-[9px] uppercase tracking-[0.15em] text-base-content/25 font-bold">{row.label}</span>
                                <span className="text-[10px] font-mono text-base-content/40">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-[2px] justify-center">
                    <button className="px-5 py-2.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-arrows-rotate text-xs" />
                        Try Again
                    </button>
                    <button className="px-5 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-headset text-xs" />
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// EMPTY STATE 4 — Access Denied / Permissions
// ═════════════════════════════════════════════════════════════════════════════

function AccessDenied() {
    return (
        <div className="border-2 border-warning/20 bg-base-100">
            {/* Warning bar */}
            <div className="px-6 py-3 bg-warning/5 border-b border-warning/10 flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-shield-exclamation text-warning text-xs" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-warning">
                    Restricted Access
                </span>
                <div className="flex-1" />
                <span className="text-[9px] text-base-content/20 tracking-wide">
                    Error 403
                </span>
            </div>

            <div className="py-20 px-6 text-center">
                <div className="relative inline-block mb-8">
                    <div className="text-[8rem] font-black tracking-tighter text-warning/5 select-none leading-none">
                        403
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-warning/15 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-lock text-2xl text-warning/25" />
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-black tracking-tight mb-2">Access Restricted</h3>
                <p className="text-sm text-base-content/40 max-w-sm mx-auto mb-8 leading-relaxed">
                    You don't have permission to view this resource. This might be
                    because your subscription doesn't include this feature, or you
                    need specific role access.
                </p>

                {/* Plan comparison */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="grid grid-cols-2 gap-[2px] bg-neutral/10">
                        <div className="bg-base-100 p-5">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/25 font-bold mb-2">
                                Your Plan
                            </p>
                            <div className="text-lg font-black tracking-tight mb-1">Starter</div>
                            <div className="space-y-1">
                                {["5 active roles", "Basic analytics", "Email support"].map((f) => (
                                    <div key={f} className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-[8px] text-base-content/20" />
                                        <span className="text-[10px] text-base-content/30">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-neutral text-neutral-content p-5">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-content/40 font-bold mb-2">
                                Required
                            </p>
                            <div className="text-lg font-black tracking-tight mb-1">Professional</div>
                            <div className="space-y-1">
                                {["Unlimited roles", "Advanced analytics", "Priority support"].map((f) => (
                                    <div key={f} className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-[8px] text-neutral-content/40" />
                                        <span className="text-[10px] text-neutral-content/60">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-[2px] justify-center">
                    <button className="px-5 py-2.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-arrow-up-right text-xs" />
                        Upgrade Plan
                    </button>
                    <button className="px-5 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-info text-xs" />
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function EmptyThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: E.precise } });
            tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
            tl.fromTo($1(".page-headline"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.4");
            tl.fromTo($1(".page-divider"), { scaleX: 0 }, { scaleX: 1, duration: D.normal, transformOrigin: "left center" }, "-=0.3");

            $(".showcase-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.precise, scrollTrigger: { trigger: section, start: "top 85%" } },
                );
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* ── PAGE TITLE ─────────────────────────────────── */}
            <section className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-16 pb-10">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end mb-6">
                        <div className="col-span-12 lg:col-span-3">
                            <div className="page-number opacity-0 text-[6rem] sm:text-[8rem] lg:text-[10rem] font-black leading-none tracking-tighter text-neutral/10 select-none">
                                03
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-9 pb-2">
                            <div className="page-headline opacity-0">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-2">
                                    UX Patterns
                                </p>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">
                                    Empty
                                    <br />
                                    States
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className="page-divider h-[2px] bg-neutral" style={{ transformOrigin: "left center" }} />
                    <p className="mt-4 text-sm text-base-content/40 font-medium tracking-tight max-w-2xl">
                        Well-designed empty states guide users, provide context, and offer actionable next steps.
                        Each state communicates clearly what happened and how to proceed.
                    </p>
                </div>
            </section>

            {/* ── STATE 1: No Search Results ──────────────────── */}
            <section className="showcase-section opacity-0 py-12 lg:py-16 border-b-2 border-neutral/10">
                <div className="px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl lg:text-6xl font-black tracking-tighter text-neutral/8">01</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">Search</p>
                            <h2 className="text-xl font-black tracking-tight">No Results Found</h2>
                        </div>
                    </div>
                    <NoSearchResults />
                </div>
            </section>

            {/* ── STATE 2: First-Time User ────────────────────── */}
            <section className="showcase-section opacity-0 py-12 lg:py-16 border-b-2 border-neutral/10">
                <div className="px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl lg:text-6xl font-black tracking-tighter text-neutral/8">02</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">Onboarding</p>
                            <h2 className="text-xl font-black tracking-tight">No Data Yet</h2>
                        </div>
                    </div>
                    <NoDataYet />
                </div>
            </section>

            {/* ── STATE 3: Error ──────────────────────────────── */}
            <section className="showcase-section opacity-0 py-12 lg:py-16 border-b-2 border-neutral/10">
                <div className="px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl lg:text-6xl font-black tracking-tighter text-neutral/8">03</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">Error</p>
                            <h2 className="text-xl font-black tracking-tight">Something Went Wrong</h2>
                        </div>
                    </div>
                    <ErrorState />
                </div>
            </section>

            {/* ── STATE 4: Access Denied ──────────────────────── */}
            <section className="showcase-section opacity-0 py-12 lg:py-16">
                <div className="px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl lg:text-6xl font-black tracking-tighter text-neutral/8">04</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30">Permissions</p>
                            <h2 className="text-xl font-black tracking-tight">Access Restricted</h2>
                        </div>
                    </div>
                    <AccessDenied />
                </div>
            </section>
        </div>
    );
}
