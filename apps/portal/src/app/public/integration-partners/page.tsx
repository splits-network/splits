import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { IntegrationsAnimator } from "./integrations-animator";

export const metadata: Metadata = {
    title: "Integration Partners | Splits Network",
    description:
        "Discover the connected ecosystem powering Splits Network. From email and calendar to automation and API access, integrate with the tools your team already uses.",
    openGraph: {
        title: "Integration Partners | Splits Network",
        description:
            "Discover the connected ecosystem powering Splits Network. From email and calendar to automation and API access, integrate with the tools your team already uses.",
        url: "https://splits.network/public/integration-partners",
    },
    ...buildCanonical("/public/integration-partners"),
};

// ─── Integration data ────────────────────────────────────────────────────────

const keyStats = [
    { value: "10+", label: "Integrations Available", bgClass: "bg-coral", textClass: "text-cream" },
    { value: "Real-Time", label: "Sync & Webhooks", bgClass: "bg-teal", textClass: "text-cream" },
    { value: "1-Click", label: "Connect Setup", bgClass: "bg-yellow", textClass: "text-dark" },
    { value: "Full API", label: "Developer Access", bgClass: "bg-purple", textClass: "text-cream" },
];

const integrationCategories = [
    {
        category: "Communication",
        icon: "fa-duotone fa-regular fa-envelope",
        colorClass: "coral",
        badgeText: "text-cream",
        description: "Stay connected with candidates and teams through the channels they prefer.",
        integrations: [
            { name: "Gmail", icon: "fa-brands fa-google", status: "available" },
            { name: "Outlook", icon: "fa-brands fa-microsoft", status: "available" },
            { name: "Slack", icon: "fa-brands fa-slack", status: "available" },
        ],
    },
    {
        category: "Calendar",
        icon: "fa-duotone fa-regular fa-calendar",
        colorClass: "teal",
        badgeText: "text-cream",
        description: "Automate interview scheduling and sync availability across platforms.",
        integrations: [
            { name: "Calendly", icon: "fa-duotone fa-regular fa-calendar-check", status: "available" },
            { name: "Google Calendar", icon: "fa-brands fa-google", status: "available" },
        ],
    },
    {
        category: "Professional",
        icon: "fa-duotone fa-regular fa-briefcase",
        colorClass: "yellow",
        badgeText: "text-dark",
        description: "Source talent and enrich candidate profiles from professional networks.",
        integrations: [
            { name: "LinkedIn", icon: "fa-brands fa-linkedin", status: "available" },
        ],
    },
    {
        category: "Automation",
        icon: "fa-duotone fa-regular fa-bolt",
        colorClass: "purple",
        badgeText: "text-cream",
        description: "Connect to thousands of apps with no-code workflow automation.",
        integrations: [
            { name: "Zapier", icon: "fa-duotone fa-regular fa-bolt", status: "available" },
        ],
    },
    {
        category: "Development",
        icon: "fa-duotone fa-regular fa-code",
        colorClass: "coral",
        badgeText: "text-cream",
        description: "Build custom integrations with our comprehensive REST API and real-time webhooks.",
        integrations: [
            { name: "REST API", icon: "fa-duotone fa-regular fa-code", status: "available" },
            { name: "Webhooks", icon: "fa-duotone fa-regular fa-webhook", status: "available" },
        ],
    },
];

const connectSteps = [
    {
        step: "01",
        title: "Choose Your Tools",
        text: "Browse available integrations and select the tools your team already uses. From email to calendars to automation platforms.",
        bgClass: "bg-coral",
        textClass: "text-cream",
        titleClass: "text-coral",
    },
    {
        step: "02",
        title: "Authorize & Connect",
        text: "One-click OAuth authentication. No API keys to manage, no complex configuration. Your credentials stay secure.",
        bgClass: "bg-teal",
        textClass: "text-cream",
        titleClass: "text-teal",
    },
    {
        step: "03",
        title: "Configure Workflows",
        text: "Set up triggers and actions. When a candidate is submitted, send a Slack notification. When an interview is booked, sync to Google Calendar.",
        bgClass: "bg-yellow",
        textClass: "text-dark",
        titleClass: "text-yellow",
    },
    {
        step: "04",
        title: "Work Seamlessly",
        text: "Data flows automatically between platforms. No manual exports, no copy-paste, no context switching. Your tools work as one.",
        bgClass: "bg-purple",
        textClass: "text-cream",
        titleClass: "text-purple",
    },
];

const comingSoonIntegrations = [
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "External ATS",
        items: ["Greenhouse", "Lever", "Workday", "iCIMS"],
        colorClass: "teal",
        badgeText: "text-cream",
        timeline: "Q2 2026",
    },
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Payment Processing",
        items: ["PayPal", "Wire Transfer", "ACH Direct"],
        colorClass: "coral",
        badgeText: "text-cream",
        timeline: "Q3 2026",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Background Checks",
        items: ["Checkr", "Sterling", "HireRight", "GoodHire"],
        colorClass: "yellow",
        badgeText: "text-dark",
        timeline: "Q3 2026",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Analytics & BI",
        items: ["Tableau", "Power BI", "Looker"],
        colorClass: "purple",
        badgeText: "text-cream",
        timeline: "Q4 2026",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
    return (
        <IntegrationsAnimator>
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
                                <div key={i} className="w-2 h-2 rounded-full bg-teal" />
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
                    {/* Connection nodes */}
                    <svg className="memphis-shape absolute top-[35%] right-[5%] opacity-0" width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="15" cy="15" r="6" fill="#FF6B6B" />
                        <circle cx="65" cy="15" r="6" fill="#4ECDC4" />
                        <circle cx="40" cy="65" r="6" fill="#FFE66D" />
                        <line x1="15" y1="15" x2="65" y2="15" stroke="#FF6B6B" strokeWidth="2" opacity="0.5" />
                        <line x1="65" y1="15" x2="40" y2="65" stroke="#4ECDC4" strokeWidth="2" opacity="0.5" />
                        <line x1="40" y1="65" x2="15" y2="15" stroke="#FFE66D" strokeWidth="2" opacity="0.5" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Category + read time */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark">
                                <i className="fa-duotone fa-regular fa-plug-circle-bolt"></i>
                                Integrations
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-yellow">
                                <i className="fa-duotone fa-regular fa-network-wired mr-1"></i>
                                Connected Ecosystem
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                            Integrations{" "}
                            <span className="relative inline-block">
                                <span className="text-teal">That Work</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-cream/70 opacity-0">
                            Your recruiting workflow touches a dozen tools every day.
                            Splits Network connects them all -- so data flows,
                            schedules sync, and nothing falls through the cracks.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div key={index}
                            className={`stat-block p-6 md:p-8 text-center opacity-0 ${stat.bgClass} ${stat.textClass}`}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ARTICLE BODY - Introduction
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-intro py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="article-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark">
                                Why Integrations{" "}
                                <span className="text-coral">Matter</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                Recruiting doesn&apos;t happen in one tool. You source on LinkedIn, schedule
                                through Calendly, communicate over Slack, and track everything in your ATS.
                                The average recruiter switches between 8 different applications every single day.
                            </p>

                            <p className="text-lg leading-relaxed mb-6 text-dark/80">
                                Every time you copy data from one system to another, you lose time and risk errors.
                                A candidate&apos;s email gets mistyped. An interview doesn&apos;t make it to the calendar.
                                A status update gets lost between tabs. These aren&apos;t minor annoyances --
                                they&apos;re the friction that slows down placements.
                            </p>

                            <p className="text-lg leading-relaxed text-dark/80">
                                Splits Network&apos;s integration ecosystem eliminates that friction. Connect the
                                tools you already use, and let data flow automatically between them. One source
                                of truth. Zero manual syncing.
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
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-cream">
                            The best recruiting workflows don&apos;t require you to
                            think about tools. They just work -- connected,
                            automatic, invisible.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Connected Workflows
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INTEGRATION CATEGORIES
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-categories py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="categories-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                Ecosystem
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Your Tools,{" "}
                                <span className="text-purple">Connected</span>
                            </h2>
                        </div>

                        <div className="categories-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {integrationCategories.map((cat, index) => (
                                <div key={index}
                                    className={`integration-card relative p-6 md:p-8 border-4 border-${cat.colorClass} bg-white opacity-0`}>
                                    {/* Corner accent */}
                                    <div className={`absolute top-0 right-0 w-10 h-10 bg-${cat.colorClass}`} />

                                    {/* Category badge */}
                                    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-5 bg-${cat.colorClass} ${cat.badgeText}`}>
                                        {cat.category}
                                    </span>

                                    {/* Icon */}
                                    <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 border-${cat.colorClass}`}>
                                        <i className={`${cat.icon} text-2xl text-${cat.colorClass}`}></i>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm leading-relaxed mb-6 text-dark/75">
                                        {cat.description}
                                    </p>

                                    {/* Integration items */}
                                    <div className="space-y-2">
                                        {cat.integrations.map((integration, i) => (
                                            <div key={i}
                                                className={`flex items-center justify-between py-2 px-3 border-2 border-${cat.colorClass}/20`}>
                                                <div className="flex items-center gap-2">
                                                    <i className={`${integration.icon} text-sm text-${cat.colorClass}`}></i>
                                                    <span className="text-xs font-bold uppercase tracking-wide text-dark">
                                                        {integration.name}
                                                    </span>
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-${cat.colorClass} ${cat.badgeText}`}>
                                                    {integration.status}
                                                </span>
                                            </div>
                                        ))}
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
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80"
                    alt="Network of connected technology nodes"
                    className="w-full h-full object-cover absolute inset-0 min-h-[400px]"
                />
                {/* Retro color overlay */}
                <div className="absolute inset-0 bg-dark opacity-75" />
                {/* Memphis border frame */}
                <div className="absolute inset-4 md:inset-8 border-4 border-yellow pointer-events-none" />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-cream">
                            Connected tools mean{" "}
                            <span className="text-yellow">faster placements</span>
                            {" "}-- every single time.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS - Timeline / Steps
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-how-it-works py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="how-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                How It Works
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                Connect In{" "}
                                <span className="text-yellow">4 Steps</span>
                            </h2>
                        </div>

                        <div className="steps-list space-y-0">
                            {connectSteps.map((step, index) => (
                                <div key={index}
                                    className="step-item flex gap-6 md:gap-8 opacity-0">
                                    {/* Step number column */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-16 md:w-20 py-2 text-center font-black text-lg md:text-xl ${step.bgClass} ${step.textClass}`}>
                                            {step.step}
                                        </div>
                                        {index < connectSteps.length - 1 && (
                                            <div className={`w-1 flex-grow min-h-[40px] ${step.bgClass} opacity-30`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8 md:pb-10">
                                        <h3 className={`font-black text-lg md:text-xl uppercase tracking-wide mb-2 ${step.titleClass}`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm md:text-base leading-relaxed text-cream/65">
                                            {step.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-coral opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-coral">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-dark">
                            When your ATS, calendar, and communication tools
                            share the same data, you stop managing tools
                            and start managing talent.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-coral">
                            <span className="text-sm font-bold uppercase tracking-wider text-coral">
                                -- Seamless Workflows
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-coral" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                COMING SOON - Roadmap
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-coming-soon py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="roadmap-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Roadmap
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Coming{" "}
                                <span className="text-teal">Soon</span>
                            </h2>
                        </div>

                        <div className="coming-section opacity-0">
                            <p className="text-lg leading-relaxed mb-10 max-w-3xl mx-auto text-center text-dark/80">
                                We&apos;re building fast. These integrations are actively in development and
                                will be rolling out throughout 2026. Request early access to get notified
                                when your favorite tools go live.
                            </p>
                        </div>

                        <div className="roadmap-grid grid md:grid-cols-2 gap-6">
                            {comingSoonIntegrations.map((item, index) => (
                                <div key={index}
                                    className={`roadmap-card relative p-6 md:p-8 border-4 border-${item.colorClass} bg-white opacity-0`}>
                                    {/* Corner accent */}
                                    <div className={`absolute top-0 right-0 w-10 h-10 bg-${item.colorClass}`} />

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 flex items-center justify-center border-4 border-${item.colorClass}`}>
                                            <i className={`${item.icon} text-xl text-${item.colorClass}`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg uppercase tracking-wide text-dark">
                                                {item.title}
                                            </h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-${item.colorClass} ${item.badgeText}`}>
                                                {item.timeline}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {item.items.map((name, i) => (
                                            <span key={i}
                                                className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 border-${item.colorClass}/25 text-dark`}>
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FINAL QUOTE
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-yellow opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-yellow">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-cream">
                            The future of recruiting isn&apos;t about having
                            more tools. It&apos;s about having tools that
                            talk to each other.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-yellow">
                            <span className="text-sm font-bold uppercase tracking-wider text-yellow">
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
            <section className="integrations-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-cream">
                            Get Connected
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-cream">
                            Ready To{" "}
                            <span className="text-coral">Connect</span>{" "}
                            Your Workflow?
                        </h2>
                        <p className="text-lg mb-10 text-cream/70">
                            Splits Network integrates with the tools you already use.
                            Pick your path and start building seamless workflows today.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 border-coral text-center bg-cream/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-coral">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-cream"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-cream">
                                Recruiters
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Connect your tools to the marketplace
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream text-center text-sm transition-transform hover:-translate-y-1">
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 border-yellow text-center bg-cream/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-yellow">
                                <i className="fa-duotone fa-regular fa-building text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-cream">
                                Companies
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Integrate with your existing ATS
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-yellow bg-yellow text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                Post a Role
                            </a>
                        </div>

                        {/* Developers */}
                        <div className="cta-card p-6 border-4 border-teal text-center bg-cream/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-teal">
                                <i className="fa-duotone fa-regular fa-code text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-cream">
                                Developers
                            </h3>
                            <p className="text-xs mb-5 text-cream/60">
                                Build with our REST API &amp; webhooks
                            </p>
                            <a href="mailto:integrations@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-teal bg-teal text-dark text-center text-sm transition-transform hover:-translate-y-1">
                                API Access
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3 text-cream/50">
                            Don&apos;t see the integration you need? Let us know.
                        </p>
                        <a href="mailto:integrations@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            integrations@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </IntegrationsAnimator>
    );
}
