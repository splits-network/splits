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
    { value: "10+", label: "Integrations Available", color: "#FF6B6B" },
    { value: "Real-Time", label: "Sync & Webhooks", color: "#4ECDC4" },
    { value: "1-Click", label: "Connect Setup", color: "#FFE66D" },
    { value: "Full API", label: "Developer Access", color: "#A78BFA" },
];

const integrationCategories = [
    {
        category: "Communication",
        icon: "fa-duotone fa-regular fa-envelope",
        color: "#FF6B6B",
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
        color: "#4ECDC4",
        description: "Automate interview scheduling and sync availability across platforms.",
        integrations: [
            { name: "Calendly", icon: "fa-duotone fa-regular fa-calendar-check", status: "available" },
            { name: "Google Calendar", icon: "fa-brands fa-google", status: "available" },
        ],
    },
    {
        category: "Professional",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "#FFE66D",
        description: "Source talent and enrich candidate profiles from professional networks.",
        integrations: [
            { name: "LinkedIn", icon: "fa-brands fa-linkedin", status: "available" },
        ],
    },
    {
        category: "Automation",
        icon: "fa-duotone fa-regular fa-bolt",
        color: "#A78BFA",
        description: "Connect to thousands of apps with no-code workflow automation.",
        integrations: [
            { name: "Zapier", icon: "fa-duotone fa-regular fa-bolt", status: "available" },
        ],
    },
    {
        category: "Development",
        icon: "fa-duotone fa-regular fa-code",
        color: "#FF6B6B",
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
        color: "#FF6B6B",
    },
    {
        step: "02",
        title: "Authorize & Connect",
        text: "One-click OAuth authentication. No API keys to manage, no complex configuration. Your credentials stay secure.",
        color: "#4ECDC4",
    },
    {
        step: "03",
        title: "Configure Workflows",
        text: "Set up triggers and actions. When a candidate is submitted, send a Slack notification. When an interview is booked, sync to Google Calendar.",
        color: "#FFE66D",
    },
    {
        step: "04",
        title: "Work Seamlessly",
        text: "Data flows automatically between platforms. No manual exports, no copy-paste, no context switching. Your tools work as one.",
        color: "#A78BFA",
    },
];

const comingSoonIntegrations = [
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "External ATS",
        items: ["Greenhouse", "Lever", "Workday", "iCIMS"],
        color: "#4ECDC4",
        timeline: "Q2 2026",
    },
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Payment Processing",
        items: ["PayPal", "Wire Transfer", "ACH Direct"],
        color: "#FF6B6B",
        timeline: "Q3 2026",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Background Checks",
        items: ["Checkr", "Sterling", "HireRight", "GoodHire"],
        color: "#FFE66D",
        timeline: "Q3 2026",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Analytics & BI",
        items: ["Tableau", "Power BI", "Looker"],
        color: "#A78BFA",
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
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                <i className="fa-duotone fa-regular fa-plug-circle-bolt"></i>
                                Integrations
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em]"
                                style={{ color: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-network-wired mr-1"></i>
                                Connected Ecosystem
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 opacity-0"
                            style={{ color: "#FFFFFF" }}>
                            Integrations{" "}
                            <span className="relative inline-block">
                                <span style={{ color: "#4ECDC4" }}>That Work</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#4ECDC4" }} />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 opacity-0"
                            style={{ color: "rgba(255,255,255,0.7)" }}>
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
                ARTICLE BODY - Introduction
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-intro py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="article-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
                                style={{ color: "#1A1A2E" }}>
                                Why Integrations{" "}
                                <span style={{ color: "#FF6B6B" }}>Matter</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                Recruiting doesn&apos;t happen in one tool. You source on LinkedIn, schedule
                                through Calendly, communicate over Slack, and track everything in your ATS.
                                The average recruiter switches between 8 different applications every single day.
                            </p>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                Every time you copy data from one system to another, you lose time and risk errors.
                                A candidate&apos;s email gets mistyped. An interview doesn&apos;t make it to the calendar.
                                A status update gets lost between tabs. These aren&apos;t minor annoyances --
                                they&apos;re the friction that slows down placements.
                            </p>

                            <p className="text-lg leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.8 }}>
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
                            The best recruiting workflows don&apos;t require you to
                            think about tools. They just work -- connected,
                            automatic, invisible.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #4ECDC4" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#4ECDC4" }}>
                                -- Connected Workflows
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10"
                            style={{ backgroundColor: "#4ECDC4" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                INTEGRATION CATEGORIES
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-categories py-20 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="categories-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                                Ecosystem
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                Your Tools,{" "}
                                <span style={{ color: "#A78BFA" }}>Connected</span>
                            </h2>
                        </div>

                        <div className="categories-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {integrationCategories.map((cat, index) => (
                                <div key={index}
                                    className="integration-card relative p-6 md:p-8 border-4 opacity-0"
                                    style={{ borderColor: cat.color, backgroundColor: "#FFFFFF" }}>
                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: cat.color }} />

                                    {/* Category badge */}
                                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
                                        style={{
                                            backgroundColor: cat.color,
                                            color: cat.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF",
                                        }}>
                                        {cat.category}
                                    </span>

                                    {/* Icon */}
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                        style={{ borderColor: cat.color }}>
                                        <i className={`${cat.icon} text-2xl`} style={{ color: cat.color }}></i>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.75 }}>
                                        {cat.description}
                                    </p>

                                    {/* Integration items */}
                                    <div className="space-y-2">
                                        {cat.integrations.map((integration, i) => (
                                            <div key={i}
                                                className="flex items-center justify-between py-2 px-3 border-2"
                                                style={{ borderColor: `${cat.color}33` }}>
                                                <div className="flex items-center gap-2">
                                                    <i className={`${integration.icon} text-sm`}
                                                        style={{ color: cat.color }}></i>
                                                    <span className="text-xs font-bold uppercase tracking-wide"
                                                        style={{ color: "#1A1A2E" }}>
                                                        {integration.name}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                                                    style={{
                                                        backgroundColor: cat.color,
                                                        color: cat.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF",
                                                    }}>
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
            <section className="relative overflow-hidden" style={{ minHeight: "400px" }}>
                <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80"
                    alt="Network of connected technology nodes"
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
                            Connected tools mean{" "}
                            <span style={{ color: "#FFE66D" }}>faster placements</span>
                            {" "}-- every single time.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS - Timeline / Steps
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-how-it-works py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="how-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                How It Works
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#FFFFFF" }}>
                                Connect In{" "}
                                <span style={{ color: "#FFE66D" }}>4 Steps</span>
                            </h2>
                        </div>

                        <div className="steps-list space-y-0">
                            {connectSteps.map((step, index) => (
                                <div key={index}
                                    className="step-item flex gap-6 md:gap-8 opacity-0"
                                    style={{ paddingBottom: index < connectSteps.length - 1 ? "0" : undefined }}>
                                    {/* Step number column */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-16 md:w-20 py-2 text-center font-black text-lg md:text-xl"
                                            style={{
                                                backgroundColor: step.color,
                                                color: step.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF",
                                            }}>
                                            {step.step}
                                        </div>
                                        {index < connectSteps.length - 1 && (
                                            <div className="w-1 flex-grow" style={{ backgroundColor: step.color, opacity: 0.3, minHeight: "40px" }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8 md:pb-10">
                                        <h3 className="font-black text-lg md:text-xl uppercase tracking-wide mb-2"
                                            style={{ color: step.color }}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm md:text-base leading-relaxed"
                                            style={{ color: "rgba(255,255,255,0.65)" }}>
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
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#FF6B6B" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#FF6B6B" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#1A1A2E" }}>
                            When your ATS, calendar, and communication tools
                            share the same data, you stop managing tools
                            and start managing talent.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FF6B6B" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FF6B6B" }}>
                                -- Seamless Workflows
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10"
                            style={{ backgroundColor: "#FF6B6B" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                COMING SOON - Roadmap
               ══════════════════════════════════════════════════════════════ */}
            <section className="integrations-coming-soon py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="roadmap-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                Roadmap
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                Coming{" "}
                                <span style={{ color: "#4ECDC4" }}>Soon</span>
                            </h2>
                        </div>

                        <div className="coming-section opacity-0">
                            <p className="text-lg leading-relaxed mb-10 max-w-3xl mx-auto text-center" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                We&apos;re building fast. These integrations are actively in development and
                                will be rolling out throughout 2026. Request early access to get notified
                                when your favorite tools go live.
                            </p>
                        </div>

                        <div className="roadmap-grid grid md:grid-cols-2 gap-6">
                            {comingSoonIntegrations.map((item, index) => (
                                <div key={index}
                                    className="roadmap-card relative p-6 md:p-8 border-4 opacity-0"
                                    style={{ borderColor: item.color, backgroundColor: "#FFFFFF" }}>
                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: item.color }} />

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 flex items-center justify-center border-4"
                                            style={{ borderColor: item.color }}>
                                            <i className={`${item.icon} text-xl`} style={{ color: item.color }}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg uppercase tracking-wide"
                                                style={{ color: "#1A1A2E" }}>
                                                {item.title}
                                            </h3>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                                                style={{
                                                    backgroundColor: item.color,
                                                    color: item.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF",
                                                }}>
                                                {item.timeline}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {item.items.map((name, i) => (
                                            <span key={i}
                                                className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide border-2"
                                                style={{
                                                    borderColor: `${item.color}44`,
                                                    color: "#1A1A2E",
                                                }}>
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
            <section className="py-16 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#FFE66D" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#FFE66D" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#FFFFFF" }}>
                            The future of recruiting isn&apos;t about having
                            more tools. It&apos;s about having tools that
                            talk to each other.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FFE66D" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FFE66D" }}>
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
            <section className="integrations-cta relative py-24 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
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
                            Get Connected
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1]"
                            style={{ color: "#FFFFFF" }}>
                            Ready To{" "}
                            <span style={{ color: "#FF6B6B" }}>Connect</span>{" "}
                            Your Workflow?
                        </h2>
                        <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Splits Network integrates with the tools you already use.
                            Pick your path and start building seamless workflows today.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FF6B6B", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FF6B6B" }}>
                                <i className="fa-duotone fa-regular fa-user-tie text-xl" style={{ color: "#FFFFFF" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Recruiters
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Connect your tools to the marketplace
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FFE66D", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-building text-xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Companies
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Integrate with your existing ATS
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FFE66D", borderColor: "#FFE66D", color: "#1A1A2E" }}>
                                Post a Role
                            </a>
                        </div>

                        {/* Developers */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#4ECDC4", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#4ECDC4" }}>
                                <i className="fa-duotone fa-regular fa-code text-xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Developers
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Build with our REST API &amp; webhooks
                            </p>
                            <a href="mailto:integrations@splits.network"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#1A1A2E" }}>
                                API Access
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                            Don&apos;t see the integration you need? Let us know.
                        </p>
                        <a href="mailto:integrations@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm"
                            style={{ color: "#FFE66D" }}>
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            integrations@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </IntegrationsAnimator>
    );
}
