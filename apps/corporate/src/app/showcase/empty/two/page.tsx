"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function EmptyTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeScenario, setActiveScenario] = useState(0);

    const scenarios = [
        { label: "No Results", icon: "fa-duotone fa-regular fa-magnifying-glass" },
        { label: "First Time", icon: "fa-duotone fa-regular fa-sparkles" },
        { label: "Error", icon: "fa-duotone fa-regular fa-triangle-exclamation" },
        { label: "No Access", icon: "fa-duotone fa-regular fa-lock" },
    ];

    useGSAP(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.from("[data-eh]", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
        gsap.from("[data-etab]", { y: -10, opacity: 0, duration: 0.4, stagger: 0.06, ease: "power2.out", delay: 0.2 });
        gsap.from("[data-estate]", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.4 });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            <div data-eh className="border-b border-base-300">
                <div className="max-w-4xl mx-auto px-6 md:px-10 py-8">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-base-content/30 font-semibold mb-2">UI Patterns</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">Empty States</h1>
                    <p className="text-sm text-base-content/40 mt-2">How the interface responds when there is nothing to show.</p>
                </div>
            </div>

            <div className="border-b border-base-200">
                <div className="max-w-4xl mx-auto px-6 md:px-10 flex gap-1 overflow-x-auto py-2">
                    {scenarios.map((s, i) => (
                        <button key={s.label} data-etab onClick={() => setActiveScenario(i)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeScenario === i ? "bg-base-content text-base-100" : "text-base-content/40 hover:text-base-content/60 hover:bg-base-200/50"}`}>
                            <i className={`${s.icon} text-xs`} />{s.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24">
                <div data-estate>
                    {/* No Search Results */}
                    {activeScenario === 0 && (
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-24 h-24 rounded-2xl bg-base-200/50 flex items-center justify-center mx-auto mb-8">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-4xl text-base-content/15" />
                            </div>
                            <h2 className="text-xl font-bold text-base-content mb-3">No results found</h2>
                            <p className="text-sm text-base-content/45 leading-relaxed mb-8">
                                We could not find any jobs matching &ldquo;Senior Blockchain Engineer in Antarctica.&rdquo; Try adjusting your search terms or removing some filters.
                            </p>
                            <div className="space-y-3">
                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    <span className="px-3 py-1.5 bg-base-200/50 rounded-full text-xs text-base-content/40">Try: &ldquo;Senior Engineer&rdquo;</span>
                                    <span className="px-3 py-1.5 bg-base-200/50 rounded-full text-xs text-base-content/40">Try: &ldquo;Remote roles&rdquo;</span>
                                    <span className="px-3 py-1.5 bg-base-200/50 rounded-full text-xs text-base-content/40">Try: &ldquo;All locations&rdquo;</span>
                                </div>
                                <button className="px-6 py-3 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">Clear All Filters</button>
                                <p className="text-xs text-base-content/25 mt-4">Or <a href="#" className="text-secondary font-semibold hover:underline">set up an alert</a> to get notified when matching jobs appear.</p>
                            </div>
                        </div>
                    )}

                    {/* First Time / No Data Yet */}
                    {activeScenario === 1 && (
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-24 h-24 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-8">
                                <i className="fa-duotone fa-regular fa-sparkles text-4xl text-secondary/40" />
                            </div>
                            <h2 className="text-xl font-bold text-base-content mb-3">Welcome to your dashboard</h2>
                            <p className="text-sm text-base-content/45 leading-relaxed mb-8">
                                This is where your recruiting activity will live. Post your first job, connect with partners, and start building your split-fee network.
                            </p>
                            <div className="space-y-3 max-w-xs mx-auto">
                                {[
                                    { icon: "fa-duotone fa-regular fa-briefcase", label: "Post your first job", desc: "Create a listing and attract recruiters" },
                                    { icon: "fa-duotone fa-regular fa-user-plus", label: "Complete your profile", desc: "Help partners understand your expertise" },
                                    { icon: "fa-duotone fa-regular fa-share-nodes", label: "Explore the network", desc: "Browse available split-fee opportunities" },
                                ].map((step, i) => (
                                    <a key={i} href="#" className="flex items-center gap-4 p-4 border border-base-200 rounded-xl hover:border-secondary/30 hover:bg-secondary/5 transition-all text-left group">
                                        <div className="w-10 h-10 rounded-lg bg-base-200/60 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 transition-colors">
                                            <i className={`${step.icon} text-sm text-base-content/30 group-hover:text-secondary transition-colors`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-base-content">{step.label}</p>
                                            <p className="text-xs text-base-content/40">{step.desc}</p>
                                        </div>
                                        <i className="fa-duotone fa-regular fa-arrow-right text-xs text-base-content/20 ml-auto group-hover:text-secondary transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {activeScenario === 2 && (
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-24 h-24 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-8">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-4xl text-error/30" />
                            </div>
                            <h2 className="text-xl font-bold text-base-content mb-3">Something went wrong</h2>
                            <p className="text-sm text-base-content/45 leading-relaxed mb-4">
                                We encountered an unexpected error while loading your data. Our team has been notified and is looking into it.
                            </p>
                            <div className="p-4 bg-base-200/30 rounded-xl mb-8">
                                <p className="text-[11px] font-mono text-base-content/30">Error code: ERR_500_INTERNAL &middot; Request ID: req_8x7kL9mN</p>
                            </div>
                            <div className="flex flex-col gap-3 items-center">
                                <button className="px-6 py-3 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                                    <i className="fa-duotone fa-regular fa-arrow-rotate-right text-xs mr-2" />Try Again
                                </button>
                                <p className="text-xs text-base-content/25">If this persists, <a href="#" className="text-secondary font-semibold hover:underline">contact support</a> or check the <a href="#" className="text-secondary font-semibold hover:underline">status page</a>.</p>
                            </div>
                        </div>
                    )}

                    {/* Access Denied */}
                    {activeScenario === 3 && (
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-24 h-24 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-8">
                                <i className="fa-duotone fa-regular fa-lock text-4xl text-warning/30" />
                            </div>
                            <h2 className="text-xl font-bold text-base-content mb-3">Access restricted</h2>
                            <p className="text-sm text-base-content/45 leading-relaxed mb-8">
                                You do not have permission to view this content. This area is available to Pro and Enterprise users. Upgrade your plan to unlock full access to the recruiter network.
                            </p>
                            <div className="p-5 border border-base-200 rounded-xl mb-8 text-left">
                                <p className="text-xs font-semibold text-base-content mb-3">Pro plan includes:</p>
                                <ul className="space-y-2">
                                    {["Unlimited split-fee proposals", "Advanced analytics dashboard", "Priority AI matching", "Dedicated account manager"].map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-xs text-base-content/50"><i className="fa-duotone fa-regular fa-check text-secondary text-[10px]" />{f}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex flex-col gap-3 items-center">
                                <button className="px-6 py-3 bg-secondary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">Upgrade to Pro</button>
                                <button className="text-xs text-base-content/40 hover:text-base-content/60 transition-colors">Go back to dashboard</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
