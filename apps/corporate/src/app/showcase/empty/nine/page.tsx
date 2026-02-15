"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- SVG Illustrations --------------------------------------------------------

function NoSearchIllustration() {
    return (
        <svg viewBox="0 0 120 120" className="w-24 h-24">
            {/* Magnifying glass */}
            <circle cx="52" cy="52" r="28" fill="none" stroke="#233876" strokeWidth="3" strokeOpacity="0.15" />
            <circle cx="52" cy="52" r="28" fill="none" stroke="#233876" strokeWidth="3" strokeOpacity="0.08" strokeDasharray="6 6" />
            <line x1="72" y1="72" x2="95" y2="95" stroke="#233876" strokeWidth="4" strokeLinecap="square" strokeOpacity="0.15" />
            {/* X mark in center */}
            <line x1="42" y1="42" x2="62" y2="62" stroke="#233876" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="square" />
            <line x1="62" y1="42" x2="42" y2="62" stroke="#233876" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="square" />
            {/* Dots */}
            <circle cx="30" cy="85" r="2" fill="#233876" fillOpacity="0.08" />
            <circle cx="95" cy="25" r="2" fill="#233876" fillOpacity="0.08" />
            <circle cx="15" cy="35" r="1.5" fill="#233876" fillOpacity="0.06" />
        </svg>
    );
}

function FirstTimeIllustration() {
    return (
        <svg viewBox="0 0 120 120" className="w-24 h-24">
            {/* Empty box */}
            <rect x="25" y="35" width="70" height="55" fill="none" stroke="#233876" strokeWidth="2" strokeOpacity="0.12" />
            <rect x="25" y="35" width="70" height="55" fill="#233876" fillOpacity="0.02" />
            {/* Lid */}
            <path d="M20 35 L60 15 L100 35" fill="none" stroke="#233876" strokeWidth="2" strokeOpacity="0.15" />
            {/* Plus in center */}
            <line x1="60" y1="52" x2="60" y2="72" stroke="#233876" strokeWidth="2.5" strokeOpacity="0.2" strokeLinecap="square" />
            <line x1="50" y1="62" x2="70" y2="62" stroke="#233876" strokeWidth="2.5" strokeOpacity="0.2" strokeLinecap="square" />
            {/* Sparkles */}
            <circle cx="85" cy="25" r="2" fill="#233876" fillOpacity="0.1" />
            <circle cx="20" cy="70" r="1.5" fill="#233876" fillOpacity="0.06" />
            <rect x="100" y="55" width="4" height="4" fill="#233876" fillOpacity="0.06" />
        </svg>
    );
}

function ErrorIllustration() {
    return (
        <svg viewBox="0 0 120 120" className="w-24 h-24">
            {/* Triangle */}
            <path d="M60 20 L100 90 L20 90 Z" fill="none" stroke="#233876" strokeWidth="2" strokeOpacity="0.12" />
            <path d="M60 20 L100 90 L20 90 Z" fill="#233876" fillOpacity="0.02" />
            {/* Exclamation */}
            <line x1="60" y1="45" x2="60" y2="65" stroke="#233876" strokeWidth="3" strokeOpacity="0.2" strokeLinecap="square" />
            <rect x="58" y="72" width="4" height="4" fill="#233876" fillOpacity="0.2" />
            {/* Broken circuit lines */}
            <line x1="15" y1="95" x2="35" y2="95" stroke="#233876" strokeWidth="1" strokeOpacity="0.08" strokeDasharray="3 3" />
            <line x1="85" y1="95" x2="105" y2="95" stroke="#233876" strokeWidth="1" strokeOpacity="0.08" strokeDasharray="3 3" />
            <circle cx="105" cy="30" r="2" fill="#233876" fillOpacity="0.06" />
        </svg>
    );
}

function PermissionsIllustration() {
    return (
        <svg viewBox="0 0 120 120" className="w-24 h-24">
            {/* Lock body */}
            <rect x="35" y="55" width="50" height="40" fill="none" stroke="#233876" strokeWidth="2" strokeOpacity="0.12" />
            <rect x="35" y="55" width="50" height="40" fill="#233876" fillOpacity="0.02" />
            {/* Lock shackle */}
            <path d="M45 55 L45 40 A15 15 0 0 1 75 40 L75 55" fill="none" stroke="#233876" strokeWidth="2.5" strokeOpacity="0.15" />
            {/* Keyhole */}
            <circle cx="60" cy="72" r="5" fill="#233876" fillOpacity="0.12" />
            <rect x="58" y="76" width="4" height="8" fill="#233876" fillOpacity="0.12" />
            {/* Crosses for restricted */}
            <g strokeOpacity="0.08" stroke="#233876" strokeWidth="1">
                <line x1="15" y1="30" x2="25" y2="40" />
                <line x1="25" y1="30" x2="15" y2="40" />
                <line x1="95" y1="25" x2="105" y2="35" />
                <line x1="105" y1="25" x2="95" y2="35" />
            </g>
        </svg>
    );
}

// -- Data ---------------------------------------------------------------------

const emptyStates = [
    {
        id: "no-results",
        ref: "EMPTY-01",
        title: "No Search Results",
        subtitle: "We couldn't find what you're looking for",
        description: "Try adjusting your search terms, removing filters, or broadening your criteria. New roles are added to the network daily.",
        illustration: <NoSearchIllustration />,
        primaryAction: "Clear Filters",
        primaryIcon: "fa-regular fa-filter-slash",
        secondaryAction: "Browse All Roles",
        secondaryIcon: "fa-regular fa-grid-2",
        mono: "0 RESULTS // QUERY: \"quantum computing recruiter\"",
    },
    {
        id: "first-time",
        ref: "EMPTY-02",
        title: "Welcome to Your Dashboard",
        subtitle: "You haven't posted any jobs yet",
        description: "Get started by creating your first job posting. Once published, recruiters in the network will be notified and can begin sourcing candidates immediately.",
        illustration: <FirstTimeIllustration />,
        primaryAction: "Post Your First Job",
        primaryIcon: "fa-regular fa-plus",
        secondaryAction: "Take a Tour",
        secondaryIcon: "fa-regular fa-compass",
        mono: "0 JOBS // ACCOUNT CREATED: FEB 14, 2026",
    },
    {
        id: "error",
        ref: "EMPTY-03",
        title: "Something Went Wrong",
        subtitle: "We encountered an unexpected error",
        description: "Our team has been notified and is working on a fix. Please try again in a few moments. If the problem persists, contact our support team.",
        illustration: <ErrorIllustration />,
        primaryAction: "Try Again",
        primaryIcon: "fa-regular fa-rotate-right",
        secondaryAction: "Contact Support",
        secondaryIcon: "fa-regular fa-envelope",
        mono: "ERROR 500 // REF: ERR-2026-0214-0847",
    },
    {
        id: "permissions",
        ref: "EMPTY-04",
        title: "Access Restricted",
        subtitle: "You don't have permission to view this page",
        description: "This section requires elevated permissions. Contact your organization administrator to request access, or navigate back to your dashboard.",
        illustration: <PermissionsIllustration />,
        primaryAction: "Go to Dashboard",
        primaryIcon: "fa-regular fa-grid-2",
        secondaryAction: "Request Access",
        secondaryIcon: "fa-regular fa-key",
        mono: "403 FORBIDDEN // ROLE: VIEWER // REQUIRED: ADMIN",
    },
];

// -- Component ----------------------------------------------------------------

export default function EmptyNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".empty-nine-title"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 });

            gsap.fromTo($(".empty-nine-card"), { opacity: 0, y: 35 }, {
                opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15,
                scrollTrigger: { trigger: $1(".empty-nine-grid"), start: "top 80%" },
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f7f8fa]">
            {/* Header */}
            <section className="relative py-16 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="empty-nine-title opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">REF: EN-EMPTY-09 // State Patterns</span>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] leading-tight mb-4">
                                Empty <span className="text-[#233876]">States</span>
                            </h1>
                            <p className="text-lg text-[#0f1b3d]/50 max-w-xl">
                                Graceful handling of empty, error, and restricted states.
                                Each scenario provides context, guidance, and a clear path forward.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>
            </section>

            {/* Empty State Cards */}
            <section className="relative py-12 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="empty-nine-grid space-y-8">
                            {emptyStates.map((state, i) => (
                                <div
                                    key={state.id}
                                    className="empty-nine-card border-2 border-[#233876]/10 bg-white relative opacity-0"
                                >
                                    {/* Corner marks */}
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                    {/* Ref label */}
                                    <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/15">{state.ref}</div>

                                    {/* Header strip */}
                                    <div className="px-8 py-3 border-b border-dashed border-[#233876]/8 bg-[#f7f8fa]/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-[#233876]/15" />
                                            <span className="font-mono text-[9px] text-[#233876]/25 tracking-wider uppercase">
                                                Scenario {String(i + 1).padStart(2, "0")} // {state.id.replace("-", " ").toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="px-8 py-12 flex flex-col items-center text-center">
                                        {/* Illustration */}
                                        <div className="mb-6">
                                            {state.illustration}
                                        </div>

                                        {/* Mono status line */}
                                        <div className="font-mono text-[9px] text-[#233876]/20 tracking-wider mb-6 px-4 py-1.5 border border-dashed border-[#233876]/10">
                                            {state.mono}
                                        </div>

                                        {/* Text */}
                                        <h2 className="text-2xl font-bold text-[#0f1b3d] mb-2">{state.title}</h2>
                                        <p className="text-sm text-[#0f1b3d]/50 mb-2">{state.subtitle}</p>
                                        <p className="text-xs text-[#0f1b3d]/35 leading-relaxed max-w-lg mb-8">{state.description}</p>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button className="px-6 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium flex items-center gap-2">
                                                <i className={`${state.primaryIcon} text-xs`} />
                                                {state.primaryAction}
                                            </button>
                                            <button className="px-6 py-2.5 border-2 border-[#233876]/20 text-sm text-[#233876] hover:border-[#233876] transition-colors font-medium flex items-center gap-2">
                                                <i className={`${state.secondaryIcon} text-xs`} />
                                                {state.secondaryAction}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom accent */}
                                    <div className={`h-[3px] ${
                                        state.id === "error" ? "bg-red-400/30" :
                                        state.id === "permissions" ? "bg-amber-400/30" :
                                        "bg-[#233876]/8"
                                    }`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Compact variants section */}
            <section className="relative py-12 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-2">Compact Variants</span>
                            <h2 className="text-2xl font-bold text-[#0f1b3d]">Inline Empty States</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* No messages */}
                            <div className="border-2 border-[#233876]/10 bg-[#f7f8fa] p-8 text-center">
                                <div className="w-10 h-10 border-2 border-[#233876]/10 flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-duotone fa-regular fa-comments text-[#233876]/20" />
                                </div>
                                <h3 className="font-bold text-sm text-[#0f1b3d] mb-1">No Messages Yet</h3>
                                <p className="text-xs text-[#0f1b3d]/35 mb-3">Start a conversation with a recruiter or company.</p>
                                <button className="px-4 py-1.5 border border-[#233876]/15 text-xs text-[#233876] hover:border-[#233876] transition-colors">
                                    Start Chat
                                </button>
                            </div>

                            {/* No notifications */}
                            <div className="border-2 border-[#233876]/10 bg-[#f7f8fa] p-8 text-center">
                                <div className="w-10 h-10 border-2 border-[#233876]/10 flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-duotone fa-regular fa-bell text-[#233876]/20" />
                                </div>
                                <h3 className="font-bold text-sm text-[#0f1b3d] mb-1">All Caught Up</h3>
                                <p className="text-xs text-[#0f1b3d]/35 mb-3">No new notifications. Check back later.</p>
                                <button className="px-4 py-1.5 border border-[#233876]/15 text-xs text-[#233876] hover:border-[#233876] transition-colors">
                                    View History
                                </button>
                            </div>

                            {/* No candidates */}
                            <div className="border-2 border-[#233876]/10 bg-[#f7f8fa] p-8 text-center">
                                <div className="w-10 h-10 border-2 border-[#233876]/10 flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-duotone fa-regular fa-users text-[#233876]/20" />
                                </div>
                                <h3 className="font-bold text-sm text-[#0f1b3d] mb-1">No Candidates</h3>
                                <p className="text-xs text-[#0f1b3d]/35 mb-3">No candidates have been submitted for this role yet.</p>
                                <button className="px-4 py-1.5 border border-[#233876]/15 text-xs text-[#233876] hover:border-[#233876] transition-colors">
                                    Invite Recruiters
                                </button>
                            </div>

                            {/* Loading failed */}
                            <div className="border-2 border-red-400/15 bg-red-50/20 p-8 text-center">
                                <div className="w-10 h-10 border-2 border-red-400/20 flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-duotone fa-regular fa-plug-circle-xmark text-red-400/40" />
                                </div>
                                <h3 className="font-bold text-sm text-[#0f1b3d] mb-1">Connection Lost</h3>
                                <p className="text-xs text-[#0f1b3d]/35 mb-3">Unable to load data. Check your internet connection.</p>
                                <button className="px-4 py-1.5 border border-red-400/25 text-xs text-red-500 hover:border-red-400 transition-colors">
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-[#f7f8fa]">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // EMPTY STATES v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
