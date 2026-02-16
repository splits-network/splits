import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { UpdatesAnimator } from "./updates-animator";

export const metadata: Metadata = {
    title: "Platform Updates & Roadmap | Splits Network",
    description:
        "We build in public. Follow the evolution of Splits Network -- from alpha to launch and beyond. See what we've shipped, what's next, and where we're headed.",
    openGraph: {
        title: "Platform Updates & Roadmap | Splits Network",
        description:
            "We build in public. Follow the evolution of Splits Network -- from alpha to launch and beyond.",
        url: "https://splits.network/public/updates",
    },
    ...buildCanonical("/public/updates"),
};

// ─── Data ────────────────────────────────────────────────────────────────────

const keyStats = [
    { value: "Phase 1", label: "Live & Running", color: "#FF6B6B" },
    { value: "3 Apps", label: "Portal, Candidate, Corporate", color: "#4ECDC4" },
    { value: "50+", label: "Features Shipped", color: "#FFE66D" },
    { value: "Open", label: "Public Roadmap", color: "#A78BFA" },
];

const timelineEvents = [
    {
        year: "OCT 2025",
        title: "Alpha Development",
        text: "Core architecture built and internal testing completed. Twelve microservices deployed, Clerk authentication configured, and foundational features validated across all three applications.",
        color: "#FFE66D",
    },
    {
        year: "NOV 2025",
        title: "Beta Testing Phase",
        text: "Selected recruiters and companies put the platform through its paces. Ten beta recruiters submitted over fifty candidates. Five companies posted real roles. Every piece of feedback was incorporated into UX improvements.",
        color: "#4ECDC4",
    },
    {
        year: "DEC 2025",
        title: "Platform Launch",
        text: "Splits Network Phase 1 goes live. Full ATS with roles, candidates, and pipeline stages. Split placement tracking. Recruiter network management. Three-tier subscription model. Email notifications. Admin console. The foundation is set.",
        color: "#FF6B6B",
    },
];

const phase2Features = [
    {
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        title: "Payment Processing",
        text: "Integrated payment flows with Stripe Connect. Companies pay the platform, and automatic splits are distributed to recruiters based on verified milestones.",
        color: "#FF6B6B",
    },
    {
        icon: "fa-duotone fa-regular fa-plug",
        title: "Integrations Marketplace",
        text: "Connect with Gmail, Outlook, Calendly, LinkedIn, and other essential tools. Zapier integration for custom workflows.",
        color: "#4ECDC4",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Advanced Analytics",
        text: "Detailed performance metrics, ROI tracking, conversion rates, and custom reporting dashboards for both recruiters and companies.",
        color: "#FFE66D",
    },
    {
        icon: "fa-duotone fa-regular fa-mobile-screen",
        title: "Mobile Apps",
        text: "Native iOS and Android apps for recruiters to manage candidates and track placements on the go.",
        color: "#A78BFA",
    },
];

const phase3Features = [
    {
        icon: "fa-duotone fa-regular fa-brain",
        title: "AI-Powered Matching",
        text: "Smart candidate-to-role matching using machine learning. Automatic recruiter recommendations based on specialties and track record.",
        color: "#4ECDC4",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Multi-Recruiter Splits",
        text: "Support for multiple recruiters collaborating on a single placement with configurable split percentages and role-based contributions.",
        color: "#FF6B6B",
    },
    {
        icon: "fa-duotone fa-regular fa-code",
        title: "Public API",
        text: "Full REST API with webhooks, OAuth 2.0, and comprehensive documentation for custom integrations and third-party tools.",
        color: "#FFE66D",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "White-Label Options",
        text: "Recruiting firms can customize branding, domain, and certain features for their own recruiter networks.",
        color: "#A78BFA",
    },
];

const futureVision = [
    { icon: "fa-duotone fa-regular fa-globe", text: "International expansion with multi-currency support", color: "#FF6B6B" },
    { icon: "fa-duotone fa-regular fa-building-columns", text: "Enterprise features for large recruiting firms", color: "#4ECDC4" },
    { icon: "fa-duotone fa-regular fa-graduation-cap", text: "Training and certification programs", color: "#FFE66D" },
    { icon: "fa-duotone fa-regular fa-trophy", text: "Gamification and leaderboards", color: "#A78BFA" },
    { icon: "fa-duotone fa-regular fa-handshake", text: "Specialized recruiting services marketplace", color: "#FF6B6B" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UpdatesPage() {
    return (
        <UpdatesAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO HEADER
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-hero relative min-h-[70vh] overflow-hidden flex items-center"
                style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full opacity-0"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full opacity-0"
                        style={{ backgroundColor: "#FFE66D" }} />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 opacity-0"
                        style={{ backgroundColor: "#A78BFA" }} />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 opacity-0"
                        style={{ backgroundColor: "#FF6B6B" }} />
                    {/* Triangle */}
                    <div className="memphis-shape absolute top-[18%] left-[45%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "25px solid transparent",
                            borderRight: "25px solid transparent",
                            borderBottom: "43px solid #FFE66D",
                            transform: "rotate(-10deg)",
                        }} />
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[20%] right-[45%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4ECDC4" }} />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Category + badge */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                <i className="fa-duotone fa-regular fa-signal-stream"></i>
                                Building In Public
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em]"
                                style={{ color: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                Updated February 2026
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 opacity-0"
                            style={{ color: "#FFFFFF" }}>
                            Platform Updates{" "}
                            <span className="relative inline-block">
                                <span style={{ color: "#FF6B6B" }}>&amp; Roadmap</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#FF6B6B" }} />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 opacity-0"
                            style={{ color: "rgba(255,255,255,0.7)" }}>
                            We build in the open. Every feature shipped, every milestone hit,
                            every ambitious plan for what&apos;s next -- laid out for the community
                            that&apos;s building this platform with us.
                        </p>

                        {/* Byline */}
                        <div className="hero-byline flex items-center gap-4 opacity-0">
                            <div className="w-14 h-14 flex items-center justify-center font-black text-lg"
                                style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                SN
                            </div>
                            <div>
                                <div className="font-bold uppercase tracking-wide text-sm" style={{ color: "#FFFFFF" }}>
                                    Splits Network Team
                                </div>
                                <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    Product &amp; Engineering
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div key={index}
                            className="stat-block p-6 md:p-8 text-center opacity-0"
                            style={{
                                backgroundColor: stat.color,
                                color: stat.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF",
                            }}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INTRODUCTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-intro py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="intro-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
                                style={{ color: "#1A1A2E" }}>
                                Why We Build{" "}
                                <span style={{ color: "#4ECDC4" }}>In Public</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                Splits Network started with a simple observation: the recruiting industry
                                runs on trust, but the tools recruiters use are built behind closed doors.
                                We decided to do things differently. Every feature we ship, every decision
                                we make, every roadmap item we prioritize -- it&apos;s all here.
                            </p>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                This page is a living document. It tracks where we&apos;ve been, where we
                                are now, and where we&apos;re headed. We update it with every major release.
                                If you&apos;re evaluating the platform, considering joining as a recruiter,
                                or just curious about how we operate -- this is the place.
                            </p>

                            <p className="text-lg leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                We believe transparency isn&apos;t just a value. It&apos;s a competitive
                                advantage. When users know exactly what they&apos;re getting and what&apos;s
                                coming, trust grows. And trust is everything in recruiting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 1
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#4ECDC4" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#4ECDC4" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#FFFFFF" }}>
                            If you want people to trust your platform with their
                            livelihood, show them exactly how the sausage gets made.
                            Transparency isn&apos;t a feature. It&apos;s the foundation.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #4ECDC4" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#4ECDC4" }}>
                                -- Splits Network Founding Principle
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10"
                            style={{ backgroundColor: "#4ECDC4" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TIMELINE - Recent Updates
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-timeline py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="timeline-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                Timeline
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#FFFFFF" }}>
                                The Journey{" "}
                                <span style={{ color: "#FFE66D" }}>So Far</span>
                            </h2>
                        </div>

                        <div className="timeline-items space-y-0">
                            {timelineEvents.map((event, index) => (
                                <div key={index}
                                    className="timeline-item flex gap-6 md:gap-8 opacity-0"
                                    style={{ paddingBottom: index < timelineEvents.length - 1 ? "0" : undefined }}>
                                    {/* Year column */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-20 md:w-24 py-2 text-center font-black text-sm md:text-base"
                                            style={{ backgroundColor: event.color, color: event.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF" }}>
                                            {event.year}
                                        </div>
                                        {index < timelineEvents.length - 1 && (
                                            <div className="w-1 flex-grow" style={{ backgroundColor: event.color, opacity: 0.3, minHeight: "40px" }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8 md:pb-10">
                                        <h3 className="font-black text-lg md:text-xl uppercase tracking-wide mb-2"
                                            style={{ color: event.color }}>
                                            {event.title}
                                        </h3>
                                        <p className="text-sm md:text-base leading-relaxed"
                                            style={{ color: "rgba(255,255,255,0.65)" }}>
                                            {event.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden" style={{ minHeight: "400px" }}>
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80"
                    alt="Team building and collaborating"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: "400px" }}
                />
                {/* Retro color overlay */}
                <div className="absolute inset-0" style={{ backgroundColor: "#1A1A2E", opacity: 0.75 }} />
                {/* Memphis border frame */}
                <div className="absolute inset-4 md:inset-8 border-4 pointer-events-none"
                    style={{ borderColor: "#FFE66D" }} />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight"
                            style={{ color: "#FFFFFF" }}>
                            Every great platform is{" "}
                            <span style={{ color: "#FFE66D" }}>built one feature</span>{" "}
                            at a time.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                WHAT'S COMING NEXT - Phase 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="roadmap-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Q1 2026
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                Phase 2:{" "}
                                <span style={{ color: "#FF6B6B" }}>Enhanced Functionality</span>
                            </h2>
                        </div>

                        <div className="roadmap-grid-1 grid md:grid-cols-2 gap-6">
                            {phase2Features.map((feature, index) => (
                                <div key={index}
                                    className="roadmap-card relative p-6 md:p-8 border-4 opacity-0"
                                    style={{ borderColor: feature.color, backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: feature.color }} />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                        style={{ borderColor: feature.color }}>
                                        <i className={`${feature.icon} text-2xl`} style={{ color: feature.color }}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3"
                                        style={{ color: "#1A1A2E" }}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.75 }}>
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                WHAT'S COMING NEXT - Phase 3
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="roadmap-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                                Q2-Q3 2026
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                Phase 3:{" "}
                                <span style={{ color: "#A78BFA" }}>Scale &amp; Automation</span>
                            </h2>
                        </div>

                        <div className="roadmap-grid-2 grid md:grid-cols-2 gap-6">
                            {phase3Features.map((feature, index) => (
                                <div key={index}
                                    className="roadmap-card-2 relative p-6 md:p-8 border-4 opacity-0"
                                    style={{ borderColor: feature.color, backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: feature.color }} />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                        style={{ borderColor: feature.color }}>
                                        <i className={`${feature.icon} text-2xl`} style={{ color: feature.color }}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3"
                                        style={{ color: "#1A1A2E" }}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.75 }}>
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#FF6B6B" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#FF6B6B" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#1A1A2E" }}>
                            We&apos;re not just building a platform.
                            We&apos;re building the infrastructure that makes
                            collaborative recruiting the default, not the exception.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FF6B6B" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FF6B6B" }}>
                                -- Splits Network Vision
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10"
                            style={{ backgroundColor: "#FF6B6B" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FUTURE VISION - 2027+
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-vision py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="vision-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                2027 &amp; Beyond
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#FFFFFF" }}>
                                The{" "}
                                <span style={{ color: "#FFE66D" }}>Long Game</span>
                            </h2>
                        </div>

                        <div className="vision-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {futureVision.map((item, index) => (
                                <div key={index}
                                    className="vision-card p-6 border-4 text-center opacity-0"
                                    style={{ borderColor: item.color, backgroundColor: "rgba(255,255,255,0.03)" }}>
                                    <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                        style={{ backgroundColor: item.color }}>
                                        <i className={`${item.icon} text-xl`}
                                            style={{ color: item.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF" }}></i>
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-wide leading-relaxed"
                                        style={{ color: "rgba(255,255,255,0.8)" }}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FINAL QUOTE
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#FFE66D" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#FFE66D" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#1A1A2E" }}>
                            The best platforms aren&apos;t built by companies alone.
                            They&apos;re shaped by the communities that use them.
                            This roadmap is yours as much as it is ours.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FFE66D" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#C4A83D" }}>
                                -- Splits Network, 2026
                            </span>
                        </div>
                        <div className="absolute top-0 left-0 w-10 h-10"
                            style={{ backgroundColor: "#FFE66D" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-cta relative py-24 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full"
                        style={{ backgroundColor: "#FFE66D" }} />
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6"
                            style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                            Get Involved
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1]"
                            style={{ color: "#FFFFFF" }}>
                            Help Shape{" "}
                            <span style={{ color: "#FF6B6B" }}>Our Roadmap</span>
                        </h2>
                        <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Your feedback drives our development priorities.
                            Tell us what features matter most, report issues, or just say hello.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Submit Feedback */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FF6B6B", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FF6B6B" }}>
                                <i className="fa-duotone fa-regular fa-comment text-xl" style={{ color: "#FFFFFF" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Submit Feedback
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Share what&apos;s working and what isn&apos;t
                            </p>
                            <a href="mailto:feedback@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Send Feedback
                            </a>
                        </div>

                        {/* Request Feature */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FFE66D", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-lightbulb text-xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Request a Feature
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Tell us what you need built next
                            </p>
                            <a href="mailto:help@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FFE66D", borderColor: "#FFE66D", color: "#1A1A2E" }}>
                                Request Feature
                            </a>
                        </div>

                        {/* System Status */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#4ECDC4", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#4ECDC4" }}>
                                <i className="fa-duotone fa-regular fa-heartbeat text-xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                System Status
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Check platform health and uptime
                            </p>
                            <a href="/public/status"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#1A1A2E" }}>
                                View Status
                            </a>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="cta-newsletter max-w-xl mx-auto text-center opacity-0">
                        <div className="p-8 border-4" style={{ borderColor: "#A78BFA" }}>
                            <div className="absolute top-0 right-0 w-8 h-8" style={{ backgroundColor: "#A78BFA" }} />
                            <h3 className="font-black text-xl uppercase tracking-wide mb-3" style={{ color: "#FFFFFF" }}>
                                Stay In The Loop
                            </h3>
                            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Get notified when we ship new features and updates.
                                Monthly updates. No spam. Unsubscribe anytime.
                            </p>
                            <div className="flex gap-0">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="flex-grow px-4 py-3 text-sm font-bold border-4 outline-none"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                        borderColor: "#A78BFA",
                                        color: "#FFFFFF",
                                        borderRight: "none",
                                    }}
                                />
                                <button
                                    className="px-6 py-3 font-bold uppercase tracking-wider text-sm border-4 transition-transform hover:-translate-y-0.5"
                                    style={{ backgroundColor: "#A78BFA", borderColor: "#A78BFA", color: "#FFFFFF" }}>
                                    Subscribe
                                </button>
                            </div>
                        </div>
                        <div className="mt-8">
                            <a href="mailto:hello@splits.network"
                                className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm"
                                style={{ color: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                hello@splits.network
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </UpdatesAnimator>
    );
}
