import Link from "next/link";
import type { Metadata } from "next";
import { LandingOneAnimator } from "./landing-one-animator";

export const metadata: Metadata = {
    title: "The Split-Fee Manifesto | Splits Network",
    description:
        "Recruiting is broken. Not the people -- the infrastructure. Split-fee recruiting replaces handshake deals with tracked pipelines, transparent economics, and automatic payouts.",
};

// ── Data ────────────────────────────────────────────────────────────────────

const manifestoStats = [
    { value: "68%", label: "OF SPLIT DEALS HAVE NO WRITTEN TERMS", accent: "coral" },
    { value: "$4.7B", label: "SPLIT-FEE MARKET BY 2027", accent: "teal" },
    { value: "2.4x", label: "FASTER PLACEMENTS WITH SHARED PIPELINES", accent: "yellow" },
    { value: "52", label: "DAYS AVG PAYMENT CYCLE (INDUSTRY)", accent: "purple" },
] as const;

const infrastructureFailures = [
    {
        icon: "fa-duotone fa-regular fa-handshake-slash",
        title: "NOT A PEOPLE PROBLEM",
        body: "Recruiters are good at recruiting. The problem is that the infrastructure around split-fee collaboration was never built. Deals happen over phone calls. Terms live in email threads. Payments depend on memory and goodwill.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        title: "NOT A VISIBILITY PROBLEM",
        body: "Every ATS on the market tracks candidates. None of them track the split-fee relationship itself -- who brought the role, who submitted the candidate, what percentage was agreed to, when payment is due.",
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-scale-unbalanced",
        title: "NOT A TRUST PROBLEM",
        body: "Trust between recruiters works fine when the stakes are low. But at $20K-$50K per placement, trust without enforcement is a liability. The industry needed rails. It got another spreadsheet template.",
        accent: "yellow",
    },
] as const;

const principles = [
    {
        number: "01",
        title: "TRANSPARENCY IS NON-NEGOTIABLE",
        body: "Every fee percentage, split ratio, and payout amount is visible to every party from the moment a role is posted. No back-channel conversations. No renegotiation after the fact.",
        icon: "fa-duotone fa-regular fa-eye",
        accent: "coral",
    },
    {
        number: "02",
        title: "EVERY DOLLAR IS TRACKED",
        body: "From the company's placement fee to the recruiter's split payout, every dollar flows through a single auditable system. Invoicing is automatic. Distribution is automatic.",
        icon: "fa-duotone fa-regular fa-money-bill-transfer",
        accent: "teal",
    },
    {
        number: "03",
        title: "YOUR RELATIONSHIPS ARE YOURS",
        body: "The recruiter who submits a candidate owns that relationship. The platform coordinates the placement process but never inserts itself between a recruiter and their candidate.",
        icon: "fa-duotone fa-regular fa-shield-check",
        accent: "yellow",
    },
    {
        number: "04",
        title: "TERMS ARE LOCKED BEFORE WORK BEGINS",
        body: "Split percentages, clawback windows, and guarantee periods are defined when the role is posted and accepted before the first resume is submitted. Not after. Not during. Before.",
        icon: "fa-duotone fa-regular fa-lock",
        accent: "purple",
    },
    {
        number: "05",
        title: "CONTRIBUTION IS VISIBLE",
        body: "Every submission, every interview, every status change is timestamped and attributed. When it is time to pay out, the record speaks for itself. No disputes about who did what.",
        icon: "fa-duotone fa-regular fa-chart-gantt",
        accent: "coral",
    },
] as const;

const howItWorks = [
    { step: "01", title: "POST ROLE", desc: "Company publishes requirements and fee terms to the marketplace.", accent: "coral" },
    { step: "02", title: "MATCH", desc: "Recruiters opt in to roles matching their niche and expertise.", accent: "teal" },
    { step: "03", title: "SUBMIT", desc: "Candidates are sourced and submitted via the integrated ATS.", accent: "yellow" },
    { step: "04", title: "HIRE", desc: "Placement confirmed. Split fees calculated and paid automatically.", accent: "purple" },
] as const;

const ACCENT: Record<string, { bg: string; text: string; border: string }> = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
};

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingOneMemphisPage() {
    return (
        <LandingOneAnimator>
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO -- THE MANIFESTO OPENS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[100vh] flex items-center bg-dark overflow-hidden">
                {/* Memphis geometric decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[6%] left-[3%] w-40 h-40 rounded-full border-[6px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[18%] right-[8%] w-28 h-28 rotate-12 bg-teal opacity-0" />
                    <div className="memphis-shape absolute top-[52%] left-[6%] w-16 h-16 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] right-[5%] w-24 h-24 rotate-45 border-4 border-purple opacity-0" />
                    <div className="memphis-shape absolute top-[72%] left-[20%] w-14 h-14 rotate-45 bg-coral opacity-0" />
                    <div className="memphis-shape absolute top-[10%] right-[30%] opacity-0">
                        <div className="grid grid-cols-6 gap-2.5">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={`hero-dot-${i}`} className="w-1.5 h-1.5 rounded-full bg-yellow" />
                            ))}
                        </div>
                    </div>
                    <svg className="memphis-shape absolute bottom-[8%] left-[25%] opacity-0" width="160" height="40" viewBox="0 0 160 40">
                        <polyline points="0,30 20,10 40,30 60,10 80,30 100,10 120,30 140,10 160,30" fill="none" className="stroke-teal" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <svg className="memphis-shape absolute top-[40%] right-[18%] opacity-0" width="48" height="48" viewBox="0 0 48 48">
                        <line x1="24" y1="6" x2="24" y2="42" className="stroke-coral" strokeWidth="4" strokeLinecap="round" />
                        <line x1="6" y1="24" x2="42" y2="24" className="stroke-coral" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div className="memphis-shape absolute bottom-[28%] left-[10%] w-20 h-20 border-4 border-yellow rotate-6 opacity-0" />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-10 opacity-0">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white border-4 border-coral">
                                <i className="fa-duotone fa-regular fa-scroll" />
                                A Manifesto for Recruiting
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-[6rem] font-black leading-[0.9] mb-10 text-white uppercase tracking-tight opacity-0">
                            The Rules{" "}
                            <span className="text-coral line-through decoration-4">Changed.</span>
                            <br />
                            <span className="relative inline-block mt-3">
                                <span className="text-teal">Most People</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                            </span>
                            <br />
                            Haven&apos;t Noticed Yet.
                        </h1>

                        <p className="hero-sub text-xl md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed text-white/70 opacity-0">
                            Split-fee recruiting has operated on handshakes, blind trust,
                            and untracked economics for decades. We did not build a better
                            handshake. We built the infrastructure that makes handshakes
                            unnecessary.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Link
                                href="/join"
                                className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie" />
                                Join as Recruiter
                            </Link>
                            <Link
                                href="/join"
                                className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-building" />
                                Post a Role
                            </Link>
                        </div>

                        <p className="hero-footnote text-sm text-white/30 uppercase tracking-[0.15em] font-bold opacity-0">
                            This is not a pitch. It is a declaration of how recruiting works now.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                    <div className="flex-1 bg-purple" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                2. STATS BAR
            ═══════════════════════════════════════════════════════════════ */}
            <section className="stats-section bg-white py-16 border-b-4 border-dark">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {manifestoStats.map((stat, index) => (
                            <div key={index} className="stat-block relative border-4 border-dark p-6 text-center opacity-0">
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[stat.accent].bg}`} />
                                <div className={`text-4xl md:text-5xl font-black mb-2 ${ACCENT[stat.accent].text}`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-wider text-dark/50">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                3. THE PROBLEM
            ═══════════════════════════════════════════════════════════════ */}
            <section className="problem-section py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="problem-heading text-center mb-20 max-w-4xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-6">
                            The Real Problem
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            The Problem Isn&apos;t{" "}
                            <span className="text-coral">Recruiting.</span>
                            <br />
                            It&apos;s Infrastructure.
                        </h2>
                        <p className="text-lg text-dark/70 max-w-3xl mx-auto leading-relaxed">
                            Every failed split-fee deal has the same root cause. Not bad
                            recruiters. Not difficult clients. The infrastructure to manage
                            a multi-party placement simply did not exist.
                        </p>
                    </div>

                    <div className="problem-grid grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {infrastructureFailures.map((item, index) => (
                            <div key={index} className="problem-card relative border-4 border-dark bg-white p-8 opacity-0">
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[item.accent].bg}`} />
                                <div className={`absolute top-0 right-0 w-12 h-12 ${ACCENT[item.accent].bg}`} />
                                <div className={`w-14 h-14 flex items-center justify-center mb-5 border-4 ${ACCENT[item.accent].border}`}>
                                    <i className={`${item.icon} text-2xl ${ACCENT[item.accent].text}`} />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-wide mb-4 text-dark">
                                    {item.title}
                                </h3>
                                <p className="text-base leading-relaxed text-dark/70">
                                    {item.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                4. PULL QUOTE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="pullquote relative inline-block opacity-0">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-coral" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-teal" />
                            <div className="border-l-4 border-yellow px-8 py-6">
                                <p className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;We did not build a better way to shake hands.
                                    We built a system that makes the handshake{" "}
                                    <span className="text-yellow">irrelevant.</span>&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-6">
                                    -- The Splits Network Manifesto
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                5. PRINCIPLES
            ═══════════════════════════════════════════════════════════════ */}
            <section className="principles-section py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="principles-heading text-center mb-20 max-w-4xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                            Our Principles
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Five Convictions.{" "}
                            <span className="text-teal">Zero Compromises.</span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-3xl mx-auto leading-relaxed">
                            These are not aspirational values. These are architectural
                            decisions baked into every line of code. The platform enforces
                            them so people do not have to.
                        </p>
                    </div>

                    <div className="principles-grid max-w-5xl mx-auto space-y-6">
                        {principles.map((principle) => (
                            <div key={principle.number} className="principle-card relative border-4 border-dark bg-cream p-8 md:p-10 opacity-0">
                                <div className={`absolute top-0 left-0 bottom-0 w-2 ${ACCENT[principle.accent].bg}`} />
                                <div className={`absolute top-0 right-0 w-16 h-16 ${ACCENT[principle.accent].bg} flex items-center justify-center`}>
                                    <span className={`font-black text-xl ${principle.accent === "yellow" || principle.accent === "teal" ? "text-dark" : "text-white"}`}>
                                        {principle.number}
                                    </span>
                                </div>
                                <div className="flex items-start gap-6 pr-12">
                                    <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center border-4 ${ACCENT[principle.accent].border}`}>
                                        <i className={`${principle.icon} text-xl ${ACCENT[principle.accent].text}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl uppercase tracking-wide mb-3 text-dark">
                                            {principle.title}
                                        </h3>
                                        <p className="text-base leading-relaxed text-dark/70">
                                            {principle.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                6. THE ECONOMICS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="econ-section py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="econ-heading text-center mb-16 max-w-4xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-yellow text-dark mb-6">
                            The Economics
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Show Me the{" "}
                            <span className="text-yellow">Money.</span>
                            <br />
                            All of It.
                        </h2>
                        <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">
                            No mystery math. No buried clauses. Here is exactly how a
                            $150,000 placement flows through the system.
                        </p>
                    </div>

                    <div className="econ-flow max-w-5xl mx-auto mb-16">
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
                            <div className="econ-block border-4 border-white/20 bg-coral text-white w-full lg:w-64 p-8 text-center opacity-0">
                                <div className="w-16 h-16 bg-white/20 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-building text-2xl" />
                                </div>
                                <h3 className="font-black text-xl uppercase mb-1">Company</h3>
                                <p className="text-base text-white/80">Pays $30,000</p>
                                <p className="text-xs text-white/50 mt-1">20% of $150K salary</p>
                            </div>
                            <div className="hidden lg:flex items-center justify-center w-16">
                                <svg className="w-full h-8 text-white/40" viewBox="0 0 60 32">
                                    <path d="M0 16 L44 16 L34 6 M44 16 L34 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="lg:hidden flex items-center justify-center h-10">
                                <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-white/40" />
                            </div>
                            <div className="econ-block border-4 border-white/20 bg-teal text-dark w-full lg:w-64 p-8 text-center opacity-0">
                                <div className="w-16 h-16 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-diagram-project text-2xl" />
                                </div>
                                <h3 className="font-black text-xl uppercase mb-1">Platform</h3>
                                <p className="text-base text-dark/80">Retains $7,500</p>
                                <p className="text-xs text-dark/50 mt-1">25% platform share</p>
                            </div>
                            <div className="hidden lg:flex items-center justify-center w-16">
                                <svg className="w-full h-8 text-white/40" viewBox="0 0 60 32">
                                    <path d="M0 16 L44 16 L34 6 M44 16 L34 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="lg:hidden flex items-center justify-center h-10">
                                <i className="fa-duotone fa-regular fa-arrow-down text-2xl text-white/40" />
                            </div>
                            <div className="econ-block border-4 border-white/20 bg-yellow text-dark w-full lg:w-64 p-8 text-center opacity-0">
                                <div className="w-16 h-16 bg-dark/10 border-4 border-dark flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-user-tie text-2xl" />
                                </div>
                                <h3 className="font-black text-xl uppercase mb-1">Recruiter</h3>
                                <p className="text-base text-dark/80">Receives $22,500</p>
                                <p className="text-xs text-dark/50 mt-1">75% recruiter share</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="econ-block border-4 border-white/20 bg-white/5 p-8 md:p-10 opacity-0">
                            <div className="border-t-4 border-white/10 pt-6">
                                <p className="text-center text-base font-black uppercase tracking-wider text-white/70">
                                    That $22,500 is locked before the first resume is submitted. Not after. Not during.{" "}
                                    <span className="text-yellow">Before.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                7. HOW IT WORKS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="how-section py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="how-heading text-center mb-16 max-w-4xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white mb-6">
                            The Process
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Four Steps.{" "}
                            <span className="text-purple">Full Transparency.</span>
                        </h2>
                    </div>

                    <div className="how-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {howItWorks.map((item) => (
                            <div key={item.step} className="how-step relative border-4 border-dark bg-white p-8 opacity-0">
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[item.accent].bg}`} />
                                <div className={`w-16 h-16 ${ACCENT[item.accent].bg} border-4 border-dark flex items-center justify-center mb-4`}>
                                    <span className={`text-2xl font-black ${item.accent === "teal" || item.accent === "yellow" ? "text-dark" : "text-white"}`}>
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-dark">
                                    {item.title}
                                </h3>
                                <p className="text-base text-dark/70 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                8. TESTIMONIAL / SOCIAL PROOF
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-white py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="testimonial-block max-w-4xl mx-auto text-center opacity-0">
                        <div className="relative inline-block">
                            <div className="absolute -top-5 -left-5 w-10 h-10 bg-teal" />
                            <div className="absolute -bottom-5 -right-5 w-10 h-10 bg-purple" />
                            <div className="border-l-4 border-teal px-8 py-4">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark leading-tight">
                                    &ldquo;Modern platforms solve this by treating the split-fee
                                    relationship as a{" "}
                                    <span className="text-teal">first-class citizen.</span>{" "}
                                    Every interaction is tracked. Every contribution is visible.
                                    Every payment is tied to a verified outcome.&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-dark/40 mt-4">
                                    -- The Architecture Behind the Manifesto
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                9. CTA
            ═══════════════════════════════════════════════════════════════ */}
            <section className="cta-section py-28 bg-dark overflow-hidden relative">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[8%] left-[4%] w-24 h-24 rotate-12 bg-coral opacity-20" />
                    <div className="absolute top-[12%] right-[6%] w-20 h-20 rounded-full border-4 border-teal opacity-20" />
                    <div className="absolute bottom-[18%] left-[8%] w-16 h-16 rounded-full bg-yellow opacity-20" />
                    <div className="absolute bottom-[8%] right-[12%] w-28 h-10 -rotate-6 bg-purple opacity-20" />
                    <svg className="absolute bottom-[28%] left-[30%] opacity-15" width="120" height="30" viewBox="0 0 120 30">
                        <polyline points="0,25 15,5 30,25 45,5 60,25 75,5 90,25 105,5 120,25" fill="none" className="stroke-yellow" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-14 max-w-4xl mx-auto opacity-0">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                            The Infrastructure Is{" "}
                            <span className="text-coral">Live.</span>
                            <br />
                            The Manifesto Is{" "}
                            <span className="text-teal">Written.</span>
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                            The question is not whether recruiting infrastructure will
                            replace the old way. It already has. The only question is
                            whether you are on it.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/join"
                            className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie" />
                            Join as Recruiter
                        </Link>
                        <Link
                            href="/join"
                            className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-building" />
                            Post a Role
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                        {[
                            { icon: "fa-duotone fa-regular fa-user-tie", title: "Recruiters", desc: "Browse roles. Submit candidates. Collect your split. Every term locked before you start.", accent: "teal", href: "/join" },
                            { icon: "fa-duotone fa-regular fa-building", title: "Companies", desc: "Post roles. Tap the network. Pay on placement only. One platform, zero vendor chaos.", accent: "coral", href: "/join" },
                            { icon: "fa-duotone fa-regular fa-user", title: "Candidates", desc: "Get represented by recruiters who compete to find your best fit. Not just any fit.", accent: "yellow", href: "https://applicant.network" },
                        ].map((card, index) => (
                            <Link key={index} href={card.href} className="cta-card border-4 border-white/10 bg-white/5 p-6 text-center transition-colors hover:bg-white/10 opacity-0">
                                <div className={`w-12 h-12 ${ACCENT[card.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-4`}>
                                    <i className={`${card.icon} ${card.accent === "teal" || card.accent === "yellow" ? "text-dark" : "text-white"}`} />
                                </div>
                                <h3 className="font-black text-base uppercase tracking-wider text-white mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-base text-white/50">{card.desc}</p>
                            </Link>
                        ))}
                    </div>

                    <p className="text-center text-sm max-w-xl mx-auto text-white/30 uppercase tracking-wider font-bold">
                        The manifesto is not a promise. It is a description of what already
                        exists. Join the recruiters and companies running transparent split
                        placements today.
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                    <div className="flex-1 bg-purple" />
                </div>
            </section>
        </LandingOneAnimator>
    );
}
