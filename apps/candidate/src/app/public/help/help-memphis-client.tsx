"use client";

import { useState } from "react";
import { HelpAnimator } from "./help-animator";

// Memphis accent cycling (coral → teal → yellow → purple)
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

interface HelpCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    count: number;
}

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSection {
    category: string;
    icon: string;
    items: FAQItem[];
}

const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: "fa-rocket",
        description: "New to Applicant Network? Start here.",
        count: 8,
    },
    {
        id: "account",
        title: "Account Management",
        icon: "fa-user-gear",
        description: "Profile settings, password, security.",
        count: 12,
    },
    {
        id: "job-search",
        title: "Job Search",
        icon: "fa-magnifying-glass",
        description: "Finding and filtering the right roles.",
        count: 15,
    },
    {
        id: "applications",
        title: "Applications",
        icon: "fa-file-lines",
        description: "Applying, tracking, and withdrawing.",
        count: 10,
    },
    {
        id: "technical",
        title: "Technical Support",
        icon: "fa-wrench",
        description: "Login issues, bugs, and errors.",
        count: 7,
    },
    {
        id: "privacy",
        title: "Privacy & Data",
        icon: "fa-shield-check",
        description: "How we protect your information.",
        count: 6,
    },
];

const FAQ_SECTIONS: FAQSection[] = [
    {
        category: "Getting Started",
        icon: "fa-rocket",
        items: [
            {
                question: "How do I create an account?",
                answer: 'Click "Sign Up" in the top right corner. You can register with email, Google, or LinkedIn. Account creation takes less than 2 minutes.',
            },
            {
                question: "Is Applicant Network free for candidates?",
                answer: "Yes! 100% free. Always. We earn revenue from recruiters who fill positions through our platform. Candidates never pay a fee.",
            },
            {
                question: "What makes this platform different?",
                answer: "We connect you with a network of specialized recruiters working on your behalf. One application = multiple advocates finding you opportunities.",
            },
            {
                question: "Do I need to upload a resume?",
                answer: "Not required, but highly recommended. A complete profile with resume increases your visibility by 10x. You can add it later if needed.",
            },
        ],
    },
    {
        category: "Account Management",
        icon: "fa-user-gear",
        items: [
            {
                question: "How do I reset my password?",
                answer: 'Click "Forgot password?" on the login page. Enter your email and we\'ll send a reset link. Check spam if you don\'t see it in 5 minutes.',
            },
            {
                question: "Can I change my email address?",
                answer: "Yes! Go to Settings → Account → Email. You'll need to verify your new email before the change takes effect.",
            },
            {
                question: "How do I delete my account?",
                answer: "Settings → Account → Danger Zone → Delete Account. This is permanent and cannot be undone. All applications and profile data will be removed.",
            },
            {
                question: "How do I make my profile private?",
                answer: "Settings → Privacy → Profile Visibility. Set to 'Only Me' to hide your profile from all recruiters. You can still apply to jobs directly.",
            },
        ],
    },
    {
        category: "Job Search",
        icon: "fa-magnifying-glass",
        items: [
            {
                question: "How do I search for jobs?",
                answer: "Browse Jobs → Use filters (location, salary, remote, role) → Click on a listing for details. Save jobs you like by clicking the bookmark icon.",
            },
            {
                question: "Can I set up job alerts?",
                answer: "Yes! Browse Jobs → Click 'Set Alert' → Choose your criteria. You'll get emails when matching jobs are posted (daily or weekly digest).",
            },
            {
                question: "What does 'Remote-Friendly' mean?",
                answer: "The company allows remote work but may require occasional office visits. 'Fully Remote' means 100% remote with no office requirement.",
            },
            {
                question: "Why can't I see the company name?",
                answer: "Some companies request confidential postings. Company details are revealed after you apply. This protects their hiring strategy.",
            },
        ],
    },
    {
        category: "Applications",
        icon: "fa-file-lines",
        items: [
            {
                question: "How do I apply to a job?",
                answer: "Open the job listing → Click 'Apply Now' → Fill out required fields → Submit. Your profile info auto-fills to save time.",
            },
            {
                question: "How many jobs can I apply to?",
                answer: "Unlimited! But quality over quantity. Tailor your application to each role. Recruiters can see generic mass applications.",
            },
            {
                question: "Can I withdraw an application?",
                answer: "Yes. My Applications → Find the job → Click 'Withdraw'. The recruiter will be notified. You can reapply later if you change your mind.",
            },
            {
                question: "Why haven't I heard back?",
                answer: "Hiring timelines vary (1-4 weeks typical). Recruiters review all applications. No response after 2 weeks usually means not selected this time.",
            },
        ],
    },
    {
        category: "Technical Support",
        icon: "fa-wrench",
        items: [
            {
                question: "I can't log in. What should I do?",
                answer: "First, try password reset. If that doesn't work, clear browser cache/cookies. Still stuck? Email help@applicant.network with your registered email.",
            },
            {
                question: "The site is loading slowly. Help?",
                answer: "Check your internet connection. Try a different browser. Clear cache. Check our status page at /public/status-memphis for known issues.",
            },
            {
                question: "I found a bug. How do I report it?",
                answer: "Email help@applicant.network with: (1) what you were doing, (2) what happened, (3) browser/device. Screenshots help! We investigate all reports.",
            },
        ],
    },
    {
        category: "Privacy & Data",
        icon: "fa-shield-check",
        items: [
            {
                question: "Who can see my profile?",
                answer: "By default: verified recruiters with active jobs matching your profile. You control visibility in Settings → Privacy. We never sell your data.",
            },
            {
                question: "How is my data protected?",
                answer: "Bank-level encryption, SOC 2 compliance, regular security audits. Your data is stored in secure US-based data centers. See our full Privacy Policy.",
            },
            {
                question: "Can I download my data?",
                answer: "Yes! Settings → Account → Export Data. You'll receive a ZIP file with all your profile info, applications, and messages within 24 hours.",
            },
        ],
    },
];

const HELP_RESOURCES = [
    {
        title: "Video Tutorials",
        description: "Watch step-by-step guides for common tasks.",
        icon: "fa-circle-play",
        href: "#",
        accent: "coral",
    },
    {
        title: "Blog & Guides",
        description: "Career advice, job search tips, industry insights.",
        icon: "fa-book",
        href: "/public/resources/career-guides",
        accent: "teal",
    },
    {
        title: "Contact Support",
        description: "Can't find your answer? We're here to help.",
        icon: "fa-message",
        href: "/public/contact-memphis",
        accent: "yellow",
    },
    {
        title: "System Status",
        description: "Check platform health and recent incidents.",
        icon: "fa-signal-bars",
        href: "/public/status-memphis",
        accent: "purple",
    },
];

export default function HelpMemphisClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    // Filter FAQ sections based on search or category
    const filteredSections = FAQ_SECTIONS.filter((section) => {
        if (selectedCategory && section.category !== selectedCategory) {
            return false;
        }
        if (searchQuery.trim() === "") return true;

        const query = searchQuery.toLowerCase();
        return (
            section.category.toLowerCase().includes(query) ||
            section.items.some(
                (item) =>
                    item.question.toLowerCase().includes(query) ||
                    item.answer.toLowerCase().includes(query)
            )
        );
    });

    return (
        <HelpAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="help-hero relative min-h-[40vh] overflow-hidden flex items-center bg-dark">
                {/* Subtle Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[50%] right-[8%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] left-[18%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[25%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[35%] right-[35%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-4 opacity-0">
                            <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark">
                                <i className="fa-duotone fa-regular fa-circle-question"></i>
                                Help Center
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0 text-white">
                            HERE'S HOW TO{" "}
                            <span className="text-coral">GET HELP</span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed opacity-0 text-white/70">
                            Quick answers to common questions. Can't find what
                            you need? Our support team responds fast.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SEARCH BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="help-search py-8 bg-cream border-b-4 border-dark/10">
                <div className="container mx-auto px-4">
                    <div className="help-search-bar max-w-2xl mx-auto opacity-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search help articles... (e.g., 'reset password', 'apply to job')"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 pr-14 bg-white border-2 border-dark/20 focus:border-dark outline-none text-base font-medium tracking-tight"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-dark/40 text-xl"></i>
                            </div>
                        </div>

                        {searchQuery && (
                            <div className="mt-3 flex items-center justify-between">
                                <p className="text-sm text-dark/60">
                                    {filteredSections.length > 0 ? (
                                        <>
                                            Found{" "}
                                            <span className="font-bold">
                                                {filteredSections.reduce(
                                                    (acc, s) =>
                                                        acc + s.items.length,
                                                    0
                                                )}
                                            </span>{" "}
                                            results
                                        </>
                                    ) : (
                                        "No results found. Try different keywords."
                                    )}
                                </p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-xs font-bold uppercase tracking-wider text-coral hover:text-dark transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HELP CATEGORIES
               ══════════════════════════════════════════════════════════════ */}
            {!searchQuery && (
                <section className="help-categories py-12 bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark text-center">
                                Browse by{" "}
                                <span className="text-purple">Category</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                            {HELP_CATEGORIES.map((category, idx) => {
                                const accent = accentAt(idx);
                                const borderClass = `border-${accent}`;
                                const bgClass = `bg-${accent}`;

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setSelectedCategory(
                                                selectedCategory ===
                                                    category.title
                                                    ? null
                                                    : category.title
                                            )
                                        }
                                        className={`category-card relative p-6 border-4 ${borderClass} bg-white opacity-0 text-left transition-transform hover:scale-[1.02] ${
                                            selectedCategory === category.title
                                                ? "ring-4 ring-dark ring-offset-2"
                                                : ""
                                        }`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 right-0 w-10 h-10 ${bgClass}`}
                                        />

                                        <i
                                            className={`fa-duotone fa-regular ${category.icon} text-3xl text-${accent} mb-3 block`}
                                        ></i>

                                        <h3 className="text-lg font-black uppercase tracking-wide text-dark mb-2">
                                            {category.title}
                                        </h3>

                                        <p className="text-sm text-dark/60 mb-3">
                                            {category.description}
                                        </p>

                                        <div className="text-xs font-bold uppercase tracking-wider text-dark/40">
                                            {category.count} Articles
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedCategory && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-sm font-bold uppercase tracking-wider text-coral hover:text-dark transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-rotate-left mr-2"></i>
                                    Show All Categories
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════════════════════════
                FAQ CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <section className="faq-content py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {filteredSections.length > 0 ? (
                            filteredSections.map((section, idx) => {
                                const accent = accentAt(idx);
                                const bgClass = `bg-${accent}`;

                                return (
                                    <div
                                        key={section.category}
                                        className="faq-section opacity-0"
                                    >
                                        {/* Section Header */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div
                                                className={`w-12 h-12 ${bgClass} flex items-center justify-center`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${section.icon} text-xl ${accent === "yellow" || accent === "teal" ? "text-dark" : "text-white"}`}
                                                ></i>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                                {section.category}
                                            </h2>
                                        </div>

                                        {/* FAQ Items */}
                                        <div className="space-y-4">
                                            {section.items.map((item, i) => (
                                                <details
                                                    key={i}
                                                    className="group border-2 border-dark/10 bg-cream"
                                                >
                                                    <summary className="cursor-pointer p-5 font-bold text-base uppercase tracking-wide text-dark flex items-center justify-between hover:bg-dark/5 transition-colors">
                                                        <span className="flex items-center gap-3">
                                                            <i className="fa-duotone fa-regular fa-circle-question text-dark/40"></i>
                                                            {item.question}
                                                        </span>
                                                        <i className="fa-duotone fa-regular fa-chevron-down text-dark/40 group-open:rotate-180 transition-transform"></i>
                                                    </summary>
                                                    <div className="p-5 pt-0 text-base leading-relaxed text-dark/70 border-t-2 border-dark/10">
                                                        {item.answer}
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-dark/5 mx-auto mb-4 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-4xl text-dark/20"></i>
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-dark mb-2">
                                    No Results Found
                                </h3>
                                <p className="text-base text-dark/60 mb-6">
                                    Try different search terms or browse by
                                    category.
                                </p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="btn btn-dark btn-sm uppercase tracking-wider"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                HELP RESOURCES
               ══════════════════════════════════════════════════════════════ */}
            <section className="help-resources py-16 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                            More <span className="text-teal">Resources</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {HELP_RESOURCES.map((resource) => {
                            const borderClass = `border-${resource.accent}`;
                            const bgClass = `bg-${resource.accent}`;
                            const textClass =
                                resource.accent === "yellow" ||
                                resource.accent === "teal"
                                    ? "text-dark"
                                    : "text-white";

                            return (
                                <a
                                    key={resource.title}
                                    href={resource.href}
                                    className={`resource-card relative p-6 border-4 ${borderClass} bg-white opacity-0 transition-transform hover:scale-[1.03]`}
                                >
                                    {/* Corner accent */}
                                    <div
                                        className={`absolute top-0 right-0 w-10 h-10 ${bgClass}`}
                                    />

                                    <i
                                        className={`fa-duotone fa-regular ${resource.icon} text-3xl ${bgClass} ${textClass} w-12 h-12 flex items-center justify-center mb-4`}
                                    ></i>

                                    <h3 className="text-lg font-black uppercase tracking-wide text-dark mb-2">
                                        {resource.title}
                                    </h3>

                                    <p className="text-sm text-dark/60">
                                        {resource.description}
                                    </p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SUPPORT CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="help-support-cta relative py-20 overflow-hidden bg-dark">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-teal" />
                    <div className="absolute bottom-[20%] left-[12%] w-12 h-12 rotate-45 bg-coral" />
                    <div className="absolute top-[55%] left-[6%] w-10 h-10 rounded-full bg-yellow" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="support-cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 text-white">
                            Still Need{" "}
                            <span className="text-coral">Help?</span>
                        </h2>
                        <p className="text-lg mb-8 text-white/60">
                            Our support team is standing by. Real humans.
                            Quick responses. We're here to help you succeed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/public/contact-memphis"
                                className="btn btn-coral btn-md uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-message"></i>
                                Contact Support
                            </a>
                            <a
                                href="mailto:help@applicant.network"
                                className="btn btn-outline-white btn-md uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Email Us Directly
                            </a>
                        </div>

                        {/* Response time promise */}
                        <div className="mt-8 pt-8 border-t-2 border-white/10">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-white/60">
                                    <i className="fa-duotone fa-regular fa-clock text-teal"></i>
                                    <span className="font-bold">
                                        &lt;24h Response Time
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-white/60">
                                    <i className="fa-duotone fa-regular fa-check-circle text-teal"></i>
                                    <span className="font-bold">
                                        100% Messages Answered
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </HelpAnimator>
    );
}
