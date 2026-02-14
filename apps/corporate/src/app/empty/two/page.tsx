"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const emptyStates = [
    {
        id: "no-results",
        label: "Pattern 01",
        title: "No Search Results",
        scenario: "When a search query or filter combination returns zero matches.",
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        iconColor: "text-base-content/15",
        heading: "No jobs match your search",
        message:
            "We could not find any positions matching your current filters. Try broadening your search criteria or removing some filters.",
        actions: [
            { label: "Clear All Filters", style: "primary" },
            { label: "Save Search Alert", style: "ghost" },
        ],
        suggestions: [
            "Try using fewer keywords",
            "Remove location or salary filters",
            "Check for spelling mistakes",
            "Use broader industry categories",
        ],
    },
    {
        id: "first-time",
        label: "Pattern 02",
        title: "First-Time User",
        scenario: "When a user has just signed up and has no data in their account yet.",
        icon: "fa-duotone fa-regular fa-rocket-launch",
        iconColor: "text-secondary/30",
        heading: "Welcome to Splits Network",
        message:
            "Your dashboard is ready. Start by posting your first job listing or importing your existing pipeline. The network of 3,200+ recruiters is waiting.",
        actions: [
            { label: "Post First Job", style: "primary" },
            { label: "Import Pipeline", style: "ghost" },
            { label: "Take a Tour", style: "ghost" },
        ],
        checklist: [
            { label: "Complete your company profile", done: true },
            { label: "Post your first job listing", done: false },
            { label: "Invite your team members", done: false },
            { label: "Set split-fee preferences", done: false },
        ],
    },
    {
        id: "error",
        label: "Pattern 03",
        title: "Error State",
        scenario: "When something goes wrong: server error, network timeout, or unexpected failure.",
        icon: "fa-duotone fa-regular fa-triangle-exclamation",
        iconColor: "text-error/30",
        heading: "Something went wrong",
        message:
            "We are having trouble loading this page. Our team has been notified and is looking into it. Please try again in a moment.",
        actions: [
            { label: "Try Again", style: "primary" },
            { label: "Contact Support", style: "ghost" },
        ],
        errorCode: "ERR_500_INTERNAL",
    },
    {
        id: "no-access",
        label: "Pattern 04",
        title: "Access Denied",
        scenario: "When a user lacks the permissions or subscription level to view content.",
        icon: "fa-duotone fa-regular fa-lock-keyhole",
        iconColor: "text-warning/30",
        heading: "You do not have access",
        message:
            "This content requires an active Pro or Enterprise subscription. Upgrade your plan to unlock the full recruiting marketplace, including AI matching and advanced analytics.",
        actions: [
            { label: "View Plans", style: "primary" },
            { label: "Request Access", style: "ghost" },
        ],
        features: [
            { icon: "fa-duotone fa-regular fa-brain-circuit", label: "AI Candidate Matching" },
            { icon: "fa-duotone fa-regular fa-chart-mixed", label: "Advanced Analytics" },
            { icon: "fa-duotone fa-regular fa-users", label: "Unlimited Team Members" },
            { icon: "fa-duotone fa-regular fa-headset", label: "Priority Support" },
        ],
    },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function EmptyPageTwo() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from("[data-page-text]", {
                y: 50,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
            });

            gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
                gsap.from(line, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1,
                    ease: "power2.inOut",
                    scrollTrigger: { trigger: line, start: "top 90%" },
                });
            });

            document.querySelectorAll("[data-empty-state]").forEach((el) => {
                gsap.from(el, {
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: { trigger: el, start: "top 85%" },
                });
            });
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100 overflow-hidden">
            {/* Hero */}
            <section className="bg-neutral text-neutral-content py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p
                        data-page-text
                        className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-6"
                    >
                        Component Showcase
                    </p>
                    <h1
                        data-page-text
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-6"
                    >
                        Empty
                        <br />
                        States
                    </h1>
                    <p
                        data-page-text
                        className="text-lg md:text-xl text-neutral-content/70 max-w-xl leading-relaxed"
                    >
                        Four essential empty state patterns: no search results,
                        first-time onboarding, error recovery, and access restriction.
                        Each provides clear context and actionable next steps.
                    </p>
                </div>
            </section>

            {/* Empty States */}
            <section className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
                    {emptyStates.map((state) => (
                        <div key={state.id}>
                            {/* State Description */}
                            <div className="flex items-center gap-3 mb-4">
                                <i className={`${state.icon} text-secondary`} />
                                <p className="text-xs uppercase tracking-[0.3em] text-base-content/40 font-medium">
                                    {state.label} &mdash; {state.title}
                                </p>
                            </div>
                            <p className="text-sm text-base-content/60 mb-8 max-w-lg">
                                {state.scenario}
                            </p>

                            <div data-divider className="h-px bg-base-300 mb-8" />

                            {/* Rendered Empty State */}
                            <div
                                data-empty-state
                                className="border border-base-300 bg-base-100"
                            >
                                {/* Simulated page chrome */}
                                <div className="border-b border-base-300 px-6 py-3 flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-base-300 rounded-full" />
                                    <div className="w-2.5 h-2.5 bg-base-300 rounded-full" />
                                    <div className="w-2.5 h-2.5 bg-base-300 rounded-full" />
                                    <div className="h-5 bg-base-200 flex-1 max-w-xs ml-4" />
                                </div>

                                {/* Empty state content */}
                                <div className="px-8 md:px-16 py-16 md:py-24">
                                    <div className="max-w-lg mx-auto text-center">
                                        {/* Icon */}
                                        <i
                                            className={`${state.icon} ${state.iconColor} text-6xl md:text-7xl mb-8 block`}
                                        />

                                        {/* Heading */}
                                        <h3 className="text-2xl md:text-3xl font-bold text-base-content tracking-tight mb-4">
                                            {state.heading}
                                        </h3>

                                        {/* Message */}
                                        <p className="text-base-content/60 leading-relaxed mb-8">
                                            {state.message}
                                        </p>

                                        {/* Error code */}
                                        {state.errorCode && (
                                            <div className="inline-block bg-base-200 px-4 py-2 mb-8">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-mono">
                                                    {state.errorCode}
                                                </p>
                                            </div>
                                        )}

                                        {/* Search suggestions */}
                                        {state.suggestions && (
                                            <div className="text-left bg-base-200 p-6 mb-8">
                                                <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-3">
                                                    Suggestions
                                                </p>
                                                <ul className="space-y-2">
                                                    {state.suggestions.map((s) => (
                                                        <li
                                                            key={s}
                                                            className="flex items-center gap-2 text-sm text-base-content/60"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-arrow-right text-secondary text-xs" />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Onboarding checklist */}
                                        {state.checklist && (
                                            <div className="text-left bg-base-200 p-6 mb-8">
                                                <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-3">
                                                    Getting Started
                                                </p>
                                                <ul className="space-y-3">
                                                    {state.checklist.map((item) => (
                                                        <li
                                                            key={item.label}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <div
                                                                className={`w-5 h-5 flex items-center justify-center shrink-0 ${
                                                                    item.done
                                                                        ? "bg-secondary text-secondary-content"
                                                                        : "border border-base-300"
                                                                }`}
                                                            >
                                                                {item.done && (
                                                                    <i className="fa-regular fa-check text-[10px]" />
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`text-sm ${
                                                                    item.done
                                                                        ? "text-base-content/40 line-through"
                                                                        : "text-base-content/70"
                                                                }`}
                                                            >
                                                                {item.label}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-base-content/40 mb-1">
                                                        <span>Progress</span>
                                                        <span>25%</span>
                                                    </div>
                                                    <div className="h-1 bg-base-300 w-full">
                                                        <div
                                                            className="h-full bg-secondary"
                                                            style={{ width: "25%" }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Locked features */}
                                        {state.features && (
                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                {state.features.map((feat) => (
                                                    <div
                                                        key={feat.label}
                                                        className="border border-base-300 p-4 text-center opacity-50"
                                                    >
                                                        <i className={`${feat.icon} text-base-content/30 text-xl mb-2 block`} />
                                                        <p className="text-xs text-base-content/40">
                                                            {feat.label}
                                                        </p>
                                                        <i className="fa-duotone fa-regular fa-lock text-[10px] text-warning/60 mt-1 block" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex justify-center gap-3 flex-wrap">
                                            {state.actions.map((action) => (
                                                <button
                                                    key={action.label}
                                                    className={`font-semibold uppercase text-xs tracking-wider px-6 ${
                                                        action.style === "primary"
                                                            ? "btn btn-secondary"
                                                            : "btn btn-ghost border border-base-300 text-base-content/60"
                                                    }`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Design Notes */}
            <section className="bg-base-200 py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <i className="fa-duotone fa-regular fa-compass text-secondary text-lg mb-3 block" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-2">
                                Clear Context
                            </h4>
                            <p className="text-base-content/50 text-sm leading-relaxed">
                                Every empty state explains what happened and why. Users
                                should never be left wondering.
                            </p>
                        </div>
                        <div>
                            <i className="fa-duotone fa-regular fa-hand-pointer text-secondary text-lg mb-3 block" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-2">
                                Actionable CTAs
                            </h4>
                            <p className="text-base-content/50 text-sm leading-relaxed">
                                Primary and secondary actions give users a clear path
                                forward. No dead ends.
                            </p>
                        </div>
                        <div>
                            <i className="fa-duotone fa-regular fa-palette text-secondary text-lg mb-3 block" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-2">
                                Visual Hierarchy
                            </h4>
                            <p className="text-base-content/50 text-sm leading-relaxed">
                                Large muted icons draw the eye, followed by bold headings,
                                descriptive text, and prominent action buttons.
                            </p>
                        </div>
                        <div>
                            <i className="fa-duotone fa-regular fa-list-check text-secondary text-lg mb-3 block" />
                            <h4 className="text-sm font-bold uppercase tracking-wider text-base-content mb-2">
                                Supplemental Info
                            </h4>
                            <p className="text-base-content/50 text-sm leading-relaxed">
                                Suggestions, checklists, and feature previews add value
                                beyond the core empty state message.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Colophon */}
            <section className="bg-base-200 border-t border-base-300 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                        Splits Network &middot; Empty States &middot; Magazine Editorial
                    </p>
                </div>
            </section>
        </div>
    );
}
