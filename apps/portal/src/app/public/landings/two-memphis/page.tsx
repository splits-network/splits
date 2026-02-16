import Link from "next/link";
import type { Metadata } from "next";
import { LandingTwoAnimator } from "./landing-two-animator";

export const metadata: Metadata = {
    title: "The Recruiting Observatory | Splits Network",
    description:
        "Mission control for split-fee recruiting. Real-time pipeline visibility, automated fee distribution, and full-spectrum network intelligence. See everything. Miss nothing.",
};

// ── Data ────────────────────────────────────────────────────────────────────

const ACCENT: Record<string, { bg: string; text: string; border: string }> = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
};

const telemetryCards = [
    { value: "2,847", label: "ACTIVE RECRUITERS", delta: "+127 this month", icon: "fa-duotone fa-regular fa-user-tie", accent: "teal" },
    { value: "1,243", label: "OPEN ROLES", delta: "across 38 industries", icon: "fa-duotone fa-regular fa-briefcase", accent: "coral" },
    { value: "412", label: "PLACEMENTS THIS QUARTER", delta: "94% within 45 days", icon: "fa-duotone fa-regular fa-bullseye-arrow", accent: "yellow" },
    { value: "$8.7M", label: "FEE VOLUME PROCESSED", delta: "avg $21.1K per placement", icon: "fa-duotone fa-regular fa-money-bill-transfer", accent: "purple" },
] as const;

const painPoints = [
    { icon: "fa-duotone fa-regular fa-ghost", title: "GHOST PIPELINES", body: "You submit candidates. The company goes quiet. By the time they respond, your candidates took other offers. Forty hours wasted sourcing for a role that never moved.", accent: "coral" },
    { icon: "fa-duotone fa-regular fa-eye-slash", title: "ZERO VISIBILITY", body: "Where does your candidate stand? Is the role still open? Who else is submitting? Without infrastructure, you are flying blind on every deal.", accent: "coral" },
    { icon: "fa-duotone fa-regular fa-calculator", title: "MYSTERY MATH", body: "The 75/25 split you agreed to over the phone becomes 60/40 when the check arrives. No paper trail. No documentation. No recourse.", accent: "coral" },
] as const;

const features = [
    { icon: "fa-duotone fa-regular fa-bullseye-arrow", title: "CURATED ROLES, NOT COLD CALLS", body: "Every role has pre-agreed terms, a verified company, and a locked split percentage. Browse by specialization, geography, or fee range.", accent: "teal" },
    { icon: "fa-duotone fa-regular fa-money-check-dollar", title: "ECONOMICS YOU CAN SEE", body: "Know your exact payout before submitting a single resume. $150K role at 20% with a 75/25 split means $22,500 in your account.", accent: "teal" },
    { icon: "fa-duotone fa-regular fa-chart-simple", title: "ONE DASHBOARD, EVERY DEAL", body: "Track every candidate across every active split in one view. No spreadsheets. No email chains. Status updates flow in real time.", accent: "teal" },
    { icon: "fa-duotone fa-regular fa-rocket", title: "SCALE WITHOUT OVERHEAD", body: "The network provides the roles. You provide the talent. No office lease, no cold outreach campaigns, no admin staff. Just placements and revenue.", accent: "teal" },
    { icon: "fa-duotone fa-regular fa-shield-check", title: "PROTECTED SUBMISSIONS", body: "Every candidate submission is timestamped and attributed. If the company hires that candidate through any channel, the platform flags it.", accent: "teal" },
    { icon: "fa-duotone fa-regular fa-gauge-max", title: "2.4X FASTER PLACEMENTS", body: "Shared pipelines and real-time updates compress placement timelines. Multiple recruiters working a role means the right candidate surfaces faster.", accent: "teal" },
] as const;

const comparison = {
    old: [
        "Split terms negotiated over phone calls",
        "Candidate tracking scattered across email threads",
        "Payment timelines measured in months, not days",
        "Disputes resolved by whoever has the louder voice",
        "Pipeline visibility: ask and hope for an answer",
        "Recruiter contribution: invisible until invoice time",
    ],
    built: [
        "Split terms locked in the platform before work begins",
        "Every candidate tracked in one shared pipeline",
        "Payment distributed automatically at placement close",
        "Disputes prevented by timestamped attribution",
        "Pipeline visibility: real-time, always, for everyone",
        "Recruiter contribution: logged, measured, paid",
    ],
};

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingTwoMemphisPage() {
    return (
        <LandingTwoAnimator>
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO -- RECRUITER COMMAND CENTER
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[100vh] overflow-hidden flex items-center bg-dark">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[6%] left-[3%] w-40 h-40 rounded-full border-4 border-teal opacity-0" />
                    <div className="memphis-shape absolute top-[10%] right-[8%] w-20 h-20 rotate-12 bg-coral opacity-0" />
                    <div className="memphis-shape absolute top-[45%] left-[6%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] right-[5%] w-32 h-8 -rotate-6 bg-purple opacity-0" />
                    <div className="memphis-shape absolute top-[65%] left-[15%] w-16 h-16 rotate-45 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[8%] right-[30%] opacity-0">
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                    <svg className="memphis-shape absolute bottom-[10%] left-[25%] opacity-0" width="120" height="30" viewBox="0 0 120 30">
                        <polyline points="0,25 15,5 30,25 45,5 60,25 75,5 90,25 105,5 120,25" fill="none" className="stroke-yellow" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <svg className="memphis-shape absolute top-[55%] right-[20%] opacity-0" width="36" height="36" viewBox="0 0 36 36">
                        <line x1="18" y1="4" x2="18" y2="32" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                        <line x1="4" y1="18" x2="32" y2="18" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="hero-status inline-flex items-center gap-3 mb-10 opacity-0">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal" />
                            </span>
                            <span className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-teal">
                                NETWORK OPERATIONAL
                            </span>
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.92] mb-8 text-white uppercase tracking-tight opacity-0">
                            See Everything.
                            <br />
                            <span className="text-teal">Miss Nothing.</span>
                        </h1>

                        <p className="hero-sub text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/70 opacity-0">
                            Split-fee recruiting has operated in the dark for decades.
                            Candidates vanish. Payments drift. Pipelines go silent.
                            Splits Network is the command center that makes every
                            placement visible and every dollar trackable.
                        </p>

                        <div className="hero-terminal max-w-2xl mx-auto mb-12 border-4 border-white/10 bg-white/5 p-6 text-left font-mono opacity-0">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b-4 border-white/5">
                                <div className="w-3 h-3 rounded-full bg-coral" />
                                <div className="w-3 h-3 rounded-full bg-yellow" />
                                <div className="w-3 h-3 rounded-full bg-teal" />
                                <span className="ml-3 text-xs text-white/30 tracking-wider">splits.network/observatory</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-white/40"><span className="text-teal">$</span> network.status</p>
                                <p className="text-white/70"><span className="text-teal">&gt;</span> Active recruiters: <span className="text-teal font-bold">2,847</span></p>
                                <p className="text-white/70"><span className="text-coral">&gt;</span> Open roles: <span className="text-coral font-bold">1,243</span></p>
                                <p className="text-white/70"><span className="text-yellow">&gt;</span> Placements this quarter: <span className="text-yellow font-bold">412</span></p>
                                <p className="text-white/70"><span className="text-purple">&gt;</span> Fee volume processed: <span className="text-purple font-bold">$8.7M</span></p>
                                <p className="text-white/40 mt-3"><span className="text-teal">$</span> network.join --role=recruiter</p>
                                <p className="text-teal">&gt; Signal received. Deploying access...</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/join" className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0">
                                <i className="fa-duotone fa-regular fa-satellite-dish" />
                                Join the Network
                            </Link>
                            <Link href="/join" className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1 opacity-0">
                                <i className="fa-duotone fa-regular fa-building" />
                                Post a Role
                            </Link>
                        </div>
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
                2. LIVE TELEMETRY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="tel-section bg-cream py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="tel-heading text-center mb-12 opacity-0">
                        <span className="inline-flex items-center gap-2 px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-dark text-white mb-4">
                            <i className="fa-duotone fa-regular fa-wave-pulse" />
                            Live Network Telemetry
                        </span>
                        <p className="text-base text-dark/60 font-mono">Real-time indicators. Not marketing estimates.</p>
                    </div>

                    <div className="tel-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {telemetryCards.map((stat, index) => (
                            <div key={index} className="tel-card relative border-4 border-dark bg-white p-6 opacity-0">
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[stat.accent].bg}`} />
                                <div className="absolute top-4 right-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ACCENT[stat.accent].bg} opacity-75`} />
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${ACCENT[stat.accent].bg}`} />
                                    </span>
                                </div>
                                <div className={`w-12 h-12 ${ACCENT[stat.accent].bg} border-4 border-dark flex items-center justify-center mb-4`}>
                                    <i className={`${stat.icon} ${stat.accent === "teal" || stat.accent === "yellow" ? "text-dark" : "text-white"}`} />
                                </div>
                                <div className="text-xs font-mono font-bold uppercase tracking-wider text-dark/40 mb-1">{stat.label}</div>
                                <div className={`text-4xl font-black font-mono mb-1 ${ACCENT[stat.accent].text}`}>{stat.value}</div>
                                <div className="text-sm font-bold text-dark/50">{stat.delta}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                3. PULL QUOTE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="pullquote relative inline-block opacity-0">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-teal" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-coral" />
                            <div className="border-l-4 border-teal px-8 py-6">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;The recruiting industry doesn&apos;t have a
                                    talent problem. It has a{" "}
                                    <span className="text-teal">visibility</span>{" "}
                                    problem. Every failed placement traces back to the
                                    same root cause: someone couldn&apos;t see what was
                                    happening.&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-4">
                                    -- The Observatory Thesis
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                4. RECRUITER PAIN POINTS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="pain-section py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="pain-heading text-center mb-20 max-w-4xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-coral text-white mb-6">
                            The Problem
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            You Know These{" "}
                            <span className="text-coral">Pain Points.</span>
                        </h2>
                        <p className="text-lg text-dark/70 max-w-3xl mx-auto leading-relaxed">
                            Every independent recruiter running split-fee deals hits the
                            same walls. Not because they lack skill. Because they lack
                            infrastructure.
                        </p>
                    </div>

                    <div className="pain-grid grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {painPoints.map((item, index) => (
                            <div key={index} className="pain-card relative border-4 border-dark bg-white p-8 opacity-0">
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[item.accent].bg}`} />
                                <div className={`absolute top-0 right-0 w-12 h-12 ${ACCENT[item.accent].bg}`} />
                                <div className={`w-14 h-14 flex items-center justify-center mb-5 border-4 ${ACCENT[item.accent].border}`}>
                                    <i className={`${item.icon} text-2xl ${ACCENT[item.accent].text}`} />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-wide mb-4 text-dark">{item.title}</h3>
                                <p className="text-base leading-relaxed text-dark/70">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                5. FEATURE HIGHLIGHTS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="feat-section py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="feat-heading text-center mb-16 max-w-4xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-teal text-dark mb-6">
                            Built for Recruiters
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
                            Six Systems.{" "}
                            <span className="text-teal">All Operational.</span>
                        </h2>
                        <p className="text-lg text-white/60 max-w-2xl mx-auto">
                            Each panel represents a core system running inside Splits Network.
                            These are not features on a roadmap. They are infrastructure in production.
                        </p>
                    </div>

                    <div className="feat-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {features.map((feat, index) => (
                            <div key={index} className="feat-card relative border-4 border-white/10 bg-white/5 p-8 opacity-0">
                                <div className={`w-14 h-14 border-4 ${ACCENT[feat.accent].border} flex items-center justify-center mb-5`}>
                                    <i className={`${feat.icon} text-xl ${ACCENT[feat.accent].text}`} />
                                </div>
                                <h3 className="font-black text-base uppercase tracking-wider text-white mb-3">{feat.title}</h3>
                                <p className="text-base text-white/60 leading-relaxed">{feat.body}</p>
                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${ACCENT[feat.accent].bg}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                6. COMPARISON -- OLD VS NEW
            ═══════════════════════════════════════════════════════════════ */}
            <section className="comp-section py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="comp-heading text-center mb-16 max-w-4xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white mb-6">
                            The Comparison
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            The Old Way Is{" "}
                            <span className="text-coral line-through decoration-4">Familiar.</span>
                            <br />
                            It Is Also{" "}
                            <span className="text-purple">Broken.</span>
                        </h2>
                    </div>

                    <div className="comp-grid grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="comp-card border-4 border-dark bg-coral/5 p-8 opacity-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-coral border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-ban text-white text-lg" />
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide text-dark">The Old Way</h3>
                            </div>
                            <ul className="space-y-4">
                                {comparison.old.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-xmark text-white text-sm" />
                                        </div>
                                        <span className="text-base text-dark/70 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="comp-card border-4 border-dark bg-teal/5 p-8 opacity-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-teal border-4 border-dark flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-check text-dark text-lg" />
                                </div>
                                <h3 className="font-black text-xl uppercase tracking-wide text-dark">The Built Way</h3>
                            </div>
                            <ul className="space-y-4">
                                {comparison.built.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-check text-dark text-sm" />
                                        </div>
                                        <span className="text-base text-dark/70 leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                7. CTA
            ═══════════════════════════════════════════════════════════════ */}
            <section className="cta-section py-28 bg-dark overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[6%] left-[5%] w-24 h-24 rotate-12 bg-teal opacity-15" />
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-coral opacity-20" />
                    <div className="absolute bottom-[20%] left-[10%] w-12 h-12 rounded-full bg-yellow opacity-15" />
                    <div className="absolute bottom-[10%] right-[6%] w-28 h-8 -rotate-6 bg-purple opacity-15" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center mb-14 max-w-4xl mx-auto opacity-0">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                            The Network Is{" "}
                            <span className="text-teal">Live.</span>
                            <br />
                            Your Signal Is{" "}
                            <span className="text-coral">Expected.</span>
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            2,847 recruiters are sourcing. 1,243 roles are open. The infrastructure
                            is running. The only question is whether your placements are being tracked
                            or lost in someone&apos;s inbox.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                        <Link href="/join" className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1">
                            <i className="fa-duotone fa-regular fa-satellite-dish" />
                            Join the Network
                        </Link>
                        <Link href="/join" className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1">
                            <i className="fa-duotone fa-regular fa-building" />
                            Post a Role
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                        {[
                            { icon: "fa-duotone fa-regular fa-user-tie", title: "Recruiters", desc: "Browse roles. Submit candidates. Track your pipeline. Collect your split.", accent: "teal", href: "/join" },
                            { icon: "fa-duotone fa-regular fa-building", title: "Companies", desc: "Post roles with locked terms. The network does the sourcing. Pay on placement only.", accent: "coral", href: "/join" },
                            { icon: "fa-duotone fa-regular fa-user", title: "Candidates", desc: "Get represented by recruiters who compete to find your right fit.", accent: "yellow", href: "https://applicant.network" },
                        ].map((card, index) => (
                            <Link key={index} href={card.href} className="cta-card border-4 border-white/10 bg-white/5 p-6 text-center transition-colors hover:bg-white/10 opacity-0">
                                <div className={`w-12 h-12 ${ACCENT[card.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-4`}>
                                    <i className={`${card.icon} ${card.accent === "teal" || card.accent === "yellow" ? "text-dark" : "text-white"}`} />
                                </div>
                                <h3 className="font-black text-base uppercase tracking-wider text-white mb-2">{card.title}</h3>
                                <p className="text-base text-white/50">{card.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                    <div className="flex-1 bg-purple" />
                </div>
            </section>
        </LandingTwoAnimator>
    );
}
