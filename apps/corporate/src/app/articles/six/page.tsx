import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ArticleSixAnimator } from "./article-six-animator";

export const metadata: Metadata = {
    title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry | Employment Networks",
    description:
        "Split-fee recruiting is rewriting the rules. Learn how collaborative models are replacing outdated agency practices and creating a more transparent, efficient hiring ecosystem.",
    ...buildCanonical("/articles/six"),
};

// ─── Article data ────────────────────────────────────────────────────────────

const keyStats = [
    { value: "73%", label: "of recruiters want collaborative tools", color: "#FF6B6B" },
    { value: "$4.7B", label: "split-fee market by 2027", color: "#4ECDC4" },
    { value: "2.4x", label: "faster placements via splits", color: "#FFE66D" },
    { value: "89%", label: "candidate satisfaction increase", color: "#A78BFA" },
];

const timelineEvents = [
    {
        year: "2005",
        title: "The Old Guard",
        text: "Recruiting firms operate in isolation. Split-fee deals happen over handshakes and fax machines. Trust is scarce, tracking is nonexistent.",
        color: "#FF6B6B",
    },
    {
        year: "2012",
        title: "Digital Disruption",
        text: "LinkedIn and job boards reshape sourcing. But behind the scenes, recruiter-to-recruiter collaboration remains stuck in spreadsheets and email chains.",
        color: "#4ECDC4",
    },
    {
        year: "2019",
        title: "Platform Thinking",
        text: "The first split-fee marketplaces emerge. Recruiters start sharing roles digitally, but most platforms lack the tooling to manage the full lifecycle.",
        color: "#FFE66D",
    },
    {
        year: "2024",
        title: "The Connected Era",
        text: "Modern platforms combine ATS, split-fee management, and candidate portals into unified ecosystems. Transparency becomes the competitive advantage.",
        color: "#A78BFA",
    },
    {
        year: "2026",
        title: "The Future Is Now",
        text: "AI-powered matching, real-time analytics, and integrated payment flows make split-fee recruiting faster, fairer, and more profitable than ever.",
        color: "#FF6B6B",
    },
];

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Expanded Reach",
        text: "Independent recruiters gain access to roles they'd never see on their own. Companies get coverage from specialists across every niche.",
        color: "#FF6B6B",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Built-In Trust",
        text: "When terms are set upfront and visible to all parties, disputes drop and partnerships strengthen. Transparency is the foundation.",
        color: "#4ECDC4",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Faster Fills",
        text: "Multiple recruiters working the same role means faster candidate pipelines. The data shows split-fee roles fill 2.4x faster on average.",
        color: "#FFE66D",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Candidate Experience",
        text: "When recruiters collaborate instead of compete, candidates get better representation, clearer communication, and fewer duplicate outreaches.",
        color: "#A78BFA",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ArticleSixPage() {
    return (
        <ArticleSixAnimator>
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
                        {/* Category + read time */}
                        <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-newspaper"></i>
                                Industry Analysis
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em]"
                                style={{ color: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                12 min read
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em]"
                                style={{ color: "rgba(255,255,255,0.5)" }}>
                                February 14, 2026
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 opacity-0"
                            style={{ color: "#FFFFFF" }}>
                            The Future of Recruiting:{" "}
                            <span className="relative inline-block">
                                <span style={{ color: "#FF6B6B" }}>Split-Fee Models</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#FF6B6B" }} />
                            </span>{" "}
                            Are Changing The Industry
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 opacity-0"
                            style={{ color: "rgba(255,255,255,0.7)" }}>
                            The recruiting industry has operated the same way for decades.
                            Isolated firms, opaque fees, and candidates caught in the middle.
                            Split-fee models are rewriting those rules -- here&apos;s how.
                        </p>

                        {/* Author byline */}
                        <div className="hero-byline flex items-center gap-4 opacity-0">
                            <div className="w-14 h-14 flex items-center justify-center font-black text-lg"
                                style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                EN
                            </div>
                            <div>
                                <div className="font-bold uppercase tracking-wide text-sm" style={{ color: "#FFFFFF" }}>
                                    Employment Networks Editorial
                                </div>
                                <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    Research &amp; Strategy Team
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-stats py-0 overflow-hidden">
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
            <section className="article-intro py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="article-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
                                style={{ color: "#1A1A2E" }}>
                                The Model Everyone&apos;s{" "}
                                <span style={{ color: "#FF6B6B" }}>Talking About</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                For most of its history, the recruiting industry has been a collection of isolated
                                silos. Agency A works their clients. Agency B works theirs. An independent recruiter
                                might know the perfect candidate for a role they&apos;ll never see -- because it&apos;s
                                locked inside someone else&apos;s network.
                            </p>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                Split-fee recruiting changes that equation entirely. Instead of competing in darkness,
                                recruiters collaborate in the open. One recruiter brings the role. Another brings the
                                candidate. The fee is split according to pre-agreed terms. Everyone wins -- especially
                                the candidate, who gets represented by the recruiter best positioned to advocate for them.
                            </p>

                            <p className="text-lg leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                It sounds simple. And conceptually, it is. But the execution has always been the hard
                                part. Until now.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 1
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-pullquote-1 py-16 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#4ECDC4" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#4ECDC4" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#FFFFFF" }}>
                            The best candidate for a role doesn&apos;t care which recruiter
                            found the listing. They care about getting hired.
                            Split-fee models make that happen faster.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #4ECDC4" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#4ECDC4" }}>
                                -- Industry Research, 2026
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10"
                            style={{ backgroundColor: "#4ECDC4" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ARTICLE BODY - The Old Way vs The New Way
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-comparison py-20 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="comparison-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                                Then vs Now
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                What Changed?{" "}
                                <span style={{ color: "#A78BFA" }}>Everything.</span>
                            </h2>
                        </div>

                        <div className="comparison-grid grid md:grid-cols-2 gap-8">
                            {/* Old Way */}
                            <div className="comparison-card p-8 border-4 opacity-0"
                                style={{ borderColor: "#FF6B6B", backgroundColor: "#FFFFFF" }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center"
                                        style={{ backgroundColor: "#FF6B6B" }}>
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-xl" style={{ color: "#FFFFFF" }}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        The Old Way
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Recruiters hoard job orders and guard client relationships",
                                        "Split deals happen through personal networks and trust alone",
                                        "No standardized terms -- every deal is a negotiation",
                                        "Candidates get passed around with no visibility into the process",
                                        "Payment disputes are common and resolution is painful",
                                        "Independent recruiters are locked out of major opportunities",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                            style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                            <i className="fa-duotone fa-regular fa-xmark mt-0.5 flex-shrink-0"
                                                style={{ color: "#FF6B6B" }}></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* New Way */}
                            <div className="comparison-card p-8 border-4 opacity-0"
                                style={{ borderColor: "#4ECDC4", backgroundColor: "#FFFFFF" }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center"
                                        style={{ backgroundColor: "#4ECDC4" }}>
                                        <i className="fa-duotone fa-regular fa-rocket text-xl" style={{ color: "#1A1A2E" }}></i>
                                    </div>
                                    <h3 className="font-black text-xl uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        The New Way
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Roles are shared openly on a marketplace for qualified recruiters",
                                        "Terms are set upfront and visible to all parties before work begins",
                                        "Standardized contracts eliminate negotiation overhead",
                                        "Candidates track their progress in real-time through their own portal",
                                        "Payments are automated based on verified placement milestones",
                                        "Any recruiter with the right skills can access the right opportunities",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"
                                            style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                            <i className="fa-duotone fa-regular fa-check mt-0.5 flex-shrink-0"
                                                style={{ color: "#4ECDC4" }}></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK - Unsplash photo with retro treatment
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-image-break relative overflow-hidden" style={{ minHeight: "400px" }}>
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80"
                    alt="Team collaborating in modern office"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: "400px" }}
                />
                {/* Retro color overlay -- solid, not gradient */}
                <div className="absolute inset-0" style={{ backgroundColor: "#1A1A2E", opacity: 0.75 }} />
                {/* Memphis border frame */}
                <div className="absolute inset-4 md:inset-8 border-4 pointer-events-none"
                    style={{ borderColor: "#FFE66D" }} />

                <div className="relative z-10 flex items-center justify-center py-24 px-8">
                    <div className="image-caption text-center max-w-3xl opacity-0">
                        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight"
                            style={{ color: "#FFFFFF" }}>
                            Collaboration beats{" "}
                            <span style={{ color: "#FFE66D" }}>competition</span>
                            {" "}-- every single time.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TIMELINE - Evolution of Split-Fee Recruiting
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-timeline py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="timeline-heading text-center mb-16 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                Timeline
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#FFFFFF" }}>
                                How We{" "}
                                <span style={{ color: "#FFE66D" }}>Got Here</span>
                            </h2>
                        </div>

                        <div className="timeline-items space-y-0">
                            {timelineEvents.map((event, index) => (
                                <div key={index}
                                    className="timeline-item flex gap-6 md:gap-8 opacity-0"
                                    style={{ paddingBottom: index < timelineEvents.length - 1 ? "0" : undefined }}>
                                    {/* Year column */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-16 md:w-20 py-2 text-center font-black text-lg md:text-xl"
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
                ARTICLE BODY - Why Split-Fee Works
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-why py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="why-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
                                style={{ color: "#1A1A2E" }}>
                                Why It{" "}
                                <span style={{ color: "#4ECDC4" }}>Actually Works</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                The skeptics have a point -- split-fee recruiting has been tried before. Networks
                                of recruiters sharing roles over email lists and LinkedIn groups have existed for
                                years. Most of them fizzled. So what&apos;s different now?
                            </p>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                The answer is infrastructure. Previous split-fee attempts failed because they lacked
                                the underlying technology to enforce transparency, track contributions, and automate
                                payments. Recruiters had to trust each other blindly. Companies had no visibility.
                                Candidates were an afterthought.
                            </p>

                            <p className="text-lg leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                Modern platforms solve this by treating the split-fee relationship as a first-class
                                citizen. Every interaction is tracked. Every contribution is visible. Every payment
                                is tied to a verified outcome. When the infrastructure handles trust, collaboration
                                becomes the default instead of the exception.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-pullquote-2 py-16 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 opacity-0"
                        style={{ borderColor: "#FF6B6B" }}>
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
                            style={{ color: "#FF6B6B" }}>
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
                            style={{ color: "#1A1A2E" }}>
                            Previous split-fee attempts failed because they
                            lacked infrastructure. When platforms handle trust,
                            collaboration becomes the default.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FF6B6B" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FF6B6B" }}>
                                -- Employment Networks Editorial
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-10 h-10"
                            style={{ backgroundColor: "#FF6B6B" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BENEFITS GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-benefits py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="benefits-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                                style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                The Upside
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                style={{ color: "#1A1A2E" }}>
                                Everyone{" "}
                                <span style={{ color: "#4ECDC4" }}>Benefits</span>
                            </h2>
                        </div>

                        <div className="benefits-grid grid md:grid-cols-2 gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index}
                                    className="benefit-card relative p-6 md:p-8 border-4 opacity-0"
                                    style={{ borderColor: benefit.color, backgroundColor: "#FFFFFF" }}>
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: benefit.color }} />
                                    <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                        style={{ borderColor: benefit.color }}>
                                        <i className={`${benefit.icon} text-2xl`} style={{ color: benefit.color }}></i>
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-wide mb-3"
                                        style={{ color: "#1A1A2E" }}>
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.75 }}>
                                        {benefit.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE BREAK 2
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden" style={{ minHeight: "350px" }}>
                <img
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&q=80"
                    alt="Modern workspace with technology"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: "350px" }}
                />
                <div className="absolute inset-0" style={{ backgroundColor: "#233876", opacity: 0.8 }} />
                <div className="absolute inset-4 md:inset-8 border-4 pointer-events-none"
                    style={{ borderColor: "#FF6B6B" }} />

                <div className="relative z-10 flex items-center justify-center py-20 px-8">
                    <div className="image-caption-2 text-center max-w-3xl opacity-0">
                        <p className="text-xl md:text-3xl font-black uppercase tracking-tight leading-tight"
                            style={{ color: "#FFFFFF" }}>
                            The platforms that win will be the ones that make{" "}
                            <span style={{ color: "#FF6B6B" }}>transparency</span>{" "}
                            feel effortless.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ARTICLE BODY - Looking Ahead
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-future py-20 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="future-section opacity-0">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6"
                                style={{ color: "#1A1A2E" }}>
                                What&apos;s{" "}
                                <span style={{ color: "#A78BFA" }}>Next</span>
                            </h2>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                The split-fee model is still early. Most of the recruiting industry hasn&apos;t
                                adopted collaborative platforms yet. But the trajectory is clear. The firms
                                and independent recruiters who embrace open collaboration now are building the
                                networks that will dominate the next decade.
                            </p>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                AI will accelerate this shift. When platforms can automatically match the right
                                recruiter to the right role based on track record, specialization, and network --
                                the friction that once made split-fee deals impractical disappears entirely.
                                Matching becomes instant. Trust becomes data-driven.
                            </p>

                            <p className="text-lg leading-relaxed mb-6" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                For candidates, this means better representation. When multiple specialized
                                recruiters can advocate for a candidate rather than a single generalist, the
                                quality of opportunities and communication improves dramatically. The data
                                already shows an 89% increase in candidate satisfaction on collaborative platforms.
                            </p>

                            <p className="text-lg leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.8 }}>
                                The future of recruiting isn&apos;t solo. It&apos;s networked. It&apos;s transparent.
                                And it&apos;s already here.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE 3 - Final
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
                            The future of recruiting isn&apos;t solo.
                            It&apos;s networked. It&apos;s transparent.
                            And it&apos;s already here.
                        </p>
                        <div className="mt-6 pt-4" style={{ borderTop: "3px solid #FFE66D" }}>
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#FFE66D" }}>
                                -- Employment Networks, 2026
                            </span>
                        </div>
                        <div className="absolute top-0 left-0 w-10 h-10"
                            style={{ backgroundColor: "#FFE66D" }} />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA - Match landing page style
               ══════════════════════════════════════════════════════════════ */}
            <section className="article-cta relative py-24 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
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
                            Join the Movement
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1]"
                            style={{ color: "#FFFFFF" }}>
                            Ready To See{" "}
                            <span style={{ color: "#FF6B6B" }}>Split-Fee</span>{" "}
                            In Action?
                        </h2>
                        <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Employment Networks powers the platforms making this future real.
                            Pick your path and get started today.
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
                                Access the split-fee marketplace
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
                                Post roles, find vetted talent
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FFE66D", borderColor: "#FFE66D", color: "#1A1A2E" }}>
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#4ECDC4", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#4ECDC4" }}>
                                <i className="fa-duotone fa-regular fa-user text-xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Candidates
                            </h3>
                            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Free profile, real recruiters
                            </p>
                            <a href="https://applicant.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#1A1A2E" }}>
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                            Want to learn more? Read our other articles or get in touch.
                        </p>
                        <a href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm"
                            style={{ color: "#FFE66D" }}>
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </ArticleSixAnimator>
    );
}
