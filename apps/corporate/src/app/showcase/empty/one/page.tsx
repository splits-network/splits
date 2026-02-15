"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

/* ─── Empty State Data ───────────────────────────────────────────────────── */

const emptyStates = [
    {
        id: "no-results",
        title: "No results found",
        subtitle: "We could not find any matches for your search.",
        description: "Try adjusting your filters, broadening your search terms, or checking for typos. Sometimes less specific queries return more results.",
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        actions: [
            { label: "Clear Filters", style: "btn-primary", icon: "fa-duotone fa-regular fa-filter-slash" },
            { label: "Browse All Jobs", style: "btn-ghost", icon: "fa-duotone fa-regular fa-briefcase" },
        ],
        suggestions: ["Try removing location filters", "Use broader skill keywords", "Check for spelling mistakes", "Expand salary range"],
    },
    {
        id: "first-time",
        title: "Welcome to Splits Network",
        subtitle: "Your pipeline is empty -- let us fix that.",
        description: "Start by browsing open roles or importing your existing candidates. The marketplace connects you with companies that match your recruiting niche.",
        icon: "fa-duotone fa-regular fa-rocket",
        iconColor: "text-secondary",
        iconBg: "bg-secondary/10",
        actions: [
            { label: "Browse Open Roles", style: "btn-secondary", icon: "fa-duotone fa-regular fa-briefcase" },
            { label: "Import Candidates", style: "btn-ghost", icon: "fa-duotone fa-regular fa-file-import" },
        ],
        steps: [
            { num: "01", text: "Complete your recruiter profile" },
            { num: "02", text: "Browse and claim open roles" },
            { num: "03", text: "Submit your first candidate" },
            { num: "04", text: "Track placements and earn" },
        ],
    },
    {
        id: "error",
        title: "Something went wrong",
        subtitle: "We hit an unexpected error loading this page.",
        description: "Our team has been notified and is looking into it. You can try refreshing the page or come back in a few minutes.",
        icon: "fa-duotone fa-regular fa-triangle-exclamation",
        iconColor: "text-error",
        iconBg: "bg-error/10",
        actions: [
            { label: "Try Again", style: "btn-error", icon: "fa-duotone fa-regular fa-rotate-right" },
            { label: "Go to Dashboard", style: "btn-ghost", icon: "fa-duotone fa-regular fa-gauge-high" },
            { label: "Contact Support", style: "btn-ghost", icon: "fa-duotone fa-regular fa-life-ring" },
        ],
        errorCode: "ERR_500_INTERNAL",
    },
    {
        id: "permissions",
        title: "Access restricted",
        subtitle: "You do not have permission to view this content.",
        description: "This section requires additional access. Contact your organization admin to request the appropriate role or subscription upgrade.",
        icon: "fa-duotone fa-regular fa-lock",
        iconColor: "text-warning",
        iconBg: "bg-warning/10",
        actions: [
            { label: "Request Access", style: "btn-warning", icon: "fa-duotone fa-regular fa-paper-plane" },
            { label: "Upgrade Plan", style: "btn-ghost", icon: "fa-duotone fa-regular fa-arrow-up-right" },
            { label: "Go Back", style: "btn-ghost", icon: "fa-duotone fa-regular fa-arrow-left" },
        ],
        requiredRole: "Admin or Pro plan",
    },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function EmptyOne() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        if (!mainRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => mainRef.current!.querySelectorAll(s);
        const $1 = (s: string) => mainRef.current!.querySelector(s);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".empty-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
          .fromTo($(".empty-title-word"), { opacity: 0, y: 60, rotateX: 30 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
          .fromTo($1(".empty-desc"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4");

        $(".empty-card").forEach((card) => {
            gsap.fromTo(card, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%" } });
        });
    }, { scope: mainRef });

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10" style={{ clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)" }} />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="empty-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">Empty States</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="empty-title-word inline-block opacity-0">Designing for</span>{" "}
                            <span className="empty-title-word inline-block opacity-0 text-primary">nothing.</span>
                        </h1>
                        <p className="empty-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            Empty states are opportunities. They guide users forward, explain context, and turn dead ends into starting points.
                        </p>
                    </div>
                </div>
            </section>

            {/* Empty State Showcases */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-16">
                {emptyStates.map((state) => (
                    <div key={state.id} className="empty-card opacity-0">
                        {/* Label */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-base-200 text-[10px] font-semibold uppercase tracking-widest text-base-content/40">{state.id.replace("-", " ")}</span>
                            <div className="flex-1 h-px bg-base-300" />
                        </div>

                        {/* Card */}
                        <div className="bg-base-200 border border-base-300 p-10 lg:p-16">
                            <div className="max-w-lg mx-auto text-center">
                                {/* Icon */}
                                <div className={`w-20 h-20 ${state.iconBg} flex items-center justify-center mx-auto mb-6`}>
                                    <i className={`${state.icon} ${state.iconColor} text-4xl`} />
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">{state.title}</h2>
                                <p className="text-base font-semibold text-base-content/60 mb-3">{state.subtitle}</p>
                                <p className="text-sm text-base-content/50 leading-relaxed mb-8">{state.description}</p>

                                {/* Error code */}
                                {"errorCode" in state && state.errorCode && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error text-xs font-mono mb-6">
                                        <i className="fa-duotone fa-regular fa-code" />{state.errorCode}
                                    </div>
                                )}

                                {/* Required role */}
                                {"requiredRole" in state && state.requiredRole && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning text-xs font-semibold mb-6">
                                        <i className="fa-duotone fa-regular fa-shield" />Required: {state.requiredRole}
                                    </div>
                                )}

                                {/* Steps (first-time) */}
                                {"steps" in state && state.steps && (
                                    <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                                        {state.steps.map((step) => (
                                            <div key={step.num} className="flex items-center gap-3 p-3 bg-base-100 border border-base-300">
                                                <span className="text-2xl font-black text-secondary/20">{step.num}</span>
                                                <span className="text-xs font-semibold text-base-content/60">{step.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Suggestions */}
                                {"suggestions" in state && state.suggestions && (
                                    <div className="text-left mb-8 p-4 bg-base-100 border border-base-300">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">Suggestions</p>
                                        <div className="space-y-2">
                                            {state.suggestions.map((s) => (
                                                <div key={s} className="flex items-center gap-2 text-sm text-base-content/60">
                                                    <i className="fa-duotone fa-regular fa-lightbulb text-primary text-xs" />{s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {state.actions.map((action) => (
                                        <button key={action.label} className={`btn btn-sm ${action.style}`}>
                                            <i className={action.icon} />{action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
