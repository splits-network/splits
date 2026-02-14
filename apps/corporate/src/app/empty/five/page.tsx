"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Empty State Scenarios ────────────────────────────────────────────────────

const emptyStates = [
    {
        id: "no-results",
        title: "No Signals Detected",
        category: "Search Results",
        categoryColor: "text-info",
        categoryIcon: "fa-duotone fa-regular fa-magnifying-glass",
        description: "Your scan returned zero matches. The observatory found no signals matching your current filter configuration.",
        icon: "fa-duotone fa-regular fa-radar",
        suggestion: "Try adjusting your filters, broadening your search terms, or scanning a different frequency.",
        actions: [
            { label: "Reset Filters", icon: "fa-duotone fa-regular fa-rotate-left", style: "primary" },
            { label: "Browse All", icon: "fa-duotone fa-regular fa-signal-stream", style: "secondary" },
        ],
        visual: (
            <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-info/10 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-3 rounded-full border border-info/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
                <div className="absolute inset-6 rounded-full border border-info/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "1s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#27272a] bg-[#18181b] flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-radar text-2xl text-info/30" />
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "first-time",
        title: "Welcome to the Observatory",
        category: "First-Time User",
        categoryColor: "text-success",
        categoryIcon: "fa-duotone fa-regular fa-rocket",
        description: "Your dashboard is empty because you haven't connected to the network yet. Start by creating your first role or joining an existing recruitment pipeline.",
        icon: "fa-duotone fa-regular fa-satellite-dish",
        suggestion: "Set up your profile, add your recruiting specializations, and publish your first role to get started.",
        actions: [
            { label: "Create Role", icon: "fa-duotone fa-regular fa-plus", style: "primary" },
            { label: "Import Data", icon: "fa-duotone fa-regular fa-cloud-arrow-up", style: "secondary" },
            { label: "Take Tour", icon: "fa-duotone fa-regular fa-compass", style: "secondary" },
        ],
        visual: (
            <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-xl border-2 border-dashed border-success/15 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-xl border-2 border-success/25 bg-success/5 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-satellite-dish text-2xl text-success/40" />
                    </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success/20 border border-success/30 flex items-center justify-center animate-bounce" style={{ animationDuration: "2s" }}>
                    <i className="fa-duotone fa-regular fa-sparkle text-[10px] text-success" />
                </div>
            </div>
        ),
    },
    {
        id: "error",
        title: "Transmission Interrupted",
        category: "Error State",
        categoryColor: "text-error",
        categoryIcon: "fa-duotone fa-regular fa-triangle-exclamation",
        description: "The observatory encountered an unexpected anomaly while processing your request. Our systems detected a disruption in the data feed.",
        icon: "fa-duotone fa-regular fa-sensor-triangle-exclamation",
        suggestion: "This is usually temporary. Try refreshing the page or check the system status for any ongoing incidents.",
        actions: [
            { label: "Retry", icon: "fa-duotone fa-regular fa-rotate", style: "primary" },
            { label: "System Status", icon: "fa-duotone fa-regular fa-signal-stream", style: "secondary" },
            { label: "Report Issue", icon: "fa-duotone fa-regular fa-flag", style: "secondary" },
        ],
        visual: (
            <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-xl border-2 border-error/20 bg-error/5 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-sensor-triangle-exclamation text-3xl text-error/40" />
                    </div>
                </div>
                {/* Glitch lines */}
                <div className="absolute top-6 left-2 right-8 h-px bg-error/20" />
                <div className="absolute top-10 left-6 right-2 h-px bg-error/15" />
                <div className="absolute bottom-8 left-4 right-6 h-px bg-error/20" />
            </div>
        ),
    },
    {
        id: "permissions",
        title: "Clearance Required",
        category: "Access Denied",
        categoryColor: "text-warning",
        categoryIcon: "fa-duotone fa-regular fa-lock",
        description: "You don't have the security clearance to access this observatory module. This section requires elevated permissions from your organization administrator.",
        icon: "fa-duotone fa-regular fa-shield-keyhole",
        suggestion: "Contact your organization admin to request access, or switch to a module you have clearance for.",
        actions: [
            { label: "Request Access", icon: "fa-duotone fa-regular fa-key", style: "primary" },
            { label: "Go to Dashboard", icon: "fa-duotone fa-regular fa-chart-tree-map", style: "secondary" },
        ],
        visual: (
            <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-xl border-2 border-warning/20 bg-warning/5 flex items-center justify-center relative">
                        <i className="fa-duotone fa-regular fa-shield-keyhole text-3xl text-warning/40" />
                    </div>
                </div>
                {/* Lock indicators */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-warning/40" />
                    <span className="w-1 h-1 rounded-full bg-warning/40" />
                    <span className="w-1 h-1 rounded-full bg-warning/40" />
                </div>
            </div>
        ),
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmptyFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".opacity-0"), { opacity: 1 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(".page-header", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            tl.fromTo(".page-desc", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");

            $(".empty-panel").forEach((panel) => {
                gsap.fromTo(
                    panel,
                    { opacity: 0, y: 30, scale: 0.97 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.2)",
                        scrollTrigger: { trigger: panel, start: "top 85%" },
                    },
                );
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb]">
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)" }} />

            <div className="container mx-auto px-4 py-10 max-w-4xl">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">Observatory Online</span>
                    </div>
                    <h1 className="page-header text-3xl md:text-4xl font-bold mb-3 opacity-0">
                        <span className="text-[#e5e7eb]">Empty </span>
                        <span className="text-info">States</span>
                    </h1>
                    <p className="page-desc text-sm text-[#e5e7eb]/40 max-w-lg opacity-0">
                        How the observatory communicates when there is nothing to show. Each state provides context, guidance, and a clear path forward.
                    </p>
                </div>

                {/* Empty state panels */}
                <div className="space-y-8">
                    {emptyStates.map((state) => (
                        <div key={state.id} className="empty-panel opacity-0">
                            {/* Label */}
                            <div className="flex items-center gap-2 mb-3">
                                <i className={`${state.categoryIcon} text-xs ${state.categoryColor}`} />
                                <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${state.categoryColor}`}>{state.category}</span>
                                <div className="h-px flex-1 bg-[#27272a]" />
                            </div>

                            {/* Panel */}
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl overflow-hidden">
                                {/* Terminal header */}
                                <div className="flex items-center gap-2 px-5 py-3 border-b border-[#27272a]/50 bg-[#09090b]/40">
                                    <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
                                    <span className="font-mono text-[10px] text-[#e5e7eb]/15 ml-2">
                                        {state.id}.state
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-8 md:p-12 text-center">
                                    {state.visual}

                                    <h2 className="text-xl md:text-2xl font-bold mb-3">{state.title}</h2>
                                    <p className="text-sm text-[#e5e7eb]/40 max-w-md mx-auto mb-4 leading-relaxed">
                                        {state.description}
                                    </p>

                                    {/* Suggestion box */}
                                    <div className="inline-flex items-start gap-2 border border-[#27272a] bg-[#09090b] rounded-lg px-4 py-3 text-left max-w-md mb-6">
                                        <i className="fa-duotone fa-regular fa-lightbulb text-info/40 text-sm mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-[#e5e7eb]/30 leading-relaxed">{state.suggestion}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {state.actions.map((action, i) => (
                                            <button
                                                key={i}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                                                    action.style === "primary"
                                                        ? "bg-info/10 border border-info/20 text-info hover:bg-info/20"
                                                        : "border border-[#27272a] text-[#e5e7eb]/30 hover:text-[#e5e7eb]/60 hover:border-[#e5e7eb]/10"
                                                }`}
                                            >
                                                <i className={`${action.icon} text-[10px]`} />
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status strip */}
                                <div className="flex items-center gap-2 px-5 py-2.5 border-t border-[#27272a]/50 bg-[#09090b]/40">
                                    <span className={`w-1.5 h-1.5 rounded-full ${state.id === "error" ? "bg-error" : state.id === "permissions" ? "bg-warning" : "bg-[#e5e7eb]/10"}`} />
                                    <span className="font-mono text-[9px] text-[#e5e7eb]/15 uppercase tracking-wider">
                                        {state.id === "error" ? "anomaly-detected" : state.id === "permissions" ? "clearance-insufficient" : state.id === "first-time" ? "awaiting-first-signal" : "scan-complete-zero-results"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-12 pt-8 border-t border-[#27272a]/50">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#27272a]" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#e5e7eb]/10">End of Empty States Showcase</span>
                        <div className="h-px flex-1 bg-[#27272a]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
