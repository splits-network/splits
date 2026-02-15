"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmptySevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-empty-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-empty-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-empty-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, "-=0.2");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59,92,204,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,92,204,0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    <div className="bp-empty-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-EMPTY07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            SHOWCASE
                        </div>
                    </div>

                    <h1 className="bp-empty-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                        Empty <span className="text-[#3b5ccc]">States</span>
                    </h1>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-12">// SYSTEM STATE HANDLERS</p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* ═══ No Search Results ═══ */}
                        <div className="bp-empty-card border border-[#3b5ccc]/15 opacity-0">
                            <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                STATE-001 // NO SEARCH RESULTS
                            </div>
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 border-2 border-[#3b5ccc]/15 flex items-center justify-center mx-auto mb-6 relative">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-3xl text-[#3b5ccc]/15"></i>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border border-[#ef4444]/30 bg-[#0a0e17] flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-xmark text-[10px] text-[#ef4444]/60"></i>
                                    </div>
                                </div>
                                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                                    // QUERY RETURNED ZERO RESULTS
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">No Matching Records</h3>
                                <p className="text-sm text-[#c8ccd4]/30 leading-relaxed mb-6 max-w-xs mx-auto">
                                    Your search query did not match any records in the database. Try adjusting your filters or search terms.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                    <button className="px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]">
                                        CLEAR_FILTERS
                                    </button>
                                    <button className="px-5 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                        BROWSE_ALL
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ═══ First Time / No Data ═══ */}
                        <div className="bp-empty-card border border-[#3b5ccc]/15 opacity-0">
                            <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                STATE-002 // NO DATA YET
                            </div>
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 border-2 border-[#14b8a6]/15 flex items-center justify-center mx-auto mb-6 relative">
                                    <i className="fa-duotone fa-regular fa-inbox text-3xl text-[#14b8a6]/15"></i>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border border-[#14b8a6]/30 bg-[#0a0e17] flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-sparkles text-[10px] text-[#14b8a6]/60"></i>
                                    </div>
                                </div>
                                <div className="font-mono text-[10px] text-[#14b8a6]/40 tracking-widest mb-3">
                                    // WELCOME, OPERATOR
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">Your Dashboard is Empty</h3>
                                <p className="text-sm text-[#c8ccd4]/30 leading-relaxed mb-6 max-w-xs mx-auto">
                                    You have not created any job postings yet. Start by creating your first role specification to activate your pipeline.
                                </p>
                                <button className="px-6 py-2.5 bg-[#14b8a6] text-white font-mono text-[10px] tracking-widest hover:bg-[#14b8a6]/90 transition-colors border border-[#14b8a6]">
                                    <i className="fa-duotone fa-regular fa-plus text-[8px] mr-2"></i>
                                    CREATE_FIRST_ROLE
                                </button>
                                <div className="mt-6 pt-6 border-t border-[#3b5ccc]/10">
                                    <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider">
                                        NEED HELP? <a href="#" className="text-[#3b5ccc]/50 hover:text-[#3b5ccc] transition-colors">VIEW_QUICKSTART_GUIDE</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ Error State ═══ */}
                        <div className="bp-empty-card border border-[#ef4444]/15 opacity-0">
                            <div className="font-mono text-[9px] text-[#ef4444]/30 tracking-widest px-6 py-3 border-b border-[#ef4444]/10">
                                STATE-003 // SYSTEM ERROR
                            </div>
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 border-2 border-[#ef4444]/15 flex items-center justify-center mx-auto mb-6 relative">
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-3xl text-[#ef4444]/15"></i>
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border border-[#ef4444]/30 bg-[#0a0e17] flex items-center justify-center">
                                        <span className="font-mono text-[8px] text-[#ef4444]/60 font-bold">!</span>
                                    </div>
                                </div>
                                <div className="font-mono text-[10px] text-[#ef4444]/40 tracking-widest mb-3">
                                    // ERROR CODE: 500
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">Something Went Wrong</h3>
                                <p className="text-sm text-[#c8ccd4]/30 leading-relaxed mb-4 max-w-xs mx-auto">
                                    An unexpected error occurred while processing your request. Our engineering team has been notified.
                                </p>
                                <div className="border border-[#ef4444]/10 bg-[#ef4444]/5 p-3 mb-6 mx-auto max-w-xs">
                                    <div className="font-mono text-[9px] text-[#ef4444]/40 tracking-wider">
                                        ERR_INTERNAL_SERVICE_FAILURE
                                    </div>
                                    <div className="font-mono text-[8px] text-[#c8ccd4]/15 mt-1">
                                        Request ID: req_7f3a9b2c1d4e
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                    <button className="px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]">
                                        RETRY_REQUEST
                                    </button>
                                    <button className="px-5 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                        REPORT_ISSUE
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ═══ Access Denied ═══ */}
                        <div className="bp-empty-card border border-[#eab308]/15 opacity-0">
                            <div className="font-mono text-[9px] text-[#eab308]/30 tracking-widest px-6 py-3 border-b border-[#eab308]/10">
                                STATE-004 // ACCESS RESTRICTED
                            </div>
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 border-2 border-[#eab308]/15 flex items-center justify-center mx-auto mb-6 relative">
                                    <i className="fa-duotone fa-regular fa-lock text-3xl text-[#eab308]/15"></i>
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border border-[#eab308]/30 bg-[#0a0e17] flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-shield text-[10px] text-[#eab308]/60"></i>
                                    </div>
                                </div>
                                <div className="font-mono text-[10px] text-[#eab308]/40 tracking-widest mb-3">
                                    // CLEARANCE LEVEL INSUFFICIENT
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">Access Denied</h3>
                                <p className="text-sm text-[#c8ccd4]/30 leading-relaxed mb-4 max-w-xs mx-auto">
                                    You do not have the required permissions to access this resource. Contact your organization administrator for access.
                                </p>
                                <div className="border border-[#eab308]/10 bg-[#eab308]/5 p-3 mb-6 mx-auto max-w-xs">
                                    <div className="font-mono text-[9px] text-[#eab308]/40 tracking-wider">
                                        REQUIRED: ROLE_ADMIN or ROLE_MANAGER
                                    </div>
                                    <div className="font-mono text-[8px] text-[#c8ccd4]/15 mt-1">
                                        CURRENT: ROLE_VIEWER
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                    <button className="px-5 py-2.5 border border-[#eab308]/30 text-[#eab308] font-mono text-[10px] tracking-widest hover:bg-[#eab308]/10 transition-colors">
                                        REQUEST_ACCESS
                                    </button>
                                    <button className="px-5 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                        GO_BACK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
