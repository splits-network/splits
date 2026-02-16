import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { PressAnimator } from "./press-animator";

export const metadata: Metadata = {
    title: "Press Room | Splits Network",
    description:
        "The latest press releases, company news, and media resources from Splits Network. The split-fee recruiting marketplace changing how hiring works.",
    openGraph: {
        title: "Press Room | Splits Network",
        description:
            "The latest press releases, company news, and media resources from Splits Network.",
        url: "https://splits.network/public/press-memphis",
    },
    ...buildCanonical("/public/press-memphis"),
};

// ─── Press release data ─────────────────────────────────────────────────────

const ACCENT_CYCLE = ["bg-coral", "bg-teal", "bg-yellow", "bg-purple"] as const;
const ACCENT_BORDER_CYCLE = ["border-coral", "border-teal", "border-yellow", "border-purple"] as const;
const ACCENT_TEXT_CYCLE = ["text-coral", "text-teal", "text-yellow", "text-purple"] as const;

const keyStats = [
    { value: "500+", label: "Recruiting firms on platform", accent: 0 },
    { value: "$18M", label: "In split-fee placements", accent: 1 },
    { value: "12K+", label: "Active candidates", accent: 2 },
    { value: "98%", label: "Payout accuracy rate", accent: 3 },
];

const pressReleases = [
    {
        title: "Splits Network Closes $12M Series A to Expand Split-Fee Marketplace",
        date: "February 10, 2026",
        category: "Funding",
        excerpt:
            "The round was led by Gradient Ventures with participation from existing investors. Funds will accelerate product development and market expansion across North America.",
    },
    {
        title: "New AI Matching Engine Reduces Time-to-Fill by 47%",
        date: "January 22, 2026",
        category: "Product",
        excerpt:
            "Our proprietary matching algorithm now pairs recruiters with open roles based on historical performance, specialization, and network strength -- delivering faster fills.",
    },
    {
        title: "Splits Network Partners with Top 50 Staffing Firms for Enterprise Rollout",
        date: "January 8, 2026",
        category: "Partnership",
        excerpt:
            "Strategic partnerships bring split-fee capabilities to enterprise staffing operations, enabling large firms to collaborate with independent recruiters at scale.",
    },
    {
        title: "Platform Surpasses 10,000 Successful Placements Milestone",
        date: "December 15, 2025",
        category: "Milestone",
        excerpt:
            "In just 18 months since launch, the marketplace has facilitated over 10,000 verified placements with a 98% payout accuracy rate and zero payment disputes.",
    },
    {
        title: "Candidate Portal Launch Gives Job Seekers Full Visibility Into Process",
        date: "November 28, 2025",
        category: "Product",
        excerpt:
            "Candidates can now track applications, communicate with recruiters, and manage their profiles through a dedicated self-service portal with real-time status updates.",
    },
    {
        title: "Splits Network Named to Forbes 'Next Billion-Dollar Startups' List",
        date: "November 3, 2025",
        category: "Recognition",
        excerpt:
            "Forbes recognizes Splits Network for its innovative approach to recruiting marketplace infrastructure, citing rapid growth and strong unit economics.",
    },
];

const mediaKitItems = [
    {
        icon: "fa-duotone fa-regular fa-palette",
        title: "Brand Guidelines",
        description: "Logo usage, color palette, typography, and spacing rules",
    },
    {
        icon: "fa-duotone fa-regular fa-image",
        title: "Logo Package",
        description: "SVG, PNG, and EPS formats in full color, monochrome, and reversed",
    },
    {
        icon: "fa-duotone fa-regular fa-photo-film",
        title: "Product Screenshots",
        description: "High-resolution screenshots of the platform for editorial use",
    },
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Executive Bios",
        description: "Leadership headshots and biographical information for press",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PressMemphisPage() {
    return (
        <PressAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="press-hero relative min-h-[70vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-[4px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle */}
                    <svg className="memphis-shape absolute top-[18%] left-[45%] opacity-0" width="50" height="43" viewBox="0 0 50 43">
                        <polygon points="25,0 50,43 0,43" className="fill-yellow" />
                    </svg>
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
                            fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" className="stroke-yellow" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" className="stroke-yellow" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="hero-badge mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-newspaper"></i>
                                Press Room
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            The{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Record</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-10 text-white/70 max-w-2xl mx-auto opacity-0">
                            Company news, product announcements, and media resources
                            from the platform changing how recruiting works.
                        </p>

                        {/* Meta line */}
                        <div className="hero-meta flex flex-wrap items-center justify-center gap-6 opacity-0">
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-teal">
                                <i className="fa-duotone fa-regular fa-rss mr-1"></i>
                                Latest Updates
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/50">
                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                Updated February 2026
                            </span>
                            <a href="#media-contact" className="text-xs font-bold uppercase tracking-[0.15em] text-yellow hover:text-yellow/80 transition-colors">
                                <i className="fa-duotone fa-regular fa-envelope mr-1"></i>
                                Media Inquiries
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FEATURED RELEASE
               ══════════════════════════════════════════════════════════════ */}
            <section className="press-featured py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="featured-card relative p-8 md:p-12 border-4 border-coral bg-white opacity-0">
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-12 h-12 bg-coral" />

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                    <i className="fa-duotone fa-regular fa-star"></i>
                                    Featured Release
                                </span>
                                <span className="text-xs font-bold uppercase tracking-[0.15em] text-dark/50">
                                    February 10, 2026
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-6 text-dark">
                                Splits Network Closes{" "}
                                <span className="text-coral">$12M Series A</span>{" "}
                                to Expand Split-Fee Marketplace
                            </h2>

                            <p className="text-base leading-relaxed mb-8 text-dark/80">
                                The round was led by Gradient Ventures with participation from existing investors.
                                Funds will accelerate product development, expand the recruiter network across
                                North America, and build out the AI-powered matching infrastructure that has
                                already reduced time-to-fill by 47% for participating firms.
                            </p>

                            <a href="/public/press/splits-network-series-a"
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider border-4 border-coral text-coral transition-transform hover:-translate-y-1 bg-white">
                                Read Full Release
                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KEY STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="press-stats py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {keyStats.map((stat, index) => (
                        <div key={index}
                            className={`stat-block p-6 md:p-8 text-center opacity-0 ${ACCENT_CYCLE[stat.accent]} ${stat.accent === 2 ? "text-dark" : "text-white"}`}>
                            <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.12em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PRESS RELEASES GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="press-releases py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="releases-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                All Releases
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Latest{" "}
                                <span className="text-teal">News</span>
                            </h2>
                        </div>

                        <div className="releases-grid grid md:grid-cols-2 gap-6">
                            {pressReleases.map((release, index) => {
                                const accentIdx = index % 4;
                                return (
                                    <div key={index}
                                        className={`release-card relative p-6 md:p-8 border-4 ${ACCENT_BORDER_CYCLE[accentIdx]} bg-white opacity-0`}>
                                        {/* Left accent stripe */}
                                        <div className={`absolute top-0 left-0 w-2 h-full ${ACCENT_CYCLE[accentIdx]}`} />

                                        <div className="pl-4">
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${ACCENT_CYCLE[accentIdx]} ${accentIdx === 2 ? "text-dark" : "text-white"}`}>
                                                    {release.category}
                                                </span>
                                                <span className="text-xs font-bold uppercase tracking-[0.12em] text-dark/50">
                                                    {release.date}
                                                </span>
                                            </div>

                                            <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-dark">
                                                {release.title}
                                            </h3>

                                            <p className="text-sm leading-relaxed mb-4 text-dark/75">
                                                {release.excerpt}
                                            </p>

                                            <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${ACCENT_TEXT_CYCLE[accentIdx]}`}>
                                                Read More
                                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PULL QUOTE
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-teal opacity-0">
                        <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-teal">
                            &ldquo;
                        </div>
                        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
                            We are building the infrastructure that makes
                            recruiter collaboration the default, not the exception.
                            Every placement on our platform proves the model works.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Splits Network, Company Mission
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                MEDIA KIT
               ══════════════════════════════════════════════════════════════ */}
            <section className="press-media py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="media-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Resources
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Media{" "}
                                <span className="text-purple">Kit</span>
                            </h2>
                        </div>

                        <div className="media-grid grid md:grid-cols-2 gap-6">
                            {mediaKitItems.map((item, index) => {
                                const accentIdx = index % 4;
                                return (
                                    <div key={index}
                                        className={`media-card relative p-6 md:p-8 border-4 ${ACCENT_BORDER_CYCLE[accentIdx]} bg-white opacity-0`}>
                                        <div className={`absolute top-0 right-0 w-10 h-10 ${ACCENT_CYCLE[accentIdx]}`} />

                                        <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${ACCENT_BORDER_CYCLE[accentIdx]}`}>
                                            <i className={`${item.icon} text-2xl ${ACCENT_TEXT_CYCLE[accentIdx]}`}></i>
                                        </div>

                                        <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed mb-4 text-dark/75">
                                            {item.description}
                                        </p>

                                        <button className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider border-4 ${ACCENT_BORDER_CYCLE[accentIdx]} ${ACCENT_TEXT_CYCLE[accentIdx]} bg-white transition-transform hover:-translate-y-1`}>
                                            <i className="fa-duotone fa-regular fa-download"></i>
                                            Download
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                MEDIA CONTACT
               ══════════════════════════════════════════════════════════════ */}
            <section id="media-contact" className="press-contact py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="contact-card relative p-8 md:p-12 border-4 border-yellow bg-white text-center opacity-0">
                            {/* Corner decorations */}
                            <div className="absolute top-0 left-0 w-10 h-10 bg-yellow" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 bg-yellow" />

                            <div className="w-20 h-20 mx-auto flex items-center justify-center mb-6 border-4 border-yellow">
                                <i className="fa-duotone fa-regular fa-envelope text-3xl text-yellow"></i>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-dark">
                                Media{" "}
                                <span className="text-yellow">Contact</span>
                            </h2>

                            <p className="text-base leading-relaxed mb-6 text-dark/75">
                                For press inquiries, interview requests, or media kit access,
                                reach our communications team directly.
                            </p>

                            <a href="mailto:press@splits.network"
                                className="inline-flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider border-4 border-yellow bg-yellow text-dark transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                press@splits.network
                            </a>

                            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t-[3px] border-yellow/30">
                                <span className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                    <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                    Response within 24 hours
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                    <i className="fa-duotone fa-regular fa-globe mr-1"></i>
                                    English language
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="press-cta relative py-24 overflow-hidden bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-yellow" />
                    <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                        <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                            fill="none" className="stroke-purple" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                            Join the Movement
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            Ready To See{" "}
                            <span className="text-coral">Split-Fee</span>{" "}
                            In Action?
                        </h2>
                        <p className="text-lg mb-10 text-white/70">
                            Splits Network powers the marketplace making collaborative recruiting real.
                            Pick your path and get started today.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 border-coral text-center bg-white/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-coral">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-white"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Recruiters
                            </h3>
                            <p className="text-xs mb-5 text-white/60">
                                Access the split-fee marketplace
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-coral border-coral text-white">
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 border-yellow text-center bg-white/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-yellow">
                                <i className="fa-duotone fa-regular fa-building text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Companies
                            </h3>
                            <p className="text-xs mb-5 text-white/60">
                                Post roles, find vetted talent
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-yellow border-yellow text-dark">
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-4 border-teal text-center bg-white/[0.03] opacity-0">
                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-teal">
                                <i className="fa-duotone fa-regular fa-user text-xl text-dark"></i>
                            </div>
                            <h3 className="font-black text-base uppercase mb-2 text-white">
                                Candidates
                            </h3>
                            <p className="text-xs mb-5 text-white/60">
                                Free profile, real recruiters
                            </p>
                            <a href="https://applicant.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-teal border-teal text-dark">
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3 text-white/50">
                            Want to learn more? Read our press releases or get in touch.
                        </p>
                        <a href="mailto:press@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            press@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </PressAnimator>
    );
}
