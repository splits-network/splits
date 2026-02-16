import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { GettingStartedAnimator } from "./getting-started-animator";

export const metadata = getDocMetadata("getting-started");

const guides = [
    {
        href: "/public/documentation/getting-started/what-is-splits-network",
        icon: "fa-duotone fa-regular fa-circle-info",
        title: "What Is Splits Network",
        description:
            "Purpose, audience, and where Splits Network fits in a hiring workflow.",
        accent: "border-coral",
        iconBg: "bg-coral",
    },
    {
        href: "/public/documentation/getting-started/first-time-setup",
        icon: "fa-duotone fa-regular fa-gear",
        title: "First-Time Setup",
        description:
            "Account access, organization setup, and onboarding steps.",
        accent: "border-teal",
        iconBg: "bg-teal",
    },
    {
        href: "/public/documentation/getting-started/navigation-overview",
        icon: "fa-duotone fa-regular fa-compass",
        title: "Navigation Overview",
        description:
            "How to find roles, candidates, applications, and settings.",
        accent: "border-yellow",
        iconBg: "bg-yellow",
    },
];

export default function GettingStartedMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("getting-started")} id="docs-getting-started-jsonld" />
            <GettingStartedAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="getting-started-hero relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[8%] w-20 h-20 rounded-full border-[5px] border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[50%] right-[12%] w-16 h-16 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[20%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[25%] right-[25%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[25%] right-[35%] w-20 h-8 -rotate-6 border-[4px] border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[45%] left-[30%] w-8 h-8 rotate-45 bg-coral opacity-0" />
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[45%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                            <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20"
                                fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            <nav className="hero-breadcrumb mb-6 opacity-0">
                                <ul className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/50">
                                    <li>
                                        <Link href="/public/documentation" className="transition-colors hover:text-white">
                                            Documentation
                                        </Link>
                                    </li>
                                    <li className="before:content-['/'] before:mr-2 text-white">
                                        Getting Started
                                    </li>
                                </ul>
                            </nav>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                                Getting{" "}
                                <span className="text-coral">Started</span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-white/70 max-w-2xl opacity-0">
                                Start here if you are new to Splits Network or want a fast
                                refresher on how the platform works.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    GUIDE CARDS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="guide-cards-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="guide-cards-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Choose A Guide
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Pick Your{" "}
                                    <span className="text-teal">Starting Point</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {guides.map((guide, index) => (
                                    <Link
                                        key={index}
                                        href={guide.href}
                                        className={`guide-card relative border-4 ${guide.accent} bg-white transition-transform hover:-translate-y-1 opacity-0`}
                                    >
                                        {/* Top color stripe */}
                                        <div className={`h-2 ${guide.iconBg}`} />

                                        <div className="p-6">
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 ${guide.iconBg}`}>
                                                <i className={`${guide.icon} text-lg text-white`}></i>
                                            </div>

                                            <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-dark">
                                                {guide.title}
                                            </h3>

                                            <p className="text-sm leading-relaxed text-dark/70">
                                                {guide.description}
                                            </p>

                                            <div className="mt-6 pt-4 border-t-2 border-dark/10 flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-dark/40">
                                                    Read Guide
                                                </span>
                                                <i className="fa-duotone fa-regular fa-arrow-right text-sm text-dark/30"></i>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </GettingStartedAnimator>
        </>
    );
}
