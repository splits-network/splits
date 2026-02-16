import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { BlogAnimator } from "./blog-animator";

export const metadata: Metadata = {
    title: "Blog | Splits Network",
    description:
        "Recruiting insights, split-fee strategies, and industry analysis from the Splits Network editorial team. The knowledge base for modern collaborative recruiting.",
    ...buildCanonical("/public/blog-memphis"),
};

// ─── Blog post data ─────────────────────────────────────────────────────────

const categories = [
    { label: "All", active: true },
    { label: "Split Strategies", color: "bg-coral" },
    { label: "Industry Analysis", color: "bg-teal" },
    { label: "Product Updates", color: "bg-yellow" },
    { label: "Recruiter Playbook", color: "bg-purple" },
    { label: "Company Insights", color: "bg-coral" },
];

const featuredPost = {
    title: "The Split-Fee Playbook: How Top Recruiters Are Building Six-Figure Networks",
    excerpt:
        "The recruiters who are winning right now are not the ones with the biggest desks. They are the ones with the widest networks. We interviewed 40 top-performing split-fee recruiters to understand what separates consistent producers from everyone else. The answer was not what we expected.",
    category: "Split Strategies",
    categoryColor: "border-coral",
    accentColor: "bg-coral",
    date: "February 14, 2026",
    readTime: "14 min read",
};

const posts = [
    {
        title: "Why Your ATS Is Killing Your Split Deals",
        excerpt:
            "Most applicant tracking systems were built for single-firm workflows. When you try to bolt split-fee collaboration onto that foundation, everything breaks. Here is what the next generation of recruiting infrastructure looks like.",
        category: "Product Updates",
        categoryColor: "bg-yellow text-dark",
        accentColor: "bg-coral",
        date: "February 10, 2026",
        readTime: "8 min read",
    },
    {
        title: "The Data Behind Faster Fills: Split-Fee Placements By The Numbers",
        excerpt:
            "We analyzed 12,000 placements across our network. Split-fee roles filled 2.4x faster than single-recruiter roles. But the real story is in the candidate satisfaction scores.",
        category: "Industry Analysis",
        categoryColor: "bg-teal text-white",
        accentColor: "bg-teal",
        date: "February 6, 2026",
        readTime: "11 min read",
    },
    {
        title: "From Solo Recruiter To Network Operator: A Career Pivot Guide",
        excerpt:
            "The solo recruiting model is getting harder every year. The recruiters who are thriving have stopped thinking of themselves as individual contributors and started thinking like network operators.",
        category: "Recruiter Playbook",
        categoryColor: "bg-purple text-white",
        accentColor: "bg-yellow",
        date: "January 29, 2026",
        readTime: "9 min read",
    },
    {
        title: "Transparency Is Not A Feature. It Is The Entire Product.",
        excerpt:
            "Every recruiting platform claims to be transparent. Almost none of them are. We break down what real transparency looks like in split-fee recruiting and why it matters more than any feature on a roadmap.",
        category: "Industry Analysis",
        categoryColor: "bg-teal text-white",
        accentColor: "bg-purple",
        date: "January 22, 2026",
        readTime: "7 min read",
    },
    {
        title: "How Companies Should Evaluate External Recruiting Networks",
        excerpt:
            "Hiring companies are being pitched by recruiting networks every week. Most of those pitches sound identical. Here is a framework for evaluating which networks will actually deliver results.",
        category: "Company Insights",
        categoryColor: "bg-coral text-white",
        accentColor: "bg-coral",
        date: "January 15, 2026",
        readTime: "10 min read",
    },
    {
        title: "The Fee Split That Actually Works: Lessons From 5,000 Deals",
        excerpt:
            "50/50 is not always fair. 60/40 is not always better. We looked at thousands of completed split-fee arrangements to find the structures that produce the best outcomes for everyone involved.",
        category: "Split Strategies",
        categoryColor: "bg-coral text-white",
        accentColor: "bg-teal",
        date: "January 8, 2026",
        readTime: "12 min read",
    },
];

const ACCENT_CYCLE = ["border-coral", "border-teal", "border-yellow", "border-purple"];
const STRIPE_CYCLE = ["bg-coral", "bg-teal", "bg-yellow", "bg-purple"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BlogMemphisPage() {
    return (
        <BlogAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="blog-hero relative min-h-[60vh] overflow-hidden flex items-center bg-dark">
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
                            borderBottom: "43px solid",
                            borderBottomColor: "oklch(var(--color-yellow))",
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
                        <div className="hero-badge inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-pen-nib"></i>
                                Insights &amp; Updates
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            The Knowledge Base For{" "}
                            <span className="relative inline-block">
                                <span className="text-coral">Modern Recruiting</span>
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                            </span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed text-white/70 max-w-2xl mx-auto opacity-0">
                            Split-fee strategies, industry data, and hard-won lessons from the
                            recruiters and companies building the next era of collaborative hiring.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CATEGORY FILTER BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="category-filter-bar py-6 overflow-hidden bg-cream border-b-4 border-dark">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {categories.map((cat, i) => (
                            <button key={i}
                                className={`category-tag px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] border-4 transition-transform hover:-translate-y-0.5 opacity-0 ${
                                    cat.active
                                        ? "bg-dark text-white border-dark"
                                        : "bg-white text-dark border-dark/20 hover:border-dark"
                                }`}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FEATURED POST
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className={`featured-card relative p-8 md:p-12 border-4 ${featuredPost.categoryColor} bg-white opacity-0`}>
                            {/* Corner accent */}
                            <div className={`absolute top-0 right-0 w-12 h-12 ${featuredPost.accentColor}`} />

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className={`inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] ${featuredPost.accentColor} text-white`}>
                                    <i className="fa-duotone fa-regular fa-star"></i>
                                    Featured
                                </span>
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-2 border-dark/30 text-dark">
                                    {featuredPost.category}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-dark">
                                {featuredPost.title}
                            </h2>

                            <p className="text-base md:text-lg leading-relaxed mb-8 text-dark/75 max-w-3xl">
                                {featuredPost.excerpt}
                            </p>

                            <div className="flex flex-wrap items-center gap-6">
                                <span className="text-xs font-bold uppercase tracking-[0.15em] text-dark/50">
                                    <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                    {featuredPost.date}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-[0.15em] text-coral">
                                    <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                    {featuredPost.readTime}
                                </span>
                                <button className="ml-auto px-6 py-3 text-sm font-bold uppercase tracking-wider border-4 border-dark bg-dark text-white transition-transform hover:-translate-y-1">
                                    Read Article
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                POST GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="post-grid py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="post-grid-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Latest Articles
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                From The{" "}
                                <span className="text-teal">Editorial Desk</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, index) => (
                                <article key={index}
                                    className={`post-card relative border-4 ${ACCENT_CYCLE[index % 4]} bg-cream transition-transform hover:-translate-y-1 cursor-pointer opacity-0`}>
                                    {/* Top color stripe */}
                                    <div className={`h-2 ${STRIPE_CYCLE[index % 4]}`} />

                                    <div className="p-6">
                                        {/* Category badge */}
                                        <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] mb-4 ${post.categoryColor}`}>
                                            {post.category}
                                        </span>

                                        <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-dark">
                                            {post.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed mb-6 text-dark/70">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t-2 border-dark/10">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/40">
                                                {post.date}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-coral">
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
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
                            The recruiters who share knowledge freely build the networks
                            that produce consistently. Hoarding information is the old model.
                            Publishing it is the new one.
                        </p>
                        <div className="mt-6 pt-4 border-t-[3px] border-teal">
                            <span className="text-sm font-bold uppercase tracking-wider text-teal">
                                -- Splits Network Editorial
                            </span>
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                NEWSLETTER CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="newsletter-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="newsletter-content max-w-3xl mx-auto text-center opacity-0">
                        <div className="border-4 border-purple p-8 md:p-12 bg-white relative">
                            {/* Corner decorations */}
                            <div className="absolute top-0 left-0 w-10 h-10 bg-purple" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 bg-purple" />

                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-purple text-white">
                                <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                                Stay Current
                            </span>

                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-dark">
                                Get The{" "}
                                <span className="text-purple">Inside Track</span>
                            </h2>

                            <p className="text-base leading-relaxed mb-8 text-dark/70 max-w-xl mx-auto">
                                New articles, platform updates, and industry data delivered to your
                                inbox. No fluff. No spam. Just the information that moves the needle.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch gap-0 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 text-sm font-semibold border-4 border-dark bg-cream text-dark placeholder:text-dark/40 outline-none"
                                    style={{ border: "4px solid", borderColor: "oklch(var(--color-dark))" }}
                                />
                                <button className="px-6 py-3 text-sm font-bold uppercase tracking-wider border-4 border-dark bg-dark text-yellow transition-transform hover:-translate-y-0.5 whitespace-nowrap">
                                    Subscribe
                                </button>
                            </div>

                            <p className="text-[10px] font-bold uppercase tracking-wider mt-4 text-dark/30">
                                Unsubscribe anytime. We respect your inbox.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA — Standard 3-column
               ══════════════════════════════════════════════════════════════ */}
            <section className="blog-cta relative py-24 overflow-hidden bg-dark">
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
                            Join The Network
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-white">
                            Ready To See{" "}
                            <span className="text-coral">Split-Fee</span>{" "}
                            In Action?
                        </h2>
                        <p className="text-lg text-white/70 mb-10">
                            Splits Network powers the future of collaborative recruiting.
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
                            <p className="text-xs text-white/60 mb-5">
                                Access the split-fee marketplace
                            </p>
                            <a href="/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-center text-sm text-white transition-transform hover:-translate-y-1">
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
                            <p className="text-xs text-white/60 mb-5">
                                Post roles, find vetted talent
                            </p>
                            <a href="/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-yellow bg-yellow text-center text-sm text-dark transition-transform hover:-translate-y-1">
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
                            <p className="text-xs text-white/60 mb-5">
                                Free profile, real recruiters
                            </p>
                            <a href="https://applicant.network/sign-up"
                                className="block w-full py-3 font-bold uppercase tracking-wider border-4 border-teal bg-teal text-center text-sm text-dark transition-transform hover:-translate-y-1">
                                Create Profile
                            </a>
                        </div>
                    </div>

                    <div className="cta-footer text-center opacity-0">
                        <p className="text-sm text-white/50 mb-3">
                            Questions? We are here to help.
                        </p>
                        <a href="mailto:help@splits.network"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-yellow">
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            help@splits.network
                        </a>
                    </div>
                </div>
            </section>
        </BlogAnimator>
    );
}
