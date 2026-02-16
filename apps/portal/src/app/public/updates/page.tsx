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
    { value: "Phase 1", label: "Live & Running", bg: "bg-coral", fg: "text-white" },
    { value: "3 Apps", label: "Portal, Candidate, Corporate", bg: "bg-teal", fg: "text-white" },
    { value: "50+", label: "Features Shipped", bg: "bg-yellow", fg: "text-dark" },
    { value: "Open", label: "Public Roadmap", bg: "bg-purple", fg: "text-white" },
];

const timelineEvents = [
    {
        year: "OCT 2025",
        title: "Alpha Development",
        text: "Core architecture built and internal testing completed. Twelve microservices deployed, Clerk authentication configured, and foundational features validated across all three applications.",
        bg: "bg-yellow", fg: "text-dark", titleColor: "text-yellow", barBg: "bg-yellow/30",
    },
    {
        year: "NOV 2025",
        title: "Beta Testing Phase",
        text: "Selected recruiters and companies put the platform through its paces. Ten beta recruiters submitted over fifty candidates. Five companies posted real roles. Every piece of feedback was incorporated into UX improvements.",
        bg: "bg-teal", fg: "text-white", titleColor: "text-teal", barBg: "bg-teal/30",
    },
    {
        year: "DEC 2025",
        title: "Platform Launch",
        text: "Splits Network Phase 1 goes live. Full ATS with roles, candidates, and pipeline stages. Split placement tracking. Recruiter network management. Three-tier subscription model. Email notifications. Admin console. The foundation is set.",
        bg: "bg-coral", fg: "text-white", titleColor: "text-coral", barBg: "bg-coral/30",
    },
];

const phase2Features = [
    {
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        title: "Payment Processing",
        text: "Integrated payment flows with Stripe Connect. Companies pay the platform, and automatic splits are distributed to recruiters based on verified milestones.",
        border: "border-coral", bg: "bg-coral", iconColor: "text-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-plug",
        title: "Integrations Marketplace",
        text: "Connect with Gmail, Outlook, Calendly, LinkedIn, and other essential tools. Zapier integration for custom workflows.",
        border: "border-teal", bg: "bg-teal", iconColor: "text-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Advanced Analytics",
        text: "Detailed performance metrics, ROI tracking, conversion rates, and custom reporting dashboards for both recruiters and companies.",
        border: "border-yellow", bg: "bg-yellow", iconColor: "text-yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-mobile-screen",
        title: "Mobile Apps",
        text: "Native iOS and Android apps for recruiters to manage candidates and track placements on the go.",
        border: "border-purple", bg: "bg-purple", iconColor: "text-purple",
    },
];

const phase3Features = [
    {
        icon: "fa-duotone fa-regular fa-brain",
        title: "AI-Powered Matching",
        text: "Smart candidate-to-role matching using machine learning. Automatic recruiter recommendations based on specialties and track record.",
        border: "border-teal", bg: "bg-teal", iconColor: "text-teal",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Multi-Recruiter Splits",
        text: "Support for multiple recruiters collaborating on a single placement with configurable split percentages and role-based contributions.",
        border: "border-coral", bg: "bg-coral", iconColor: "text-coral",
    },
    {
        icon: "fa-duotone fa-regular fa-code",
        title: "Public API",
        text: "Full REST API with webhooks, OAuth 2.0, and comprehensive documentation for custom integrations and third-party tools.",
        border: "border-yellow", bg: "bg-yellow", iconColor: "text-yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "White-Label Options",
        text: "Recruiting firms can customize branding, domain, and certain features for their own recruiter networks.",
        border: "border-purple", bg: "bg-purple", iconColor: "text-purple",
    },
];

const futureVision = [
    { icon: "fa-duotone fa-regular fa-globe", text: "International expansion with multi-currency support", border: "border-coral", bg: "bg-coral", iconFg: "text-white" },
    { icon: "fa-duotone fa-regular fa-building-columns", text: "Enterprise features for large recruiting firms", border: "border-teal", bg: "bg-teal", iconFg: "text-dark" },
    { icon: "fa-duotone fa-regular fa-graduation-cap", text: "Training and certification programs", border: "border-yellow", bg: "bg-yellow", iconFg: "text-dark" },
    { icon: "fa-duotone fa-regular fa-trophy", text: "Gamification and leaderboards", border: "border-purple", bg: "bg-purple", iconFg: "text-white" },
    { icon: "fa-duotone fa-regular fa-handshake", text: "Specialized recruiting services marketplace", border: "border-coral", bg: "bg-coral", iconFg: "text-white" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UpdatesPage() {
    return (
        <UpdatesAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO HEADER
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-hero relative min-h-[70vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle -- keep inline for CSS triangle hack */}
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
                                <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag -- SVG attrs stay inline */}
                    <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign -- SVG attrs stay inline */}
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Category + badge */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark">
                                <i className="fa-duotone fa-regular fa-signal-stream"></i>
                                Building In Public
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-yellow">
                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                Updated February 2026
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            Platform Updates{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">&amp; Roadmap</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            We build in the open. Every feature shipped, every milestone hit,
                            every ambitious plan for what&apos;s next -- laid out for the community
                            that&apos;s building this platform with us.
                        </p>

                        {/* Byline */}
                        <div className="hero-byline flex items-center gap-4 opacity-0">
                            <div className="w-14 h-14 flex items-center justify-center font-black text-lg bg-coral text-white">
                                SN
                            </div>
                            <div>
                                <div className="font-bold uppercase tracking-wide text-sm text-white">
                                    Splits Network Team
                                </div>
                                <div className="text-xs uppercase tracking-wider text-cream/50">
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
                            className={`stat-block p-6 md:p-8 text-center opacity-0 ${stat.bg} ${stat.fg}`}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INTRODUCTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-intro py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="intro-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                Why We Build{" "}
                                <span className="text-teal">In Public</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                Splits Network started with a simple observation: the recruiting industry
                                runs on trust, but the tools recruiters use are built behind closed doors.
                                We decided to do things differently. Every feature we ship, every decision
                                we make, every roadmap item we prioritize -- it&apos;s all here.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                This page is a living document. It tracks where we&apos;ve been, where we
                                are now, and where we&apos;re headed. We update it with every major release.
                                If you&apos;re evaluating the platform, considering joining as a recruiter,
                                or just curious about how we operate -- this is the place.
                            </p>

                            <p className="text-lg leading-relaxed text-dark/80">
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
            <section className="py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-teal opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-teal">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
                            If you want people to trust your platform with their
                            livelihood, show them exactly how the sausage gets made.
                            Transparency isn&apos;t a feature. It&apos;s the foundation.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Splits Network Founding Principle
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TIMELINE - Recent Updates
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-timeline py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="timeline-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Timeline
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                The Journey{" "}
                                <span className="text-yellow">So Far</span>
                            </h2>
                        </div>

                        <div className="timeline-items space-y-0">
                            {timelineEvents.map((event, index) => (
                                <div key={index}
                                    className={`timeline-item flex gap-6 md:gap-8 opacity-0 ${index < timelineEvents.length - 1 ? "pb-0" : ""}`}>
                                    {/* Year column */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-20 md:w-24 py-2 text-center font-black text-sm md:text-base ${event.bg} ${event.fg}`}>
                                            {event.year}
                                        </div>
                                        {index < timelineEvents.length - 1 && (
                                            <div className={`w-1 flex-grow ${event.barBg}`} style={{ minHeight: "40px" }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8 md:pb-10">
                                        <h3 className={`font-black text-lg md:text-xl uppercase tracking-wide mb-2 ${event.titleColor}`}>
                                            {event.title}
                                        </h3>
                                        <p className="text-sm md:text-base leading-relaxed text-cream/65">
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
            <section className="relative overflow-hidden min-h-[400px]">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80"
                    alt="Team building and collaborating"
                    className="w-full h-full object-cover absolute inset-0 min-h-[400px]"
                />
                {/* Retro color overlay */}
                <div className="absolute inset-0 bg-dark/75" />
                {/* Memphis border frame */}
                <div className="absolute inset-4 md:inset-8 border-4 border-yellow pointer-events-none" />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-white">
                            Every great platform is{" "}
                            <span className="text-yellow">built one feature</span>{" "}
                            at a time.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                WHAT'S COMING NEXT - Phase 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="roadmap-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-white">
                                Q1 2026
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Phase 2:{" "}
                                <span className="text-coral">Enhanced Functionality</span>
                            </h2>
                        </div>

                        <div className="roadmap-grid-1 grid md:grid-cols-2 gap-6">
                            {phase2Features.map((feature, index) => (
                                <div key={index}
                                    className={`roadmap-card relative p-6 md:p-8 border-4 bg-white opacity-0 ${feature.border}`}>
                                    <div className={`absolute top-0 right-0 w-10 h-10 ${feature.bg}`} />
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${feature.border}`}>
                                        <i className={`${feature.icon} text-2xl ${feature.iconColor}`}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
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
            <section className="py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="roadmap-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Q2-Q3 2026
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Phase 3:{" "}
                                <span className="text-purple">Scale &amp; Automation</span>
                            </h2>
                        </div>

                        <div className="roadmap-grid-2 grid md:grid-cols-2 gap-6">
                            {phase3Features.map((feature, index) => (
                                <div key={index}
                                    className={`roadmap-card-2 relative p-6 md:p-8 border-4 bg-white opacity-0 ${feature.border}`}>
                                    <div className={`absolute top-0 right-0 w-10 h-10 ${feature.bg}`} />
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${feature.border}`}>
                                        <i className={`${feature.icon} text-2xl ${feature.iconColor}`}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-dark/75">
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
            <section className="py-16 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-coral opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-coral">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                            We&apos;re not just building a platform.
                            We&apos;re building the infrastructure that makes
                            collaborative recruiting the default, not the exception.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-coral">
                            <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                -- Splits Network Vision
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FUTURE VISION - 2027+
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-vision py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="vision-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                2027 &amp; Beyond
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                The{" "}
                                <span className="text-yellow">Long Game</span>
                            </h2>
                        </div>

                        <div className="vision-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {futureVision.map((item, index) => (
                                <div key={index}
                                    className={`vision-card p-6 border-4 text-center bg-white/[0.03] opacity-0 ${item.border}`}>
                                    <div className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center ${item.bg}`}>
                                        <i className={`${item.icon} text-xl ${item.iconFg}`}></i>
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-wide leading-relaxed text-cream/80">
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
            <section className="py-16 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-yellow opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-yellow">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                            The best platforms aren&apos;t built by companies alone.
                            They&apos;re shaped by the communities that use them.
                            This roadmap is yours as much as it is ours.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-yellow">
                            <span className="text-sm font-bold uppercase tracking-wider text-[#C4A83D]">
                                -- Splits Network, 2026
                            </span>
                        </div>
                        <div className="absolute top-0 left-0 w-10 h-10 bg-yellow" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="updates-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                    {/* SVG attrs stay inline */}
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                            Get Involved
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            Help Shape{" "}
                            <span className="text-coral">Our Roadmap</span>
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            Your feedback drives our development priorities.
                            Tell us what features matter most, report issues, or just say hello.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Submit Feedback */}
                        <div className="cta-card p-6 border-4 border-coral bg-white/[0.03] text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-coral">
                                <i className="fa-duotone fa-regular fa-comment text-xl text-white"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Submit Feedback
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Share what&apos;s working and what isn&apos;t
                            </p>
                            <a href="mailto:feedback@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-white text-center text-sm transition-transform hover:-translate-y-1">
                                Send Feedback
                            </a>
                        </div>

                        {/* Request Feature */}
                        <div className="cta-card p-6 border-4 border-yellow bg-white/[0.03] text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-yellow">
                                <i className="fa-duotone fa-regular fa-lightbulb text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Request a Feature
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Tell us what you need built next
                            </p>
                            <a href="mailto:help@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-yellow bg-yellow text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                Request Feature
                            </a>
                        </div>

                        {/* System Status */}
                        <div className="cta-card p-6 border-4 border-teal bg-white/[0.03] text-center opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-teal">
                                <i className="fa-duotone fa-regular fa-heartbeat text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                System Status
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Check platform health and uptime
                            </p>
                            <a href="/public/status"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-teal bg-teal text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                View Status
                            </a>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="cta-newsletter max-w-xl mx-auto text-center opacity-0">
                        <div className="p-8 border-4 border-purple">
                            <div className="absolute top-0 right-0 w-8 h-8 bg-purple" />
                            <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-white">
                                Stay In The Loop
                            </h3>
                            <p className="text-sm mb-6 text-cream/60">
                                Get notified when we ship new features and updates.
                                Monthly updates. No spam. Unsubscribe anytime.
                            </p>
                            <div className="flex gap-0">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="flex-grow px-4 py-3 text-sm font-bold border-4 border-purple bg-white/5 text-white outline-none"
                                    style={{ borderRight: "none" }}
                                />
                                <button
                                    className="px-6 py-3 font-bold uppercase tracking-wider text-sm border-4 border-purple bg-purple text-white transition-transform hover:-translate-y-0.5">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                        <div className="mt-8">
                            <a href="mailto:hello@splits.network"
                                className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
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
