"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Empty State Scenarios ───────────────────────────────────────────────── */
const emptyStates = [
    {
        id: "no-results",
        title: "No Search Results",
        subtitle: "We searched everywhere",
        description: "Your search for \"Senior Quantum Computing Engineer in Antarctica\" returned zero results. Try broadening your filters or adjusting your search terms.",
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        actions: [
            { label: "Clear Filters", style: "btn-primary", icon: "fa-duotone fa-regular fa-filter-slash" },
            { label: "Browse All Jobs", style: "bg-base-200 border-base-content/10", icon: "fa-duotone fa-regular fa-grid-2" },
        ],
        suggestions: [
            "Remove some filters to widen your search",
            "Check for spelling errors in your query",
            "Try using broader keywords or job titles",
            "Set up an alert to be notified of new matches",
        ],
    },
    {
        id: "first-time",
        title: "Welcome to Your Dashboard",
        subtitle: "You are all set up. Now let us get started.",
        description: "Your account is ready. Start by posting your first job listing, inviting recruiters to your network, or browsing available roles in the marketplace.",
        icon: "fa-duotone fa-regular fa-rocket",
        iconBg: "bg-success/10",
        iconColor: "text-success",
        actions: [
            { label: "Post a Job", style: "btn-primary", icon: "fa-duotone fa-regular fa-plus" },
            { label: "Explore Marketplace", style: "bg-base-200 border-base-content/10", icon: "fa-duotone fa-regular fa-compass" },
        ],
        quickStart: [
            { icon: "fa-duotone fa-regular fa-briefcase", label: "Post Your First Role", desc: "Create a job listing in under 5 minutes" },
            { icon: "fa-duotone fa-regular fa-user-plus", label: "Invite Recruiters", desc: "Build your network of talent partners" },
            { icon: "fa-duotone fa-regular fa-gear", label: "Configure Settings", desc: "Set up billing, notifications, and preferences" },
        ],
    },
    {
        id: "error",
        title: "Something Went Wrong",
        subtitle: "Error 500 -- Internal Server Error",
        description: "We hit an unexpected issue while loading this page. Our engineering team has been automatically notified and is working on a fix.",
        icon: "fa-duotone fa-regular fa-triangle-exclamation",
        iconBg: "bg-error/10",
        iconColor: "text-error",
        actions: [
            { label: "Try Again", style: "btn-primary", icon: "fa-duotone fa-regular fa-rotate-right" },
            { label: "Contact Support", style: "bg-base-200 border-base-content/10", icon: "fa-duotone fa-regular fa-headset" },
        ],
        errorDetails: {
            code: "ERR_INTERNAL_500",
            timestamp: "2026-02-14T14:32:07Z",
            requestId: "req_4f8a2b1c",
        },
    },
    {
        id: "no-access",
        title: "Access Restricted",
        subtitle: "You need permission to view this page",
        description: "This area requires elevated permissions. If you believe you should have access, contact your organization admin or request access below.",
        icon: "fa-duotone fa-regular fa-lock",
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
        actions: [
            { label: "Request Access", style: "btn-primary", icon: "fa-duotone fa-regular fa-paper-plane" },
            { label: "Go Back", style: "bg-base-200 border-base-content/10", icon: "fa-duotone fa-regular fa-arrow-left" },
        ],
        permissions: [
            { role: "Admin", hasAccess: true },
            { role: "Manager", hasAccess: true },
            { role: "Recruiter", hasAccess: false },
            { role: "Viewer", hasAccess: false },
        ],
    },
];

export default function EmptyFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".cin-reveal, .cin-empty-card"), {
                    opacity: 1, y: 0,
                });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            gsap.fromTo(
                $1(".cin-empty-hero"),
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 },
            );

            gsap.fromTo(
                $(".cin-empty-card"),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: { trigger: $1(".cin-empty-grid"), start: "top 80%" },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100">
            {/* Header */}
            <div className="cin-empty-hero bg-neutral text-white opacity-0">
                <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
                    <p className="text-xs uppercase tracking-[0.3em] font-medium text-primary mb-4">
                        Cinematic Editorial
                    </p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-3">
                        Empty <span className="text-primary">States</span>
                    </h1>
                    <p className="text-base text-white/50 max-w-xl leading-relaxed">
                        Thoughtful empty states that guide users, explain context, and provide clear next steps.
                    </p>
                </div>
            </div>

            {/* Empty States Grid */}
            <div className="cin-empty-grid max-w-6xl mx-auto px-6 py-12 space-y-10">
                {emptyStates.map((state) => (
                    <div
                        key={state.id}
                        className="cin-empty-card border border-base-content/5 rounded-2xl overflow-hidden opacity-0"
                    >
                        {/* Card Label */}
                        <div className="bg-base-200 px-6 py-3 border-b border-base-content/5 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-base-content/40">
                                {state.id === "no-results" && "Scenario: No Search Results"}
                                {state.id === "first-time" && "Scenario: First-Time User"}
                                {state.id === "error" && "Scenario: Server Error"}
                                {state.id === "no-access" && "Scenario: Access Denied"}
                            </span>
                            <span className="badge badge-sm bg-base-300 border-0 text-base-content/40 font-medium">
                                Preview
                            </span>
                        </div>

                        {/* Empty State Content */}
                        <div className="px-6 py-16 lg:py-20">
                            <div className="max-w-lg mx-auto text-center">
                                {/* Icon */}
                                <div className={`w-20 h-20 rounded-2xl ${state.iconBg} flex items-center justify-center mx-auto mb-6`}>
                                    <i className={`${state.icon} ${state.iconColor} text-3xl`} />
                                </div>

                                {/* Text */}
                                <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">
                                    {state.title}
                                </h2>
                                <p className="text-sm text-base-content/40 font-medium mb-4">
                                    {state.subtitle}
                                </p>
                                <p className="text-base-content/60 leading-relaxed mb-8 max-w-md mx-auto">
                                    {state.description}
                                </p>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 justify-center mb-8">
                                    {state.actions.map((action, i) => (
                                        <button
                                            key={i}
                                            className={`btn font-semibold ${action.style}`}
                                        >
                                            <i className={action.icon} />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Extra content per scenario */}
                                {state.suggestions && (
                                    <div className="bg-base-200 rounded-xl p-5 text-left max-w-sm mx-auto">
                                        <h4 className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-3">
                                            Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {state.suggestions.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-base-content/60">
                                                    <i className="fa-duotone fa-regular fa-lightbulb text-primary text-xs mt-1 shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {state.quickStart && (
                                    <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                                        {state.quickStart.map((qs, i) => (
                                            <button
                                                key={i}
                                                className="bg-base-200 rounded-xl p-4 text-center hover:bg-base-300 transition-colors group"
                                            >
                                                <i className={`${qs.icon} text-primary text-xl mb-2 block group-hover:scale-110 transition-transform`} />
                                                <div className="font-bold text-sm mb-0.5">{qs.label}</div>
                                                <div className="text-xs text-base-content/40">{qs.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {state.errorDetails && (
                                    <div className="bg-error/5 border border-error/10 rounded-xl p-4 max-w-sm mx-auto text-left">
                                        <h4 className="text-xs uppercase tracking-wider text-error/60 font-semibold mb-2">
                                            Error Details
                                        </h4>
                                        <div className="space-y-1 text-xs font-mono text-base-content/40">
                                            <div>Code: <span className="text-error">{state.errorDetails.code}</span></div>
                                            <div>Time: {state.errorDetails.timestamp}</div>
                                            <div>Request: {state.errorDetails.requestId}</div>
                                        </div>
                                    </div>
                                )}

                                {state.permissions && (
                                    <div className="bg-base-200 rounded-xl p-5 max-w-xs mx-auto text-left">
                                        <h4 className="text-xs uppercase tracking-wider text-base-content/40 font-semibold mb-3">
                                            Required Permissions
                                        </h4>
                                        <ul className="space-y-2">
                                            {state.permissions.map((p, i) => (
                                                <li key={i} className="flex items-center justify-between text-sm">
                                                    <span className="text-base-content/60">{p.role}</span>
                                                    <span className={`badge badge-sm font-semibold ${p.hasAccess ? "badge-success" : "badge-error"}`}>
                                                        {p.hasAccess ? "Granted" : "Denied"}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
