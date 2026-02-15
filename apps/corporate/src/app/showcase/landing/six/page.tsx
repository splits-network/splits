import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { corporateFaqs } from "@/components/landing/sections/faq-data";
import { RetroAnimator } from "./retro-animator";

export const metadata: Metadata = {
    title: "Recruiting, Rewired | Employment Networks",
    description:
        "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates. Bold platforms for bold recruiters.",
    ...buildCanonical("/landing/six"),
};

// ─── Data ────────────────────────────────────────────────────────────────────

const painPoints = [
    {
        icon: "fa-duotone fa-regular fa-puzzle-piece-simple",
        label: "Fragmented Tools",
        text: "Recruiters juggle 5+ tools that don't talk to each other",
        color: "#FF6B6B",
    },
    {
        icon: "fa-duotone fa-regular fa-ghost",
        label: "Ghosted Candidates",
        text: "Applications vanish into black holes with zero feedback",
        color: "#4ECDC4",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        label: "Zero Visibility",
        text: "Companies can't see what recruiters are actually doing",
        color: "#FFE66D",
    },
    {
        icon: "fa-duotone fa-regular fa-file-spreadsheet",
        label: "Spreadsheet Chaos",
        text: "Split-fee tracking via email chains and Excel nightmares",
        color: "#A78BFA",
    },
];

const platforms = [
    {
        name: "Splits Network",
        tagline: "For Recruiters & Companies",
        logo: "/splits.png",
        color: "#233876",
        bgColor: "#233876",
        textColor: "#FFFFFF",
        features: [
            "Split-fee marketplace",
            "Built-in ATS",
            "Real-time pipelines",
            "Team collaboration",
            "Placement tracking",
            "Transparent earnings",
        ],
        cta: { label: "Join the Network", href: "https://splits.network/sign-up" },
    },
    {
        name: "Applicant Network",
        tagline: "For Job Seekers",
        logo: "/applicant.png",
        color: "#0f9d8a",
        bgColor: "#0f9d8a",
        textColor: "#FFFFFF",
        features: [
            "One-click apply",
            "Recruiter matching",
            "Real-time tracking",
            "Interview prep",
            "100% free forever",
            "No ghosting guarantee",
        ],
        cta: { label: "Create Free Profile", href: "https://applicant.network/sign-up" },
    },
];

const howItWorks = [
    {
        step: "01",
        title: "Sign Up",
        text: "Create your account in under 2 minutes. Pick your role: recruiter, company, or candidate.",
        icon: "fa-duotone fa-regular fa-user-plus",
        bgColor: "#FF6B6B",
    },
    {
        step: "02",
        title: "Connect",
        text: "Get matched with the right people. Recruiters find roles, candidates find advocates, companies find talent.",
        icon: "fa-duotone fa-regular fa-handshake",
        bgColor: "#4ECDC4",
    },
    {
        step: "03",
        title: "Collaborate",
        text: "Work together on a shared platform with real-time updates, transparent pipelines, and clear terms.",
        icon: "fa-duotone fa-regular fa-users",
        bgColor: "#FFE66D",
    },
    {
        step: "04",
        title: "Get Paid",
        text: "Placements happen. Splits are automatic. Everyone wins. No mystery math, no surprise fees.",
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        bgColor: "#A78BFA",
    },
];

const metrics = [
    { value: 10000, suffix: "+", label: "Active Listings", color: "#FF6B6B" },
    { value: 2000, suffix: "+", label: "Recruiters", color: "#4ECDC4" },
    { value: 500, suffix: "+", label: "Companies", color: "#FFE66D" },
    { value: 95, suffix: "%", label: "Response Rate", color: "#A78BFA" },
];

const testimonials = [
    {
        quote: "I went from cold-calling to a full pipeline in two weeks. The split-fee marketplace is a game changer.",
        name: "Marcus T.",
        role: "Independent Recruiter",
        color: "#FF6B6B",
    },
    {
        quote: "For the first time, I actually know what's happening with my applications. No more wondering.",
        name: "Priya S.",
        role: "Software Engineer",
        color: "#4ECDC4",
    },
    {
        quote: "One platform, one set of terms, instant access to vetted recruiters. This is how it should work.",
        name: "David L.",
        role: "VP of Talent, Series B Startup",
        color: "#A78BFA",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingSixPage() {
    return (
        <RetroAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO - Memphis-style bold blocks
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-hero relative min-h-[100vh] overflow-hidden flex items-center"
                style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis geometric decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Circles */}
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-32 h-32 rounded-full border-[6px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[60%] right-[8%] w-24 h-24 rounded-full opacity-0"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="memphis-shape absolute bottom-[15%] left-[12%] w-16 h-16 rounded-full opacity-0"
                        style={{ backgroundColor: "#FFE66D" }} />

                    {/* Squares / Rectangles */}
                    <div className="memphis-shape absolute top-[20%] right-[15%] w-20 h-20 rotate-12 opacity-0"
                        style={{ backgroundColor: "#A78BFA" }} />
                    <div className="memphis-shape absolute bottom-[25%] right-[25%] w-28 h-12 -rotate-6 border-[4px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[45%] left-[20%] w-14 h-14 rotate-45 opacity-0"
                        style={{ backgroundColor: "#FF6B6B" }} />

                    {/* Triangles (CSS) */}
                    <div className="memphis-shape absolute top-[30%] left-[40%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "30px solid transparent",
                            borderRight: "30px solid transparent",
                            borderBottom: "52px solid #FFE66D",
                            transform: "rotate(-15deg)",
                        }} />
                    <div className="memphis-shape absolute bottom-[35%] left-[60%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "20px solid transparent",
                            borderRight: "20px solid transparent",
                            borderBottom: "35px solid #4ECDC4",
                            transform: "rotate(20deg)",
                        }} />

                    {/* Dots pattern */}
                    <div className="memphis-shape absolute top-[15%] right-[35%] opacity-0">
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF6B6B" }} />
                            ))}
                        </div>
                    </div>

                    {/* Zigzag lines */}
                    <svg className="memphis-shape absolute bottom-[10%] right-[40%] opacity-0" width="120" height="40" viewBox="0 0 120 40">
                        <polyline points="0,30 15,10 30,30 45,10 60,30 75,10 90,30 105,10 120,30"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>

                    {/* Plus signs */}
                    <svg className="memphis-shape absolute top-[70%] left-[35%] opacity-0" width="40" height="40" viewBox="0 0 40 40">
                        <line x1="20" y1="5" x2="20" y2="35" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="5" y1="20" x2="35" y2="20" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <svg className="memphis-shape absolute top-[8%] left-[55%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Overline badge */}
                        <div className="hero-overline inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em]"
                                style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                <i className="fa-duotone fa-regular fa-bolt"></i>
                                Employment Networks
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-8 opacity-0 uppercase tracking-tight"
                            style={{ color: "#FFFFFF" }}>
                            Recruiting,{" "}
                            <span className="relative inline-block">
                                <span style={{ color: "#FF6B6B" }}>Rewired</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#FF6B6B" }} />
                            </span>
                        </h1>

                        <p className="hero-subtext text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-0"
                            style={{ color: "#FFFFFF", opacity: 0.8 }}>
                            Two bold platforms. One connected ecosystem.
                            Recruiters, companies, and candidates -- finally on the same page.
                        </p>

                        <div className="hero-cta-row flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#platforms"
                                className="retro-btn hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1 opacity-0"
                                style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Get Started Free
                            </a>
                            <a href="#how-it-works"
                                className="retro-btn hero-cta-btn inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1 opacity-0"
                                style={{ backgroundColor: "transparent", borderColor: "#FFFFFF", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-circle-play"></i>
                                See How It Works
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PROBLEM - Color-blocked cards
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-problem py-24 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="problem-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                            style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                            The Problem
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6"
                            style={{ color: "#1A1A2E" }}>
                            Recruiting Is{" "}
                            <span style={{ color: "#FF6B6B", textDecoration: "line-through", textDecorationThickness: "4px" }}>
                                Broken
                            </span>
                        </h2>
                        <p className="text-lg" style={{ color: "#1A1A2E", opacity: 0.7 }}>
                            The industry is stuck in the past. Here&apos;s what&apos;s wrong.
                        </p>
                    </div>

                    <div className="pain-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {painPoints.map((pain, index) => (
                            <div key={index}
                                className="pain-card relative p-6 border-4 opacity-0"
                                style={{ borderColor: pain.color, backgroundColor: "#FFFFFF" }}>
                                {/* Corner accent */}
                                <div className="absolute top-0 right-0 w-12 h-12"
                                    style={{ backgroundColor: pain.color }} />
                                <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                    style={{ borderColor: pain.color }}>
                                    <i className={`${pain.icon} text-2xl`} style={{ color: pain.color }}></i>
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-wide mb-2"
                                    style={{ color: "#1A1A2E" }}>
                                    {pain.label}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.7 }}>
                                    {pain.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                PLATFORMS - Bold split layout
               ══════════════════════════════════════════════════════════════ */}
            <section id="platforms" className="retro-platforms py-0 overflow-hidden">
                {platforms.map((platform, index) => (
                    <div key={index}
                        className="platform-block"
                        style={{ backgroundColor: platform.bgColor, color: platform.textColor }}>
                        <div className="container mx-auto px-4 py-20">
                            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto ${index === 1 ? "lg:[direction:rtl]" : ""}`}>
                                {/* Content side */}
                                <div className={`platform-content opacity-0 ${index === 1 ? "lg:[direction:ltr]" : ""}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <img src={platform.logo} alt={platform.name} className="h-10" />
                                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-2"
                                            style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                                            {platform.tagline}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1.1]">
                                        {platform.name}
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {platform.features.map((feature, fi) => (
                                            <div key={fi}
                                                className="platform-feature flex items-center gap-2 px-3 py-2 border-2 text-sm font-semibold opacity-0"
                                                style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                                                <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                    <a href={platform.cta.href}
                                        className="retro-btn inline-flex items-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                        style={{ backgroundColor: "#FFFFFF", borderColor: "#FFFFFF", color: platform.bgColor }}>
                                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                        {platform.cta.label}
                                    </a>
                                </div>

                                {/* Visual side - retro dashboard mockup */}
                                <div className={`platform-visual opacity-0 ${index === 1 ? "lg:[direction:ltr]" : ""}`}>
                                    <div className="border-4 p-6" style={{ borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.05)" }}>
                                        {/* Fake window chrome */}
                                        <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF6B6B" }} />
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FFE66D" }} />
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#4ECDC4" }} />
                                            <span className="ml-3 text-xs font-mono opacity-60">
                                                {index === 0 ? "splits.network/dashboard" : "applicant.network/profile"}
                                            </span>
                                        </div>
                                        {/* Dashboard content */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 border-2" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        {index === 0 ? "Senior Software Engineer" : "Frontend Developer"}
                                                    </div>
                                                    <div className="text-xs opacity-60">
                                                        {index === 0 ? "TechCorp" : "Applied 3 days ago"}
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 text-xs font-bold"
                                                    style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                                                    {index === 0 ? "Active" : "Interview"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 border-2" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        {index === 0 ? "Product Manager" : "React Developer"}
                                                    </div>
                                                    <div className="text-xs opacity-60">
                                                        {index === 0 ? "StartupXYZ" : "Recruiter matched"}
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 text-xs font-bold"
                                                    style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                                                    {index === 0 ? "Interviewing" : "Matched"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 border-2" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        {index === 0 ? "UX Designer" : "Full Stack Role"}
                                                    </div>
                                                    <div className="text-xs opacity-60">
                                                        {index === 0 ? "DesignCo" : "Under review"}
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 text-xs font-bold"
                                                    style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                                    {index === 0 ? "Offer Stage" : "Reviewing"}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Stats bar */}
                                        <div className="mt-4 pt-4 flex justify-between" style={{ borderTop: "2px solid rgba(255,255,255,0.2)" }}>
                                            <div className="text-center">
                                                <div className="text-2xl font-black">
                                                    {index === 0 ? "$12.4K" : "5"}
                                                </div>
                                                <div className="text-xs opacity-60 uppercase tracking-wider">
                                                    {index === 0 ? "This Month" : "Active Apps"}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black">
                                                    {index === 0 ? "3" : "2"}
                                                </div>
                                                <div className="text-xs opacity-60 uppercase tracking-wider">
                                                    {index === 0 ? "Placements" : "Interviews"}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black">
                                                    {index === 0 ? "12" : "1"}
                                                </div>
                                                <div className="text-xs opacity-60 uppercase tracking-wider">
                                                    {index === 0 ? "In Pipeline" : "Recruiter"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HOW IT WORKS - Numbered steps with color blocks
               ══════════════════════════════════════════════════════════════ */}
            <section id="how-it-works" className="retro-how py-24 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="how-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                            style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                            How It Works
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6" style={{ color: "#FFFFFF" }}>
                            Four Steps.{" "}
                            <span style={{ color: "#FFE66D" }}>Zero Friction.</span>
                        </h2>
                    </div>

                    <div className="how-steps grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {howItWorks.map((step, index) => (
                            <div key={index}
                                className="how-step-card relative p-6 border-4 opacity-0"
                                style={{ borderColor: step.bgColor, backgroundColor: "rgba(255,255,255,0.03)" }}>
                                {/* Step number */}
                                <div className="absolute -top-5 -left-3 px-3 py-1 text-2xl font-black"
                                    style={{ backgroundColor: step.bgColor, color: step.bgColor === "#FFE66D" ? "#1A1A2E" : "#FFFFFF" }}>
                                    {step.step}
                                </div>
                                <div className="mt-4 mb-4">
                                    <i className={`${step.icon} text-3xl`} style={{ color: step.bgColor }}></i>
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide mb-2" style={{ color: "#FFFFFF" }}>
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                METRICS - Bold color-blocked counters
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-metrics py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric, index) => (
                        <div key={index}
                            className="metric-block p-8 md:p-12 text-center opacity-0"
                            style={{ backgroundColor: metric.color, color: metric.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF" }}>
                            <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2"
                                data-value={metric.value}
                                data-suffix={metric.suffix}>
                                {metric.value >= 1000 ? metric.value.toLocaleString() : metric.value}{metric.suffix}
                            </div>
                            <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                                {metric.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TESTIMONIALS - Retro quote cards
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-testimonials py-24 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="testimonials-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                            style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                            Real People
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight"
                            style={{ color: "#1A1A2E" }}>
                            Don&apos;t Take{" "}
                            <span style={{ color: "#A78BFA" }}>Our Word</span>{" "}
                            For It
                        </h2>
                    </div>

                    <div className="testimonial-grid grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {testimonials.map((t, index) => (
                            <div key={index}
                                className="testimonial-card relative p-8 border-4 opacity-0"
                                style={{ borderColor: t.color, backgroundColor: "#FFFFFF" }}>
                                {/* Big quote mark */}
                                <div className="absolute -top-6 left-6 text-6xl font-black leading-none"
                                    style={{ color: t.color }}>
                                    &ldquo;
                                </div>
                                <p className="text-base leading-relaxed mb-6 mt-4" style={{ color: "#1A1A2E" }}>
                                    {t.quote}
                                </p>
                                <div className="pt-4" style={{ borderTop: `3px solid ${t.color}` }}>
                                    <div className="font-black uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        {t.name}
                                    </div>
                                    <div className="text-sm" style={{ color: t.color }}>
                                        {t.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FAQ - Memphis-styled accordion
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-faq py-24 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="container mx-auto px-4">
                    <div className="faq-heading text-center mb-16 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                            style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                            FAQ
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight"
                            style={{ color: "#1A1A2E" }}>
                            Got Questions?
                        </h2>
                    </div>

                    <div className="faq-list max-w-3xl mx-auto space-y-4">
                        {corporateFaqs.map((faq, index) => {
                            const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FF6B6B", "#4ECDC4"];
                            const color = colors[index % colors.length];
                            return (
                                <div key={index}
                                    className="faq-item border-4 opacity-0"
                                    style={{ borderColor: color }}>
                                    <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-lg uppercase tracking-wide"
                                            style={{ color: "#1A1A2E" }}>
                                            {faq.question}
                                            <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-xl transition-transform group-open:rotate-45"
                                                style={{ backgroundColor: color, color: color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF" }}>
                                                +
                                            </span>
                                        </summary>
                                        <div className="px-5 pb-5">
                                            <p className="leading-relaxed" style={{ color: "#1A1A2E", opacity: 0.7 }}>
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA - Bold color-blocked final call
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-cta relative py-24 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] right-[5%] w-20 h-20 rounded-full border-4"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="absolute bottom-[15%] left-[8%] w-16 h-16 rotate-45"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="absolute top-[50%] left-[3%] w-12 h-12 rounded-full"
                        style={{ backgroundColor: "#FFE66D" }} />
                    <svg className="absolute bottom-[20%] right-[15%]" width="80" height="30" viewBox="0 0 80 30">
                        <polyline points="0,25 10,5 20,25 30,5 40,25 50,5 60,25 70,5 80,25"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1]"
                            style={{ color: "#FFFFFF" }}>
                            Ready To{" "}
                            <span style={{ color: "#FF6B6B" }}>Rewire</span>{" "}
                            Your Recruiting?
                        </h2>
                        <p className="text-xl mb-12" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Join thousands of recruiters, companies, and candidates
                            who are done with the old way.
                        </p>
                    </div>

                    <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {/* Recruiters */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FF6B6B", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FF6B6B" }}>
                                <i className="fa-duotone fa-regular fa-user-tie text-2xl" style={{ color: "#FFFFFF" }}></i>
                            </div>
                            <h3 className="font-black text-lg uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Recruiters
                            </h3>
                            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Join the split-fee marketplace
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="retro-btn block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                Join Network
                            </a>
                        </div>

                        {/* Companies */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#FFE66D", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#FFE66D" }}>
                                <i className="fa-duotone fa-regular fa-building text-2xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-lg uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Companies
                            </h3>
                            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Post roles, find vetted talent
                            </p>
                            <a href="https://splits.network/sign-up"
                                className="retro-btn block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FFE66D", borderColor: "#FFE66D", color: "#1A1A2E" }}>
                                Post a Role
                            </a>
                        </div>

                        {/* Candidates */}
                        <div className="cta-card p-6 border-4 text-center opacity-0"
                            style={{ borderColor: "#4ECDC4", backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: "#4ECDC4" }}>
                                <i className="fa-duotone fa-regular fa-user text-2xl" style={{ color: "#1A1A2E" }}></i>
                            </div>
                            <h3 className="font-black text-lg uppercase mb-2" style={{ color: "#FFFFFF" }}>
                                Candidates
                            </h3>
                            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                Free profile, real recruiters
                            </p>
                            <a href="https://applicant.network/sign-up"
                                className="retro-btn block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#1A1A2E" }}>
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                            Questions? We&apos;re here.
                        </p>
                        <a href="mailto:hello@employment-networks.com"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm transition-colors"
                            style={{ color: "#FFE66D" }}>
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            hello@employment-networks.com
                        </a>
                    </div>
                </div>
            </section>
        </RetroAnimator>
    );
}
