"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };
const BG = { deep: "#0a1628", mid: "#0d1d33", card: "#0f2847", dark: "#081220", input: "#0b1a2e" };

export default function EmptyEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => containerRef.current!.querySelectorAll(s);
        const $1 = (s: string) => containerRef.current!.querySelector(s);

        gsap.fromTo($1(".bp-empty-header"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth });

        // Each empty state section animates on scroll
        $(".bp-empty-card").forEach((card) => {
            gsap.fromTo(card, { opacity: 0, y: 30, scale: 0.97 }, {
                opacity: 1, y: 0, scale: 1, duration: D.build, ease: E.bounce,
                scrollTrigger: { trigger: card, start: "top 85%" },
            });
        });

        // Icons bounce in
        $(".bp-empty-icon").forEach((icon) => {
            gsap.fromTo(icon, { opacity: 0, scale: 0, rotation: -15 }, {
                opacity: 1, scale: 1, rotation: 0, duration: D.fast, ease: E.elastic, delay: 0.3,
                scrollTrigger: { trigger: icon, start: "top 85%" },
            });
        });

        // Blueprint lines in empty illustrations
        $(".bp-empty-line").forEach((line) => {
            gsap.fromTo(line, { scaleX: 0 }, {
                scaleX: 1, duration: D.build, ease: E.smooth, delay: 0.4,
                scrollTrigger: { trigger: line, start: "top 85%" },
            });
        });

        gsap.fromTo($(".bp-corner"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: D.fast, ease: E.elastic, stagger: S.normal, delay: 0.5 });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: BG.deep }}>
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="bp-corner fixed top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />

            {/* Header */}
            <div className="bp-empty-header border-b opacity-0" style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.12)" }}>
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/30" style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                            <i className="fa-duotone fa-regular fa-ghost text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-xl">Empty States</h1>
                            <p className="text-[10px] font-mono text-cyan-500/50">ZERO-DATA PATTERNS // BLUEPRINT CONSTRUCTION</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* ══════════════════════════════════════════════════════════════
                        1. NO SEARCH RESULTS
                       ══════════════════════════════════════════════════════════════ */}
                    <div className="bp-empty-card rounded-xl border border-cyan-500/12 overflow-hidden opacity-0" style={{ backgroundColor: BG.card }}>
                        <div className="px-6 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(34,211,238,0.08)" }}>
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-xs text-cyan-500/40" />
                            <span className="text-[10px] font-mono text-cyan-500/40 uppercase tracking-wider">Empty State: No Search Results</span>
                        </div>

                        {/* Mock search bar */}
                        <div className="px-6 pt-5">
                            <div className="relative max-w-lg">
                                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-cyan-500/25" />
                                <div className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyan-500/15 text-sm text-slate-400" style={{ backgroundColor: BG.input }}>
                                    &quot;quantum blockchain engineer senior&quot;
                                </div>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] border border-cyan-500/15 text-cyan-500/40" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>Engineering</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] border border-cyan-500/15 text-cyan-500/40" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>Remote</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] border border-cyan-500/15 text-cyan-500/40" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>$200K+</span>
                            </div>
                        </div>

                        <div className="px-6 py-12 text-center">
                            {/* Blueprint illustration */}
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-cyan-500/10" />
                                <div className="bp-empty-line absolute top-1/3 left-4 right-4 h-px origin-left" style={{ backgroundColor: "rgba(34,211,238,0.15)" }} />
                                <div className="bp-empty-line absolute top-2/3 left-4 right-4 h-px origin-left" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                <div className="bp-empty-icon absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-cyan-500/20" style={{ backgroundColor: "rgba(34,211,238,0.05)" }}>
                                        <i className="fa-duotone fa-regular fa-magnifying-glass-minus text-2xl text-cyan-500/25" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">No matching blueprints found</h3>
                            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
                                We could not find any roles matching your search criteria. Try broadening your filters or adjusting your search terms.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button className="px-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                    <i className="fa-duotone fa-regular fa-filter-slash mr-1.5" />Clear Filters
                                </button>
                                <button className="px-4 py-2.5 rounded-lg text-sm font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}>
                                    <i className="fa-duotone fa-regular fa-bell mr-1.5" />Set Alert
                                </button>
                            </div>

                            <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(34,211,238,0.06)" }}>
                                <p className="text-[10px] font-mono text-slate-600 mb-3">SUGGESTED SEARCHES</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {["Backend Engineer", "Full-Stack Developer", "Senior Engineer Remote", "ML Engineer"].map((s) => (
                                        <button key={s} className="px-3 py-1.5 rounded-lg border border-cyan-500/10 text-xs text-slate-500 hover:text-cyan-400 hover:border-cyan-500/25 transition-colors" style={{ backgroundColor: BG.input }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════
                        2. FIRST TIME USER / NO DATA YET
                       ══════════════════════════════════════════════════════════════ */}
                    <div className="bp-empty-card rounded-xl border border-cyan-500/12 overflow-hidden opacity-0" style={{ backgroundColor: BG.card }}>
                        <div className="px-6 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(34,211,238,0.08)" }}>
                            <i className="fa-duotone fa-regular fa-sparkles text-xs text-cyan-500/40" />
                            <span className="text-[10px] font-mono text-cyan-500/40 uppercase tracking-wider">Empty State: First-Time User</span>
                        </div>

                        <div className="px-6 py-12 text-center">
                            {/* Construction site illustration */}
                            <div className="relative w-40 h-36 mx-auto mb-6">
                                {/* Foundation line */}
                                <div className="bp-empty-line absolute bottom-4 left-2 right-2 h-0.5 origin-left" style={{ backgroundColor: "rgba(34,211,238,0.2)" }} />
                                {/* Grid marks */}
                                <div className="absolute bottom-4 left-6 w-px h-8" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                <div className="absolute bottom-4 left-1/2 w-px h-12" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                <div className="absolute bottom-4 right-6 w-px h-6" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                {/* Corner marks */}
                                <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-cyan-500/15" />
                                <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-cyan-500/15" />

                                <div className="bp-empty-icon absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed border-cyan-500/20" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>
                                        <i className="fa-duotone fa-regular fa-hard-hat text-3xl text-cyan-500/30" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">Time to break ground</h3>
                            <p className="text-sm text-slate-400 mb-1">Welcome to Splits Network. Your dashboard is ready.</p>
                            <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
                                Start by posting your first role to the marketplace and recruiters will begin submitting candidates.
                            </p>

                            {/* Getting started steps */}
                            <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                                {[
                                    { step: "01", label: "Create a role", icon: "fa-duotone fa-regular fa-plus", desc: "Define the position" },
                                    { step: "02", label: "Set split terms", icon: "fa-duotone fa-regular fa-handshake", desc: "Define fee structure" },
                                    { step: "03", label: "Go live", icon: "fa-duotone fa-regular fa-rocket", desc: "Publish to marketplace" },
                                ].map((item) => (
                                    <div key={item.step} className="rounded-lg p-4 border border-cyan-500/10 text-center" style={{ backgroundColor: BG.input }}>
                                        <div className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "rgba(34,211,238,0.06)" }}>
                                            <i className={`${item.icon} text-sm text-cyan-500/50`} />
                                        </div>
                                        <div className="text-[9px] font-mono text-cyan-500/30 mb-1">STEP {item.step}</div>
                                        <div className="text-xs font-medium text-white mb-0.5">{item.label}</div>
                                        <div className="text-[10px] text-slate-600">{item.desc}</div>
                                    </div>
                                ))}
                            </div>

                            <button className="px-6 py-2.5 rounded-lg text-sm font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}>
                                <i className="fa-duotone fa-regular fa-plus mr-1.5" />Create Your First Role
                            </button>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════
                        3. ERROR STATE / SOMETHING WENT WRONG
                       ══════════════════════════════════════════════════════════════ */}
                    <div className="bp-empty-card rounded-xl border border-red-500/15 overflow-hidden opacity-0" style={{ backgroundColor: BG.card }}>
                        <div className="px-6 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(239,68,68,0.1)" }}>
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-xs text-red-500/50" />
                            <span className="text-[10px] font-mono text-red-500/40 uppercase tracking-wider">Empty State: Error / System Failure</span>
                        </div>

                        <div className="px-6 py-12 text-center">
                            {/* Broken blueprint illustration */}
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-red-500/10" />
                                {/* Broken lines */}
                                <div className="bp-empty-line absolute top-1/3 left-4 w-[35%] h-px origin-left" style={{ backgroundColor: "rgba(239,68,68,0.2)" }} />
                                <div className="bp-empty-line absolute top-1/3 right-4 w-[35%] h-px origin-right" style={{ backgroundColor: "rgba(239,68,68,0.15)" }} />
                                <div className="bp-empty-line absolute top-2/3 left-4 right-4 h-px origin-left" style={{ backgroundColor: "rgba(239,68,68,0.1)" }} />

                                <div className="bp-empty-icon absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-red-500/20" style={{ backgroundColor: "rgba(239,68,68,0.05)" }}>
                                        <i className="fa-duotone fa-regular fa-wrench text-2xl text-red-500/30" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">Construction halted</h3>
                            <p className="text-sm text-slate-400 mb-2">Something went wrong while loading your data.</p>
                            <p className="text-xs text-slate-600 mb-6 max-w-md mx-auto">
                                Our engineering team has been notified. This is usually temporary. If the problem persists, please contact support.
                            </p>

                            {/* Error details */}
                            <div className="inline-block rounded-lg px-4 py-2 mb-6 border border-red-500/10 text-left" style={{ backgroundColor: "rgba(239,68,68,0.04)" }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <span className="text-[10px] font-mono text-red-400/60">ERROR CODE: 503</span>
                                </div>
                                <p className="text-[11px] font-mono text-slate-600">Service temporarily unavailable. Retry in 30 seconds.</p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button className="px-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                    <i className="fa-duotone fa-regular fa-rotate-right mr-1.5" />Retry
                                </button>
                                <button className="px-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                                    <i className="fa-duotone fa-regular fa-headset mr-1.5" />Contact Support
                                </button>
                                <button className="px-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                                    <i className="fa-duotone fa-regular fa-signal-bars mr-1.5" />Status Page
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════
                        4. PERMISSIONS / ACCESS DENIED
                       ══════════════════════════════════════════════════════════════ */}
                    <div className="bp-empty-card rounded-xl border border-orange-500/12 overflow-hidden opacity-0" style={{ backgroundColor: BG.card }}>
                        <div className="px-6 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(251,146,60,0.08)" }}>
                            <i className="fa-duotone fa-regular fa-lock text-xs text-orange-500/40" />
                            <span className="text-[10px] font-mono text-orange-500/40 uppercase tracking-wider">Empty State: Access Denied</span>
                        </div>

                        <div className="px-6 py-12 text-center">
                            {/* Locked blueprint illustration */}
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-orange-500/10" />
                                {/* Barrier lines */}
                                <div className="absolute top-[45%] left-0 right-0 flex items-center gap-1 px-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="flex-1 h-0.5" style={{ backgroundColor: i % 2 === 0 ? "rgba(251,146,60,0.2)" : "transparent" }} />
                                    ))}
                                </div>
                                <div className="absolute top-[55%] left-0 right-0 flex items-center gap-1 px-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="flex-1 h-0.5" style={{ backgroundColor: i % 2 === 1 ? "rgba(251,146,60,0.15)" : "transparent" }} />
                                    ))}
                                </div>

                                <div className="bp-empty-icon absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-orange-500/20" style={{ backgroundColor: "rgba(251,146,60,0.05)" }}>
                                        <i className="fa-duotone fa-regular fa-shield-keyhole text-2xl text-orange-500/30" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">Restricted area</h3>
                            <p className="text-sm text-slate-400 mb-2">You do not have permission to access this section.</p>
                            <p className="text-xs text-slate-600 mb-6 max-w-md mx-auto">
                                This content requires elevated access. Contact your organization administrator to request the appropriate role permissions.
                            </p>

                            {/* Required permissions */}
                            <div className="inline-block rounded-lg px-5 py-3 mb-6 border border-orange-500/10 text-left" style={{ backgroundColor: "rgba(251,146,60,0.03)" }}>
                                <div className="text-[10px] font-mono text-orange-400/50 mb-2">REQUIRED PERMISSIONS</div>
                                <div className="space-y-1.5">
                                    {[
                                        { perm: "billing:read", desc: "View billing data" },
                                        { perm: "billing:write", desc: "Manage subscriptions" },
                                    ].map((p) => (
                                        <div key={p.perm} className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-key text-[9px] text-orange-500/30" />
                                            <code className="text-[11px] font-mono text-orange-400/60">{p.perm}</code>
                                            <span className="text-[10px] text-slate-600">- {p.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button className="px-4 py-2.5 rounded-lg border border-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                    <i className="fa-duotone fa-regular fa-arrow-left mr-1.5" />Go Back
                                </button>
                                <button className="px-4 py-2.5 rounded-lg text-sm font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}>
                                    <i className="fa-duotone fa-regular fa-envelope mr-1.5" />Request Access
                                </button>
                            </div>

                            <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(34,211,238,0.06)" }}>
                                <p className="text-[10px] font-mono text-slate-700">
                                    CURRENT ROLE: <span className="text-slate-500">Recruiter</span> // ORG: <span className="text-slate-500">Acme Recruiting LLC</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
