"use client";

import { useState } from "react";
import Link from "next/link";
import { BaselFooter } from "@splits-network/basel-ui";
import type {
    FooterNavConfig,
    FooterSection,
    FooterSocialLink,
    FooterTrustStat,
    FooterLinkItem,
} from "@splits-network/shared-types";

// ─── Default Footer Data (fallback when CMS is unavailable) ─────────────────

const DEFAULT_FOOTER_SECTIONS: FooterSection[] = [
    {
        title: "Platform",
        links: [
            { label: "Browse Jobs", href: "/jobs" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Find a Recruiter", href: "/marketplace" },
            { label: "Help Center", href: "/help" },
            { label: "System Status", href: "/status" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Career Guides", href: "/resources/career-guides" },
            { label: "Resume Tips", href: "/resources/resume-tips" },
            {
                label: "Interview Prep",
                href: "/resources/interview-prep",
            },
            {
                label: "Salary Insights",
                href: "/resources/salary-insights",
            },
            {
                label: "Industry Trends",
                href: "/resources/industry-trends",
            },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "For Recruiters", href: "/for-recruiters" },
            {
                label: "Splits Network",
                href: "https://splits.network",
                external: true,
            },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms of Service", href: "/terms-of-service" },
            { label: "Cookie Policy", href: "/cookie-policy" },
        ],
    },
];

const DEFAULT_SOCIAL_LINKS: FooterSocialLink[] = [
    {
        icon: "fa-brands fa-linkedin-in",
        href: "https://linkedin.com",
        label: "LinkedIn",
    },
    {
        icon: "fa-brands fa-x-twitter",
        href: "https://twitter.com",
        label: "X / Twitter",
    },
    {
        icon: "fa-brands fa-facebook",
        href: "https://facebook.com",
        label: "Facebook",
    },
    {
        icon: "fa-brands fa-instagram",
        href: "https://instagram.com",
        label: "Instagram",
    },
];

const DEFAULT_LEGAL_LINKS: FooterLinkItem[] = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
];

const DEFAULT_TRUST_STATS: FooterTrustStat[] = [
    { value: "2,847", label: "Recruiters" },
    { value: "518", label: "Companies" },
    { value: "12,340", label: "Candidates" },
    { value: "$42M+", label: "In Placements" },
];

// ─── Footer Component ───────────────────────────────────────────────────────

export default function Footer({
    footerNav,
}: {
    footerNav?: FooterNavConfig | null;
}) {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const sections = footerNav?.sections ?? DEFAULT_FOOTER_SECTIONS;
    const socialLinks = footerNav?.socialLinks ?? DEFAULT_SOCIAL_LINKS;
    const trustStats = footerNav?.trustStats ?? DEFAULT_TRUST_STATS;
    const legalLinks = footerNav?.legalLinks ?? DEFAULT_LEGAL_LINKS;

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    return (
        <BaselFooter
            cta={
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-3">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                            Ready to find your
                            <br />
                            dream job?
                        </h2>
                    </div>
                    <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 lg:justify-end">
                        <Link
                            href="/sign-up"
                            className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90 border-0 shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-rocket" />
                            Get Started Free
                        </Link>
                        <Link
                            href="/jobs"
                            className="btn btn-lg btn-outline border-primary-content/30 text-primary-content hover:bg-primary-content/10 hover:border-primary-content/50"
                        >
                            <i className="fa-duotone fa-regular fa-briefcase" />
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            }
            newsletter={
                <>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">
                                Stay in the loop
                            </h3>
                            <p className="text-sm opacity-50">
                                Weekly career tips, new job alerts, and platform
                                updates.
                            </p>
                        </div>
                    </div>

                    {subscribed ? (
                        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20">
                            <i className="fa-duotone fa-regular fa-circle-check text-success text-xl" />
                            <div>
                                <p className="text-md font-bold text-success">
                                    You are subscribed!
                                </p>
                                <p className="text-sm opacity-50">
                                    Check your inbox for a confirmation email.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className="input bg-neutral-content/5 border-neutral-content/10 text-neutral-content placeholder:text-neutral-content/30 focus:border-primary focus:outline-none"
                            />
                            <button type="submit" className="btn btn-primary">
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Subscribe
                            </button>
                        </form>
                    )}

                    <p className="text-sm opacity-30 mt-3">
                        No spam. Unsubscribe anytime. We respect your privacy.
                    </p>
                </>
            }
            brand={
                <>
                    <div className="mb-4">
                        <img
                            src="/logo.png"
                            alt="Applicant Network"
                            className="h-8 w-auto brightness-0 invert"
                        />
                    </div>
                    <p className="text-sm opacity-50 leading-relaxed mb-4">
                        Connecting talented candidates with amazing
                        opportunities through expert recruiters in a single
                        transparent marketplace.
                    </p>
                    <div className="flex gap-2">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={social.label}
                                className="w-9 h-9 bg-neutral-content/5 hover:bg-primary hover:text-primary-content flex items-center justify-center transition-all"
                            >
                                <i className={`${social.icon} text-sm`} />
                            </a>
                        ))}
                    </div>
                </>
            }
            columns={
                <div className="grid grid-flow-col gap-4">
                    {sections.map((section) => (
                        <nav key={section.title}>
                            <h6 className="footer-title">{section.title}</h6>
                            {section.links.map((link) =>
                                "external" in link && link.external ? (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link link-hover"
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="link link-hover"
                                    >
                                        {link.label}
                                    </Link>
                                ),
                            )}
                        </nav>
                    ))}
                </div>
            }
            stats={
                <>
                    {trustStats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-black text-primary">
                                {stat.value}
                            </div>
                            <div className="text-sm uppercase tracking-widest opacity-40 mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </>
            }
            bottomBar={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-sm opacity-30">
                        <i className="fa-duotone fa-regular fa-copyright" />
                        <span>
                            {new Date().getFullYear()} Employment Networks, Inc.
                            All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="link link-hover text-sm opacity-30 hover:opacity-60"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-30">
                        <i className="fa-duotone fa-regular fa-shield-check" />
                        <span>SOC 2 Type II Compliant</span>
                        <span className="mx-1">|</span>
                        <i className="fa-duotone fa-regular fa-lock" />
                        <span>256-bit Encryption</span>
                    </div>
                </div>
            }
        />
    );
}
