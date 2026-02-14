"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Empty State Component ───────────────────────────────────────────────── */

function EmptyState({
    icon,
    iconColor,
    iconBg,
    title,
    description,
    primaryAction,
    primaryHref,
    primaryIcon,
    secondaryAction,
    secondaryHref,
    variant,
}: {
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    primaryAction: string;
    primaryHref?: string;
    primaryIcon?: string;
    secondaryAction?: string;
    secondaryHref?: string;
    variant: "default" | "dark" | "branded";
}) {
    const bgClass =
        variant === "dark"
            ? "bg-neutral text-neutral-content"
            : variant === "branded"
              ? "bg-primary text-primary-content"
              : "bg-base-100 text-base-content";

    const mutedClass =
        variant === "dark"
            ? "text-neutral-content/50"
            : variant === "branded"
              ? "text-primary-content/60"
              : "text-base-content/50";

    const btnPrimary =
        variant === "branded"
            ? "bg-white text-primary hover:bg-white/90 border-0"
            : "btn-primary";

    const btnSecondary =
        variant === "branded"
            ? "btn-outline border-primary-content/20 text-primary-content hover:bg-primary-content/10"
            : variant === "dark"
              ? "btn-outline border-neutral-content/20 text-neutral-content hover:bg-neutral-content/10"
              : "btn-outline";

    return (
        <div className={`${bgClass} p-12 lg:p-20`}>
            <div className="max-w-md mx-auto text-center">
                {/* Icon */}
                <div className={`w-24 h-24 ${iconBg} flex items-center justify-center mx-auto mb-8`}>
                    <i className={`${icon} text-4xl ${iconColor}`}></i>
                </div>

                {/* Text */}
                <h3 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight mb-3">
                    {title}
                </h3>
                <p className={`${mutedClass} leading-relaxed mb-8`}>
                    {description}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href={primaryHref || "#"} className={`btn ${btnPrimary} text-xs font-bold uppercase tracking-wider`}>
                        {primaryIcon && <i className={primaryIcon}></i>}
                        {primaryAction}
                    </a>
                    {secondaryAction && (
                        <a href={secondaryHref || "#"} className={`btn ${btnSecondary} text-xs font-bold uppercase tracking-wider`}>
                            {secondaryAction}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Page Component ──────────────────────────────────────────────────────── */

export default function EmptyOnePage() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
            heroTl
                .fromTo($1(".hero-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
                .fromTo($(".hero-headline-word"), { opacity: 0, y: 80, rotateX: 40 }, { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.12 }, "-=0.3")
                .fromTo($1(".hero-body"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");

            $(".showcase-section").forEach((section) => {
                gsap.fromTo(section, { opacity: 0, y: 40 }, {
                    opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: section, start: "top 80%" },
                });
            });
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden bg-base-100 min-h-screen">
            {/* ═══════════════════ HERO ═══════════════════ */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-ghost mr-2"></i>Empty States
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                            <span className="hero-headline-word inline-block opacity-0">When</span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">nothing</span>{" "}
                            <span className="hero-headline-word inline-block opacity-0">is there.</span>
                        </h1>
                        <p className="hero-body text-lg text-neutral-content/60 leading-relaxed max-w-xl opacity-0">
                            Thoughtful empty states guide users forward. Each
                            scenario provides context, explains what happened,
                            and offers a clear next step.
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
            </section>

            {/* ═══════════════════ STATE 1 — No Search Results ═══════════════════ */}
            <section className="showcase-section py-16 opacity-0">
                <div className="container mx-auto px-6 lg:px-12 mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">01</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">No Search Results</p>
                            <h2 className="text-2xl font-black tracking-tight">Search came up empty</h2>
                        </div>
                    </div>
                    <p className="text-sm text-base-content/50 max-w-lg">
                        When a user searches or filters and no results match.
                        Acknowledge the attempt and suggest corrections.
                    </p>
                </div>

                <div className="border-2 border-base-300 mx-4 lg:mx-12 overflow-hidden">
                    {/* Simulated search bar context */}
                    <div className="bg-base-200 px-6 py-4 border-b border-base-300">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/20 text-sm"></i>
                                <div className="input input-bordered w-full pl-9 bg-base-100 border-base-300 text-sm flex items-center text-base-content/40">
                                    &ldquo;underwater basket weaving engineer&rdquo;
                                </div>
                            </div>
                            <span className="text-xs font-bold text-base-content/30 uppercase tracking-wider">0 results</span>
                        </div>
                    </div>

                    <EmptyState
                        icon="fa-duotone fa-regular fa-magnifying-glass"
                        iconColor="text-base-content/20"
                        iconBg="bg-base-200"
                        title="No results found"
                        description="We couldn't find any jobs matching your search. Try broadening your search terms or adjusting your filters."
                        primaryAction="Clear Filters"
                        primaryIcon="fa-duotone fa-regular fa-filter-circle-xmark"
                        secondaryAction="Browse All Jobs"
                        variant="default"
                    />
                </div>
            </section>

            {/* ═══════════════════ STATE 2 — First-Time User / No Data Yet ═══════════════════ */}
            <section className="showcase-section py-16 opacity-0">
                <div className="container mx-auto px-6 lg:px-12 mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">02</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">First-Time User</p>
                            <h2 className="text-2xl font-black tracking-tight">Welcome state</h2>
                        </div>
                    </div>
                    <p className="text-sm text-base-content/50 max-w-lg">
                        When a new user arrives and has no data yet. Turn the
                        empty state into an onboarding moment.
                    </p>
                </div>

                <div className="border-2 border-base-300 mx-4 lg:mx-12 overflow-hidden">
                    {/* Simulated page header */}
                    <div className="bg-base-200 px-6 py-3 border-b border-base-300 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-base-content/40">
                            <i className="fa-duotone fa-regular fa-briefcase mr-1"></i>My Job Postings
                        </span>
                        <button className="btn btn-primary btn-xs text-[10px] font-bold uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-plus"></i>New Job
                        </button>
                    </div>

                    <EmptyState
                        icon="fa-duotone fa-regular fa-rocket"
                        iconColor="text-primary"
                        iconBg="bg-primary/10"
                        title="Post your first role"
                        description="Your job board is empty. Create your first job posting and let the recruiter network start bringing you qualified candidates."
                        primaryAction="Create Job Posting"
                        primaryIcon="fa-duotone fa-regular fa-plus"
                        secondaryAction="Import from ATS"
                        variant="default"
                    />
                </div>
            </section>

            {/* ═══════════════════ STATE 3 — Error State ═══════════════════ */}
            <section className="showcase-section py-16 opacity-0">
                <div className="container mx-auto px-6 lg:px-12 mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">03</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-error">Error State</p>
                            <h2 className="text-2xl font-black tracking-tight">Something went wrong</h2>
                        </div>
                    </div>
                    <p className="text-sm text-base-content/50 max-w-lg">
                        When an unexpected error occurs. Be honest, helpful,
                        and provide a recovery path without technical jargon.
                    </p>
                </div>

                <div className="border-2 border-error/20 mx-4 lg:mx-12 overflow-hidden">
                    <EmptyState
                        icon="fa-duotone fa-regular fa-triangle-exclamation"
                        iconColor="text-error"
                        iconBg="bg-error/10"
                        title="Something went wrong"
                        description="We hit an unexpected issue loading this page. Our team has been notified and is working on it. Please try again in a moment."
                        primaryAction="Try Again"
                        primaryIcon="fa-duotone fa-regular fa-rotate-right"
                        secondaryAction="Contact Support"
                        variant="default"
                    />
                </div>
            </section>

            {/* ═══════════════════ STATE 4 — Access Denied ═══════════════════ */}
            <section className="showcase-section py-16 opacity-0">
                <div className="container mx-auto px-6 lg:px-12 mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">04</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-warning">Permissions</p>
                            <h2 className="text-2xl font-black tracking-tight">Access denied</h2>
                        </div>
                    </div>
                    <p className="text-sm text-base-content/50 max-w-lg">
                        When a user does not have permission to view content.
                        Explain why and how to get access without frustration.
                    </p>
                </div>

                <div className="border-2 border-base-300 mx-4 lg:mx-12 overflow-hidden">
                    <EmptyState
                        icon="fa-duotone fa-regular fa-lock"
                        iconColor="text-neutral-content/30"
                        iconBg="bg-neutral-content/10"
                        title="You don't have access"
                        description="This content is restricted to authorized team members. Contact your organization admin to request access, or sign in with a different account."
                        primaryAction="Request Access"
                        primaryIcon="fa-duotone fa-regular fa-key"
                        secondaryAction="Sign in with different account"
                        variant="dark"
                    />
                </div>
            </section>

            {/* ═══════════════════ INLINE VARIANTS — Compact states ═══════════════════ */}
            <section className="showcase-section py-16 bg-base-200 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">05</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Inline Variants</p>
                            <h2 className="text-2xl font-black tracking-tight">Compact empty states</h2>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* No notifications */}
                        <div className="bg-base-100 border-2 border-base-300 p-8 text-center">
                            <div className="w-14 h-14 bg-base-200 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-bell-slash text-2xl text-base-content/15"></i>
                            </div>
                            <h4 className="text-base font-black tracking-tight mb-1">No notifications</h4>
                            <p className="text-xs text-base-content/40 mb-4">You are all caught up. We will notify you when something happens.</p>
                            <button className="btn btn-ghost btn-xs text-[10px] font-bold uppercase tracking-wider">
                                Notification Settings
                            </button>
                        </div>

                        {/* No messages */}
                        <div className="bg-base-100 border-2 border-base-300 p-8 text-center">
                            <div className="w-14 h-14 bg-base-200 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-comments text-2xl text-base-content/15"></i>
                            </div>
                            <h4 className="text-base font-black tracking-tight mb-1">No messages yet</h4>
                            <p className="text-xs text-base-content/40 mb-4">Start a conversation with a recruiter or candidate in your network.</p>
                            <button className="btn btn-primary btn-xs text-[10px] font-bold uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-plus"></i>New Message
                            </button>
                        </div>

                        {/* No candidates */}
                        <div className="bg-base-100 border-2 border-base-300 p-8 text-center">
                            <div className="w-14 h-14 bg-base-200 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-users text-2xl text-base-content/15"></i>
                            </div>
                            <h4 className="text-base font-black tracking-tight mb-1">No candidates</h4>
                            <p className="text-xs text-base-content/40 mb-4">No candidates have been submitted to this role yet. Share it with your recruiter network.</p>
                            <button className="btn btn-outline btn-xs text-[10px] font-bold uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-share-nodes"></i>Share Role
                            </button>
                        </div>

                        {/* Empty pipeline */}
                        <div className="bg-base-100 border-2 border-base-300 p-8 text-center">
                            <div className="w-14 h-14 bg-base-200 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-diagram-project text-2xl text-base-content/15"></i>
                            </div>
                            <h4 className="text-base font-black tracking-tight mb-1">Pipeline is empty</h4>
                            <p className="text-xs text-base-content/40 mb-4">Add stages to your hiring pipeline to start tracking candidates through the process.</p>
                            <button className="btn btn-primary btn-xs text-[10px] font-bold uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-plus"></i>Add Stage
                            </button>
                        </div>

                        {/* No saved searches */}
                        <div className="bg-base-100 border-2 border-base-300 p-8 text-center">
                            <div className="w-14 h-14 bg-base-200 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-bookmark text-2xl text-base-content/15"></i>
                            </div>
                            <h4 className="text-base font-black tracking-tight mb-1">No saved searches</h4>
                            <p className="text-xs text-base-content/40 mb-4">Save your frequent searches to get notified when new matching jobs are posted.</p>
                            <button className="btn btn-ghost btn-xs text-[10px] font-bold uppercase tracking-wider">
                                Go to Search
                            </button>
                        </div>

                        {/* Offline state */}
                        <div className="bg-base-100 border-2 border-base-300 p-8 text-center">
                            <div className="w-14 h-14 bg-warning/10 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-wifi-slash text-2xl text-warning/50"></i>
                            </div>
                            <h4 className="text-base font-black tracking-tight mb-1">You are offline</h4>
                            <p className="text-xs text-base-content/40 mb-4">Check your internet connection and try again. Some features may be limited.</p>
                            <button className="btn btn-warning btn-xs text-[10px] font-bold uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-rotate-right"></i>Retry
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
