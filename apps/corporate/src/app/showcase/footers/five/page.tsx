"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Footer link data ─────────────────────────────────────────────
const FOOTER_SECTIONS = [
    {
        title: "Platform",
        links: [
            { label: "Dashboard", icon: "fa-duotone fa-regular fa-gauge" },
            { label: "Pipeline Tracker", icon: "fa-duotone fa-regular fa-chart-waterfall" },
            { label: "Network Graph", icon: "fa-duotone fa-regular fa-diagram-project" },
            { label: "Signal Intelligence", icon: "fa-duotone fa-regular fa-radar" },
            { label: "Anomaly Detection", icon: "fa-duotone fa-regular fa-sensor-triangle-exclamation" },
        ],
    },
    {
        title: "Network",
        links: [
            { label: "For Recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
            { label: "For Companies", icon: "fa-duotone fa-regular fa-building" },
            { label: "For Candidates", icon: "fa-duotone fa-regular fa-users" },
            { label: "AI Matching", icon: "fa-duotone fa-regular fa-microchip-ai" },
            { label: "Split-Fee Marketplace", icon: "fa-duotone fa-regular fa-handshake" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", icon: "fa-duotone fa-regular fa-book" },
            { label: "API Reference", icon: "fa-duotone fa-regular fa-code" },
            { label: "System Status", icon: "fa-duotone fa-regular fa-signal-stream" },
            { label: "Changelog", icon: "fa-duotone fa-regular fa-list-timeline" },
            { label: "Blog", icon: "fa-duotone fa-regular fa-newspaper" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", icon: "fa-duotone fa-regular fa-circle-info" },
            { label: "Careers", icon: "fa-duotone fa-regular fa-briefcase" },
            { label: "Contact", icon: "fa-duotone fa-regular fa-envelope" },
            { label: "Press", icon: "fa-duotone fa-regular fa-bullhorn" },
            { label: "Partners", icon: "fa-duotone fa-regular fa-link" },
        ],
    },
];

const SOCIAL_LINKS = [
    { label: "Twitter / X", icon: "fa-brands fa-x-twitter" },
    { label: "LinkedIn", icon: "fa-brands fa-linkedin-in" },
    { label: "GitHub", icon: "fa-brands fa-github" },
    { label: "Discord", icon: "fa-brands fa-discord" },
];

const LEGAL_LINKS = [
    "Privacy Policy",
    "Terms of Service",
    "Cookie Policy",
    "Security",
    "GDPR",
];

const SYSTEM_STATS = [
    { label: "Uptime", value: "99.97%", icon: "fa-duotone fa-regular fa-shield-check" },
    { label: "Latency", value: "42ms", icon: "fa-duotone fa-regular fa-gauge" },
    { label: "Nodes", value: "24/24", icon: "fa-duotone fa-regular fa-circle-nodes" },
    { label: "Events/s", value: "1,247", icon: "fa-duotone fa-regular fa-bolt" },
];

// ── Sample content for context above footer ──────────────────────
const SAMPLE_INSIGHTS = [
    { metric: "3.2x", label: "Faster Placements", icon: "fa-duotone fa-regular fa-gauge-max", color: "text-info" },
    { metric: "47%", label: "Cost Reduction", icon: "fa-duotone fa-regular fa-piggy-bank", color: "text-warning" },
    { metric: "94%", label: "Response Rate", icon: "fa-duotone fa-regular fa-comments", color: "text-success" },
    { metric: "12min", label: "Avg. Match Time", icon: "fa-duotone fa-regular fa-bolt", color: "text-accent" },
];

// ── Observatory Footer Component ─────────────────────────────────
function ObservatoryFooter() {
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!footerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(footerRef.current.querySelectorAll(".footer-animate"), { opacity: 1 });
            return;
        }

        gsap.fromTo(
            footerRef.current.querySelectorAll(".footer-animate"),
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.06,
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: "top 90%",
                },
            },
        );
    }, []);

    return (
        <footer ref={footerRef} className="bg-[#0a0a0c] text-[#e5e7eb] border-t border-[#27272a] relative">
            {/* System status strip */}
            <div className="border-b border-[#27272a]/50 bg-[#09090b]">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-9 overflow-x-auto">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-success/60">all systems operational</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            {SYSTEM_STATS.map((stat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <i className={`${stat.icon} text-[10px] text-[#e5e7eb]/20`} />
                                    <span className="font-mono text-[9px] text-[#e5e7eb]/30">{stat.label}</span>
                                    <span className="font-mono text-[9px] text-[#e5e7eb]/50 font-bold">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter section */}
            <div className="border-b border-[#27272a]/50">
                <div className="container mx-auto px-4 py-10">
                    <div className="footer-animate opacity-0 max-w-2xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <i className="fa-duotone fa-regular fa-satellite-dish text-info text-lg" />
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-info/60">Signal Subscription</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Stay in the Loop</h3>
                        <p className="text-sm text-[#e5e7eb]/40 mb-6">
                            Subscribe to network signals -- product updates, market insights, and platform telemetry delivered to your inbox.
                        </p>
                        <div className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="operator@acmecorp.com"
                                className="input input-bordered flex-1 bg-[#09090b] border-[#27272a] text-[#e5e7eb] placeholder:text-[#e5e7eb]/20 focus:border-info font-mono text-sm"
                            />
                            <button className="btn btn-info font-mono uppercase tracking-wider text-[10px] flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-signal-stream" />
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main footer grid */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 footer-animate opacity-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-satellite-dish text-info" />
                            </div>
                            <div className="leading-none">
                                <span className="font-bold text-sm block">Employment Networks</span>
                                <span className="font-mono text-[9px] text-[#e5e7eb]/30 uppercase tracking-wider">data observatory</span>
                            </div>
                        </div>
                        <p className="text-sm text-[#e5e7eb]/40 leading-relaxed mb-6 max-w-xs">
                            Mission control for modern recruiting. See real-time data flows across the entire ecosystem.
                        </p>

                        {/* Social links */}
                        <div className="flex items-center gap-2">
                            {SOCIAL_LINKS.map((social, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    title={social.label}
                                    className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-info hover:border-info/30 transition-colors"
                                >
                                    <i className={`${social.icon} text-sm`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {FOOTER_SECTIONS.map((section, i) => (
                        <div key={i} className="footer-animate opacity-0">
                            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/40 mb-4">{section.title}</h4>
                            <ul className="space-y-2.5">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="flex items-center gap-2 text-sm text-[#e5e7eb]/50 hover:text-[#e5e7eb] transition-colors group">
                                            <i className={`${link.icon} text-[10px] text-[#e5e7eb]/20 group-hover:text-info/60 transition-colors w-4`} />
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#27272a]/50">
                <div className="container mx-auto px-4">
                    <div className="footer-animate opacity-0 flex flex-col md:flex-row items-center justify-between py-5 gap-4">
                        {/* Copyright */}
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-[#e5e7eb]/25">
                                &copy; {new Date().getFullYear()} Employment Networks, Inc.
                            </span>
                            <span className="font-mono text-[10px] text-[#e5e7eb]/15">
                                All rights reserved.
                            </span>
                        </div>

                        {/* Legal links */}
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                            {LEGAL_LINKS.map((link, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="font-mono text-[10px] text-[#e5e7eb]/25 hover:text-[#e5e7eb]/60 transition-colors uppercase tracking-wider"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>

                        {/* Version */}
                        <span className="font-mono text-[9px] text-[#e5e7eb]/15">v2.4.1</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Main Page ────────────────────────────────────────────────────
export default function FootersFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(containerRef.current.querySelectorAll(".animate-in"), { opacity: 1 });
            return;
        }
        gsap.fromTo(
            containerRef.current.querySelectorAll(".animate-in"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 },
        );
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb]">
            {/* Scanline overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                }}
            />

            {/* Page intro */}
            <div className="container mx-auto px-4 py-16">
                <div className="animate-in opacity-0 flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 rounded-full bg-info animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-info/80">Component Library</span>
                    <span className="font-mono text-xs text-[#e5e7eb]/30 ml-auto">footers // showcase</span>
                </div>
                <h1 className="animate-in opacity-0 text-4xl md:text-5xl font-bold mb-4">
                    <span className="text-[#e5e7eb]">Footer </span>
                    <span className="text-info">Design</span>
                </h1>
                <p className="animate-in opacity-0 text-lg text-[#e5e7eb]/50 mb-6 max-w-2xl font-light">
                    Observatory-grade footer with system status telemetry, newsletter signup, multi-section navigation, social links, and legal information.
                </p>
            </div>

            {/* ── Sample content above footer for context ─────────────── */}
            <div className="container mx-auto px-4 mb-16">
                {/* Insights section - gives context above the footer */}
                <div className="animate-in opacity-0 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <i className="fa-duotone fa-regular fa-chart-mixed text-accent text-sm" />
                        <span className="font-mono text-xs uppercase tracking-wider text-accent/80">Sample Page Content</span>
                        <div className="h-px flex-1 bg-[#27272a] ml-2" />
                    </div>
                </div>

                <div className="animate-in opacity-0 grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-12">
                    {SAMPLE_INSIGHTS.map((insight, i) => (
                        <div key={i} className="border border-[#27272a] bg-[#18181b]/60 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-center mx-auto mb-4">
                                <i className={`${insight.icon} text-lg ${insight.color}`} />
                            </div>
                            <div className={`font-mono text-3xl font-bold ${insight.color} mb-1`}>{insight.metric}</div>
                            <div className="font-bold text-sm text-[#e5e7eb] mb-1">{insight.label}</div>
                        </div>
                    ))}
                </div>

                {/* CTA section before footer */}
                <div className="animate-in opacity-0 max-w-3xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center gap-2 border border-[#27272a] rounded-full px-4 py-2 mb-6">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-xs uppercase tracking-wider text-[#e5e7eb]/50">All systems operational</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to see the <span className="text-info">full picture?</span>
                    </h2>
                    <p className="text-[#e5e7eb]/50 mb-8">
                        Join the recruiting ecosystem that gives you visibility and data-driven confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="#" className="btn btn-info font-mono uppercase tracking-wider text-xs">
                            <i className="fa-duotone fa-regular fa-rocket" />
                            Enter the Observatory
                        </a>
                        <a href="#" className="btn btn-outline border-[#27272a] text-[#e5e7eb]/60 font-mono uppercase tracking-wider text-xs hover:bg-[#18181b] hover:border-info/50 hover:text-info">
                            <i className="fa-duotone fa-regular fa-circle-play" />
                            Watch Demo
                        </a>
                    </div>
                </div>
            </div>

            {/* ── The Footer ──────────────────────────────────────────── */}
            <ObservatoryFooter />

            {/* ── Features breakdown ──────────────────────────────────── */}
            <div className="bg-[#09090b] border-t border-[#27272a]">
                <div className="container mx-auto px-4 py-16">
                    <div className="animate-in opacity-0 mb-8">
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent/60 block mb-3">Anatomy</span>
                        <h2 className="text-3xl font-bold mb-2">Footer Features</h2>
                        <p className="text-[#e5e7eb]/50">Every element of the observatory footer, documented.</p>
                    </div>
                    <div className="animate-in opacity-0 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "System Status Strip", desc: "Live telemetry bar showing uptime, latency, node count, and event throughput", icon: "fa-duotone fa-regular fa-signal-stream", color: "text-success" },
                            { title: "Newsletter Signup", desc: "Email subscription with observatory-themed copy and signal terminology", icon: "fa-duotone fa-regular fa-satellite-dish", color: "text-info" },
                            { title: "4-Column Navigation", desc: "Platform, Network, Resources, and Company sections with icon-prefixed links", icon: "fa-duotone fa-regular fa-grid-2", color: "text-warning" },
                            { title: "Brand Column", desc: "Logo, tagline, description, and social media links", icon: "fa-duotone fa-regular fa-layer-group", color: "text-accent" },
                            { title: "Social Links", desc: "Twitter/X, LinkedIn, GitHub, Discord with hover accent transitions", icon: "fa-duotone fa-regular fa-share-nodes", color: "text-info" },
                            { title: "Legal Bar", desc: "Copyright, privacy, terms, cookies, security, and GDPR links", icon: "fa-duotone fa-regular fa-scale-balanced", color: "text-error" },
                            { title: "Responsive Layout", desc: "5-column grid on desktop, 2-column on tablet, stacked on mobile", icon: "fa-duotone fa-regular fa-display", color: "text-warning" },
                            { title: "GSAP + ScrollTrigger", desc: "Staggered entrance animations triggered on scroll into viewport", icon: "fa-duotone fa-regular fa-sparkles", color: "text-accent" },
                        ].map((feat, i) => (
                            <div key={i} className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-5">
                                <i className={`${feat.icon} ${feat.color} text-lg mb-3 block`} />
                                <h4 className="font-bold text-sm mb-1">{feat.title}</h4>
                                <p className="text-xs text-[#e5e7eb]/40 leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
