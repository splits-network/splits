import Link from "next/link";
import type { Metadata } from "next";
import { LandingThreeAnimator } from "./landing-three-animator";

export const metadata: Metadata = {
    title: "A Recruiter's First Split | Splits Network",
    description:
        "Follow Sarah Chen through her first split-fee placement on Splits Network. From discovering the role to collecting $22,500 -- every step tracked, every dollar visible.",
};

// ── Data ────────────────────────────────────────────────────────────────────

const ACCENT = {
    coral: { bg: "bg-coral", text: "text-coral", border: "border-coral" },
    teal: { bg: "bg-teal", text: "text-teal", border: "border-teal" },
    yellow: { bg: "bg-yellow", text: "text-yellow", border: "border-yellow" },
    purple: { bg: "bg-purple", text: "text-purple", border: "border-purple" },
} as const;

const storyStats = [
    { value: "$22,500", label: "Sarah's Payout", accent: "coral" as const },
    { value: "18", label: "Days to Placement", accent: "teal" as const },
    { value: "100%", label: "Terms Visible Upfront", accent: "yellow" as const },
    { value: "0", label: "Surprises", accent: "purple" as const },
];

const pipelineStages = [
    { stage: "Submitted", date: "Day 1", detail: "Resume and profile sent to Meridian Tech", accent: "coral" as const },
    { stage: "Screening", date: "Day 3", detail: "Phone screen scheduled with hiring manager", accent: "teal" as const },
    { stage: "Interview", date: "Day 8", detail: "Technical panel -- 4 interviewers, 90 minutes", accent: "yellow" as const },
    { stage: "Final Round", date: "Day 12", detail: "VP of Engineering conversation. Culture fit.", accent: "purple" as const },
    { stage: "Offer Extended", date: "Day 15", detail: "$155K base + equity. Marcus reviews.", accent: "coral" as const },
    { stage: "Placed", date: "Day 18", detail: "Offer accepted. Start date confirmed.", accent: "teal" as const },
];

const systemMetrics = [
    { value: "2.4x", label: "Faster Placements", description: "Shared pipelines and real-time updates cut placement timelines by more than half compared to traditional split deals.", accent: "coral" as const },
    { value: "100%", label: "Fee Visibility", description: "Every split is visible to every party. Before, during, and after the deal closes. No retroactive adjustments.", accent: "teal" as const },
    { value: "0", label: "Payment Disputes", description: "Terms are locked at submission. The platform calculates every payout automatically. Nothing to argue about.", accent: "yellow" as const },
    { value: "73%", label: "Recruiters Want This", description: "Nearly three-quarters of independent recruiters say they need collaborative infrastructure for split-fee placements.", accent: "purple" as const },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingThreeMemphisPage() {
    return (
        <LandingThreeAnimator>
            {/* ═══════════════════════════════════════════════════════════════
                HERO -- THE SCENE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[100vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis geometric decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[6%] left-[3%] w-32 h-32 rounded-full border-[6px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[60%] right-[5%] w-24 h-24 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute top-[15%] right-[10%] w-20 h-20 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[20%] left-[8%] w-16 h-16 rotate-45 bg-yellow opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[25%] w-28 h-10 -rotate-6 border-4 border-coral opacity-0" />
                    {/* Dot grid */}
                    <div className="memphis-shape absolute top-[10%] right-[30%] opacity-0">
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={`hero-dot-${i}`} className="w-1.5 h-1.5 rounded-full bg-yellow" />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute bottom-[12%] right-[40%] opacity-0" width="120" height="35" viewBox="0 0 120 35">
                        <polyline points="0,28 15,7 30,28 45,7 60,28 75,7 90,28 105,7 120,28" fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[70%] left-[30%] opacity-0" width="44" height="44" viewBox="0 0 44 44">
                        <line x1="22" y1="5" x2="22" y2="39" className="stroke-teal" strokeWidth="4" strokeLinecap="round" />
                        <line x1="5" y1="22" x2="39" y2="22" className="stroke-teal" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-5xl mx-auto">
                        {/* Time stamp -- cinematic opening */}
                        <div className="hero-label flex items-center gap-3 mb-10 opacity-0">
                            <div className="w-3 h-3 bg-coral" />
                            <span className="text-sm font-black uppercase tracking-[0.25em] text-white/40">
                                A Recruiter&apos;s Story
                            </span>
                            <div className="flex-1 h-[2px] bg-white/10" />
                        </div>

                        <h1 className="hero-headline text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.92] mb-8 text-white uppercase tracking-tight opacity-0">
                            It&apos;s 6:47 AM.
                            <br />
                            <span className="text-coral">Your Phone Buzzes.</span>
                        </h1>

                        <div className="hero-sub max-w-3xl opacity-0">
                            <p className="text-xl md:text-2xl mb-6 leading-relaxed text-white/70">
                                A role just dropped. Senior React Developer. $150K base.
                                20% placement fee. 75/25 split. The terms are locked. The
                                pipeline is live. And you have a candidate who is perfect
                                for it.
                            </p>
                            <p className="text-xl md:text-2xl mb-14 leading-relaxed text-white/50">
                                This is not a hypothetical. This is Tuesday morning for
                                recruiters on Splits Network.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/join"
                                className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-book-open" />
                                Read the Story
                            </Link>
                            <Link
                                href="/join"
                                className="hero-cta inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1 opacity-0"
                            >
                                <i className="fa-duotone fa-regular fa-pen-nib" />
                                Write Your Own
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4-color accent bar */}
                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                    <div className="flex-1 bg-purple" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CHAPTER 1 -- THE OLD WAY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Chapter marker */}
                        <div className="chapter-marker flex items-start gap-6 mb-12 opacity-0">
                            <div className="flex-shrink-0 w-24 h-24 bg-coral border-4 border-dark flex flex-col items-center justify-center">
                                <span className="text-xs font-black uppercase tracking-wider text-white/70">CH</span>
                                <span className="text-4xl font-black text-white leading-none">01</span>
                            </div>
                            <div className="pt-2">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark mb-2">
                                    The <span className="text-coral">Old Way</span>
                                </h2>
                                <p className="text-base font-bold uppercase tracking-wider text-dark/40">
                                    Before the platform. Before the infrastructure.
                                </p>
                            </div>
                        </div>

                        {/* The story */}
                        <div className="story-block space-y-6 text-lg leading-relaxed text-dark/80 max-w-3xl opacity-0">
                            <p>
                                Sarah Chen had been recruiting for nine years. Independent.
                                Specialized in full-stack engineering talent in the Pacific
                                Northwest. Good at it, too. Her clients trusted her. Her
                                candidates called her back.
                            </p>
                            <p>
                                But split-fee deals were a different animal. She remembers
                                the one that almost made her quit.
                            </p>
                        </div>

                        {/* The bad deal -- visual callout */}
                        <div className="story-block border-4 border-coral bg-white p-8 my-8 opacity-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-coral flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-white" />
                                </div>
                                <span className="font-black text-base uppercase tracking-wider text-coral">
                                    The Deal That Broke
                                </span>
                            </div>
                            <p className="text-base leading-relaxed text-dark/70 mb-4">
                                A handshake agreement with a staffing firm in Denver.
                                They had the client. She had the candidate. &ldquo;75/25
                                split, standard terms.&rdquo; No contract. No tracking.
                                Just an email thread and a phone call.
                            </p>
                            <p className="text-base leading-relaxed text-dark/70 mb-4">
                                Her candidate got hired. $140K base. $28,000 placement
                                fee. Sarah&apos;s share should have been $21,000.
                            </p>
                            <p className="text-base leading-relaxed text-dark/70">
                                The check that arrived three months later was for
                                $14,000. The explanation was vague. &ldquo;Processing
                                fees. Client adjustment. Standard deductions.&rdquo; No
                                documentation. No recourse. Seven thousand dollars gone
                                into a black hole she could not audit.
                            </p>
                        </div>

                        <div className="story-block max-w-3xl opacity-0">
                            <p className="text-lg leading-relaxed text-dark/80">
                                Sarah is not an outlier. She is the norm. 68% of split-fee
                                deals operate without written terms. Half of all split
                                payments arrive late. And when disputes happen, the smaller
                                recruiter loses. Every time.
                            </p>
                        </div>

                        {/* Quick stats on the problem */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                            {[
                                { value: "68%", label: "No written terms", accent: "coral" as const },
                                { value: "52", label: "Days avg payment delay", accent: "coral" as const },
                                { value: "41%", label: "Recruiters hoard roles", accent: "coral" as const },
                                { value: "$7K", label: "Sarah's missing money", accent: "coral" as const },
                            ].map((stat, i) => (
                                <div key={i} className="stat-block border-4 border-dark bg-white p-4 text-center opacity-0">
                                    <div className={`text-3xl font-black mb-1 ${ACCENT[stat.accent].text}`}>{stat.value}</div>
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PULL QUOTE -- THE TURNING POINT
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto text-center opacity-0">
                        <div className="relative inline-block">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-teal" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-coral" />
                            <div className="border-l-4 border-teal px-8 py-6">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;Sarah did not need a better network. She
                                    needed{" "}
                                    <span className="text-teal">infrastructure</span>{" "}
                                    that made the network{" "}
                                    <span className="text-coral">trustworthy.</span>&rdquo;
                                </p>
                                <p className="text-sm font-bold uppercase tracking-wider text-white/40 mt-6">
                                    The insight that changed everything
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CHAPTER 2 -- THE DISCOVERY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="chapter-marker flex items-start gap-6 mb-12 opacity-0">
                            <div className="flex-shrink-0 w-24 h-24 bg-teal border-4 border-dark flex flex-col items-center justify-center">
                                <span className="text-xs font-black uppercase tracking-wider text-dark/70">CH</span>
                                <span className="text-4xl font-black text-dark leading-none">02</span>
                            </div>
                            <div className="pt-2">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark mb-2">
                                    The <span className="text-teal">Discovery</span>
                                </h2>
                                <p className="text-base font-bold uppercase tracking-wider text-dark/40">
                                    Sarah finds Splits Network. The moment it clicks.
                                </p>
                            </div>
                        </div>

                        <div className="story-block space-y-6 text-lg leading-relaxed text-dark/80 max-w-3xl opacity-0">
                            <p>
                                Three months after the Denver disaster, a recruiter in
                                Sarah&apos;s LinkedIn group posted about a platform
                                she had never heard of. &ldquo;Made my first split
                                placement in 14 days. Every dollar tracked. No
                                arguments.&rdquo;
                            </p>
                            <p>
                                Sarah signed up on a Tuesday afternoon. The onboarding
                                took eleven minutes.
                            </p>
                        </div>

                        {/* Dashboard mockup */}
                        <div className="story-block mt-12 border-4 border-dark bg-cream p-6 opacity-0">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b-4 border-dark/10">
                                <div className="w-3 h-3 rounded-full bg-coral" />
                                <div className="w-3 h-3 rounded-full bg-yellow" />
                                <div className="w-3 h-3 rounded-full bg-teal" />
                                <span className="ml-3 text-xs font-mono text-dark/40">splits.network/dashboard</span>
                            </div>

                            <div className="mb-6">
                                <div className="text-sm text-dark/40 uppercase tracking-wider font-bold mb-1">Welcome back</div>
                                <div className="font-black text-2xl text-dark">Sarah Chen</div>
                                <div className="text-base text-dark/60">Full-Stack Engineering | Pacific Northwest</div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                <div className="border-4 border-teal bg-white p-4 text-center">
                                    <div className="text-3xl font-black text-teal">12</div>
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">Matched Roles</div>
                                </div>
                                <div className="border-4 border-coral bg-white p-4 text-center">
                                    <div className="text-3xl font-black text-coral">$0</div>
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">Pipeline Value</div>
                                </div>
                                <div className="border-4 border-yellow bg-white p-4 text-center">
                                    <div className="text-3xl font-black text-yellow">0</div>
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">Active Placements</div>
                                </div>
                            </div>

                            {/* Matching roles */}
                            <div className="border-4 border-dark/10 bg-white p-4">
                                <div className="text-sm font-black uppercase tracking-wider text-dark/50 mb-3">Roles Matching Your Specialization</div>
                                {[
                                    { title: "Senior React Developer", company: "Meridian Tech", salary: "$150K", fee: "20%", split: "75/25", payout: "$22,500", accent: "teal" as const },
                                    { title: "Staff Engineer", company: "Cascade Systems", salary: "$180K", fee: "18%", split: "75/25", payout: "$24,300", accent: "coral" as const },
                                    { title: "Frontend Lead", company: "Basecamp Digital", salary: "$165K", fee: "22%", split: "75/25", payout: "$27,225", accent: "yellow" as const },
                                ].map((role, i) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-3 border-b-4 border-dark/5 last:border-b-0 gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-10 ${ACCENT[role.accent].bg}`} />
                                            <div>
                                                <div className="font-bold text-base text-dark">{role.title}</div>
                                                <div className="text-sm text-dark/50">{role.company} | {role.salary} | {role.fee} fee | {role.split} split</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg font-black ${ACCENT[role.accent].text}`}>{role.payout}</span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-dark/40">Your Share</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="story-block mt-10 max-w-3xl opacity-0">
                            <p className="text-lg leading-relaxed text-dark/80">
                                Sarah stared at the screen. Every role showed the
                                placement fee, the split percentage, and her exact
                                payout -- calculated before she submitted a single
                                resume. No negotiation required. No phone calls to
                                &ldquo;discuss terms.&rdquo; The math was public.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CHAPTER 3 -- THE MATCH
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-cream overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="chapter-marker flex items-start gap-6 mb-12 opacity-0">
                            <div className="flex-shrink-0 w-24 h-24 bg-yellow border-4 border-dark flex flex-col items-center justify-center">
                                <span className="text-xs font-black uppercase tracking-wider text-dark/70">CH</span>
                                <span className="text-4xl font-black text-dark leading-none">03</span>
                            </div>
                            <div className="pt-2">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark mb-2">
                                    The <span className="text-yellow">Match</span>
                                </h2>
                                <p className="text-base font-bold uppercase tracking-wider text-dark/40">
                                    The right candidate for the right role. No ambiguity.
                                </p>
                            </div>
                        </div>

                        <div className="story-block space-y-6 text-lg leading-relaxed text-dark/80 max-w-3xl opacity-0">
                            <p>
                                Sarah thought about the role for exactly four minutes.
                                Then she thought about Marcus Williams.
                            </p>
                            <p>
                                Marcus was a senior React developer with six years of
                                experience, a track record at two well-known startups,
                                and an itch for something more stable. He had been in
                                Sarah&apos;s network for two years.
                            </p>
                            <p>She also knew he would crush the Meridian Tech interview.</p>
                        </div>

                        {/* Role + Candidate cards */}
                        <div className="story-block mt-12 grid md:grid-cols-2 gap-6 opacity-0">
                            <div className="border-4 border-dark bg-white p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 bg-teal flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-briefcase text-dark" />
                                    </div>
                                    <span className="font-black text-base uppercase tracking-wider text-dark">The Role</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: "Title", value: "Senior React Developer" },
                                        { label: "Company", value: "Meridian Tech" },
                                        { label: "Salary", value: "$150,000" },
                                        { label: "Placement Fee", value: "20% ($30,000)" },
                                        { label: "Split", value: "75 / 25" },
                                        { label: "Your Payout", value: "$22,500" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center border-b-4 border-dark/5 pb-2 last:border-b-0">
                                            <span className="text-sm font-bold uppercase tracking-wider text-dark/50">{item.label}</span>
                                            <span className="font-black text-base text-dark">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t-4 border-teal">
                                    <p className="text-sm font-bold uppercase tracking-wider text-teal">
                                        <i className="fa-duotone fa-regular fa-lock mr-2" />
                                        Terms locked at submission
                                    </p>
                                </div>
                            </div>

                            <div className="border-4 border-dark bg-white p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 bg-coral flex items-center justify-center">
                                        <i className="fa-duotone fa-regular fa-user text-white" />
                                    </div>
                                    <span className="font-black text-base uppercase tracking-wider text-dark">The Candidate</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: "Name", value: "Marcus Williams" },
                                        { label: "Experience", value: "6 Years" },
                                        { label: "Specialization", value: "React / TypeScript" },
                                        { label: "Current", value: "Senior Dev @ StartupCo" },
                                        { label: "Target Salary", value: "$145K - $160K" },
                                        { label: "Status", value: "Open to Opportunities" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center border-b-4 border-dark/5 pb-2 last:border-b-0">
                                            <span className="text-sm font-bold uppercase tracking-wider text-dark/50">{item.label}</span>
                                            <span className="font-black text-base text-dark">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t-4 border-coral">
                                    <p className="text-sm font-bold uppercase tracking-wider text-coral">
                                        <i className="fa-duotone fa-regular fa-bullseye-arrow mr-2" />
                                        92% role fit score
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="story-block mt-10 max-w-3xl opacity-0">
                            <p className="text-lg leading-relaxed text-dark/80">
                                Sarah submitted Marcus to the Meridian Tech role at
                                9:14 AM on a Wednesday. The platform confirmed the
                                submission, locked the split terms, and started the clock.
                            </p>
                            <p className="text-lg leading-relaxed text-dark/80 mt-6 font-bold">
                                No handshakes. No email threads. No faith-based accounting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PULL QUOTE -- TRANSPARENCY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-dark py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="pullquote max-w-4xl mx-auto text-center opacity-0">
                        <div className="relative inline-block">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-purple" />
                            <div className="border-l-4 border-yellow px-8 py-6">
                                <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                                    &ldquo;The moment Sarah submitted Marcus, every
                                    party saw the same numbers. The same terms. The
                                    same <span className="text-yellow">outcome.</span>{" "}
                                    That is not trust. That is{" "}
                                    <span className="text-teal">architecture.</span>&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CHAPTER 4 -- THE PIPELINE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="pipeline-section py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="chapter-marker flex items-start gap-6 mb-12 opacity-0">
                            <div className="flex-shrink-0 w-24 h-24 bg-purple border-4 border-dark flex flex-col items-center justify-center">
                                <span className="text-xs font-black uppercase tracking-wider text-white/70">CH</span>
                                <span className="text-4xl font-black text-white leading-none">04</span>
                            </div>
                            <div className="pt-2">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark mb-2">
                                    The <span className="text-purple">Pipeline</span>
                                </h2>
                                <p className="text-base font-bold uppercase tracking-wider text-dark/40">
                                    Every stage visible. Every update in real time.
                                </p>
                            </div>
                        </div>

                        <div className="story-block space-y-6 text-lg leading-relaxed text-dark/80 max-w-3xl opacity-0">
                            <p>
                                In the old world, this is where candidates disappear.
                                The resume goes in. Silence comes out. Days become weeks.
                            </p>
                            <p>Sarah did not chase anyone. She watched.</p>
                        </div>

                        {/* Pipeline visualization */}
                        <div className="mt-12 border-4 border-dark bg-cream p-6">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b-4 border-dark/10">
                                <div className="w-3 h-3 rounded-full bg-coral" />
                                <div className="w-3 h-3 rounded-full bg-yellow" />
                                <div className="w-3 h-3 rounded-full bg-teal" />
                                <span className="ml-3 text-xs font-mono text-dark/40">splits.network/pipeline/meridian-tech</span>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="font-black text-lg text-dark">Marcus Williams</div>
                                    <div className="text-base text-dark/60">Senior React Developer at Meridian Tech</div>
                                </div>
                                <div className="px-4 py-2 bg-teal text-dark font-black text-sm uppercase tracking-wider border-4 border-dark">Placed</div>
                            </div>

                            <div className="space-y-0">
                                {pipelineStages.map((stage, i) => (
                                    <div key={i} className="pipeline-stage flex items-stretch gap-4 opacity-0">
                                        <div className="flex flex-col items-center w-8 flex-shrink-0">
                                            <div className={`w-4 h-4 ${ACCENT[stage.accent].bg} border-4 border-dark flex-shrink-0`} />
                                            {i < pipelineStages.length - 1 && <div className="w-1 flex-1 bg-dark/20" />}
                                        </div>
                                        <div className="pb-6 flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                <span className="font-black text-base uppercase tracking-wide text-dark">{stage.stage}</span>
                                                <span className={`text-sm font-bold ${ACCENT[stage.accent].text}`}>{stage.date}</span>
                                            </div>
                                            <p className="text-base text-dark/60 mt-1">{stage.detail}</p>
                                        </div>
                                        <div className="flex-shrink-0 flex items-start pt-0">
                                            <div className="w-6 h-6 bg-teal flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-check text-dark text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CHAPTER 5 -- THE CLOSE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-dark overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="chapter-marker flex items-start gap-6 mb-12 opacity-0">
                            <div className="flex-shrink-0 w-24 h-24 bg-teal border-4 border-white/20 flex flex-col items-center justify-center">
                                <span className="text-xs font-black uppercase tracking-wider text-dark/70">CH</span>
                                <span className="text-4xl font-black text-dark leading-none">05</span>
                            </div>
                            <div className="pt-2">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
                                    The <span className="text-teal">Close</span>
                                </h2>
                                <p className="text-base font-bold uppercase tracking-wider text-white/40">
                                    The offer. The acceptance. The payout.
                                </p>
                            </div>
                        </div>

                        <div className="story-block space-y-6 text-lg leading-relaxed text-white/70 max-w-3xl opacity-0">
                            <p>Day 15. Sarah&apos;s phone buzzed at 2:38 PM.</p>
                            <p className="text-2xl font-black text-white uppercase tracking-tight">
                                &ldquo;Offer extended to Marcus Williams. $155K base + equity package. Review in your dashboard.&rdquo;
                            </p>
                        </div>

                        {/* The payout card */}
                        <div className="story-block mt-12 border-4 border-teal bg-white/5 p-8 md:p-10 opacity-0">
                            <div className="text-center">
                                <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
                                    Placement Confirmed -- Your Payout
                                </div>
                                <div className="text-7xl md:text-8xl font-black text-teal mb-4">$22,500</div>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-6">
                                    {[
                                        { label: "Placement Fee", value: "$30,000", sublabel: "20% of $150K" },
                                        { label: "Your Split", value: "75%", sublabel: "Locked at submission" },
                                        { label: "Platform", value: "25%", sublabel: "Transparent share" },
                                    ].map((item, i) => (
                                        <div key={i} className="text-center">
                                            <div className="text-2xl font-black text-white">{item.value}</div>
                                            <div className="text-sm font-bold uppercase tracking-wider text-white/50">{item.label}</div>
                                            <div className="text-xs text-white/30 mt-1">{item.sublabel}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t-4 border-white/10">
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { icon: "fa-duotone fa-regular fa-file-check", title: "Placement Verified", detail: "Marcus started. Confirmed by Meridian.", accent: "coral" as const },
                                        { icon: "fa-duotone fa-regular fa-calculator", title: "Fee Calculated", detail: "$30K fee. $22.5K to Sarah. Automatic.", accent: "yellow" as const },
                                        { icon: "fa-duotone fa-regular fa-money-bill-transfer", title: "Payout Processed", detail: "$22,500 deposited. On schedule.", accent: "teal" as const },
                                    ].map((step, i) => (
                                        <div key={i} className="border-4 border-white/10 bg-white/5 p-4 text-center">
                                            <div className={`w-10 h-10 ${ACCENT[step.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-3`}>
                                                <i className={`${step.icon} ${step.accent === "teal" || step.accent === "yellow" ? "text-dark" : "text-white"} text-sm`} />
                                            </div>
                                            <div className="font-black text-base uppercase tracking-wide text-white mb-1">{step.title}</div>
                                            <p className="text-base text-white/50">{step.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* The contrast */}
                        <div className="story-block mt-12 grid md:grid-cols-2 gap-6 opacity-0">
                            <div className="border-4 border-coral bg-coral/10 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 bg-coral" />
                                    <span className="font-black text-base uppercase tracking-wider text-coral">The Denver Deal</span>
                                </div>
                                <div className="space-y-2 text-base text-white/60">
                                    <p>Handshake terms. No documentation.</p>
                                    <p>Three-month payment delay.</p>
                                    <p>$7,000 vanished in &ldquo;deductions.&rdquo;</p>
                                    <p className="font-bold text-coral">Final payout: $14,000</p>
                                </div>
                            </div>
                            <div className="border-4 border-teal bg-teal/10 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 bg-teal" />
                                    <span className="font-black text-base uppercase tracking-wider text-teal">The Meridian Deal</span>
                                </div>
                                <div className="space-y-2 text-base text-white/60">
                                    <p>Terms locked before submission.</p>
                                    <p>Every stage tracked in real time.</p>
                                    <p>Every dollar calculated automatically.</p>
                                    <p className="font-bold text-teal">Final payout: $22,500</p>
                                </div>
                            </div>
                        </div>

                        <div className="story-block mt-10 max-w-3xl opacity-0">
                            <p className="text-lg leading-relaxed text-white/70">
                                Sarah sat at her desk and looked at the deposit
                                notification. $22,500. Exactly what the platform said
                                it would be on the morning she submitted Marcus.
                            </p>
                            <p className="text-xl leading-relaxed text-white font-black mt-6">That world is over.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                STATS BAR
            ═══════════════════════════════════════════════════════════════ */}
            <section className="stats-section bg-cream py-6 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        {storyStats.map((stat, i) => (
                            <div key={i} className="stat-block border-4 border-dark bg-white p-6 text-center opacity-0">
                                <div className={`text-3xl md:text-4xl font-black mb-1 ${ACCENT[stat.accent].text}`}>{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-wider text-dark/50">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SYSTEM METRICS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="metrics-section py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="metrics-heading text-center mb-16 max-w-3xl mx-auto opacity-0">
                        <span className="inline-block px-4 py-1 text-sm font-black uppercase tracking-[0.2em] bg-purple text-white mb-6">
                            The Bigger Picture
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-dark">
                            Sarah&apos;s Story Is{" "}
                            <span className="text-purple">Not Unique.</span>
                            <br />
                            The Platform Is.
                        </h2>
                        <p className="text-lg text-dark/70">
                            Every metric here is a design decision, not a marketing
                            claim. The platform was built to produce these outcomes
                            for every recruiter, on every deal.
                        </p>
                    </div>

                    <div className="metrics-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {systemMetrics.map((metric, i) => (
                            <div key={i} className="metric-card relative border-4 border-dark bg-cream p-8 text-center opacity-0">
                                <div className={`absolute top-0 left-0 right-0 h-2 ${ACCENT[metric.accent].bg}`} />
                                <div className={`absolute bottom-0 right-0 w-8 h-8 ${ACCENT[metric.accent].bg}`} />
                                <div className={`text-5xl font-black mb-3 ${ACCENT[metric.accent].text}`}>{metric.value}</div>
                                <div className="font-black text-base uppercase tracking-wider text-dark mb-3">{metric.label}</div>
                                <p className="text-base text-dark/60 leading-relaxed">{metric.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FINAL CTA
            ═══════════════════════════════════════════════════════════════ */}
            <section className="cta-section py-28 bg-dark overflow-hidden relative">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[5%] w-20 h-20 rotate-12 bg-coral opacity-0" />
                    <div className="memphis-shape absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[20%] left-[10%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute bottom-[10%] right-[15%] w-24 h-8 -rotate-6 bg-purple opacity-0" />
                    <svg className="memphis-shape absolute bottom-[30%] left-[30%] opacity-0" width="100" height="30" viewBox="0 0 100 30">
                        <polyline points="0,25 12,5 24,25 36,5 48,25 60,5 72,25 84,5 100,25" fill="none" className="stroke-coral" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <svg className="memphis-shape absolute top-[35%] left-[60%] opacity-0" width="44" height="44" viewBox="0 0 44 44">
                        <line x1="22" y1="5" x2="22" y2="39" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                        <line x1="5" y1="22" x2="39" y2="22" className="stroke-purple" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div className="memphis-shape absolute top-[65%] right-[6%] opacity-0">
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={`cta-dot-${i}`} className="w-2 h-2 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="cta-content container mx-auto px-4 relative z-10 opacity-0">
                    <div className="text-center mb-14 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="w-3 h-3 bg-teal" />
                            <span className="text-sm font-black uppercase tracking-[0.25em] text-white/40">Your Turn</span>
                            <div className="w-3 h-3 bg-coral" />
                        </div>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[0.95] text-white">
                            Your Story <span className="text-teal">Starts</span>
                            <br />
                            With One <span className="text-coral">Placement.</span>
                        </h2>
                        <p className="text-xl text-white/60 mb-4 max-w-2xl mx-auto">
                            Every recruiter on this platform has a first placement
                            story. A role that matched. A candidate who fit. A payout
                            that arrived exactly when and how the platform said it would.
                        </p>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Sarah&apos;s story started with a Tuesday afternoon
                            sign-up. Yours starts now.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie" />
                            Join as Recruiter
                        </Link>
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black uppercase tracking-wider border-4 border-coral bg-coral text-white transition-transform hover:-translate-y-1"
                        >
                            <i className="fa-duotone fa-regular fa-building" />
                            Post a Role
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
                        {[
                            { icon: "fa-duotone fa-regular fa-user-tie", title: "Recruiters", desc: "Browse roles. Submit candidates. Watch every dollar tracked from submission to payout.", link: "/join", accent: "teal" as const },
                            { icon: "fa-duotone fa-regular fa-building", title: "Companies", desc: "Post one role. Activate dozens of specialized recruiters. Pay only when someone starts.", link: "/join", accent: "coral" as const },
                            { icon: "fa-duotone fa-regular fa-user", title: "Candidates", desc: "Get represented by recruiters competing to find you the right fit. Your career, amplified.", link: "https://applicant.network", accent: "yellow" as const },
                        ].map((card, i) => (
                            <Link
                                key={i}
                                href={card.link}
                                className="cta-card border-4 border-white/10 bg-white/5 p-6 text-center transition-colors hover:bg-white/10 opacity-0"
                            >
                                <div className={`w-12 h-12 ${ACCENT[card.accent].bg} border-4 border-dark flex items-center justify-center mx-auto mb-4`}>
                                    <i className={`${card.icon} ${card.accent === "teal" || card.accent === "yellow" ? "text-dark" : "text-white"}`} />
                                </div>
                                <h3 className="font-black text-base uppercase tracking-wider text-white mb-2">{card.title}</h3>
                                <p className="text-base text-white/50">{card.desc}</p>
                            </Link>
                        ))}
                    </div>

                    <p className="text-center text-sm max-w-xl mx-auto text-white/40 uppercase tracking-wider font-bold">
                        Join the recruiters and companies already building their placement stories on Splits Network.
                    </p>
                </div>

                {/* 4-color accent bar */}
                <div className="absolute bottom-0 left-0 right-0 flex h-2">
                    <div className="flex-1 bg-coral" />
                    <div className="flex-1 bg-teal" />
                    <div className="flex-1 bg-yellow" />
                    <div className="flex-1 bg-purple" />
                </div>
            </section>
        </LandingThreeAnimator>
    );
}
