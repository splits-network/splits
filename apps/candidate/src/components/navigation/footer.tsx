"use client";

import { useState } from "react";
import Link from "next/link";
import { BaselFooter } from "@splits-network/basel-ui";

// ─── Footer Data ────────────────────────────────────────────────────────────

const FOOTER_SECTIONS = [
    {
        title: "Platform",
        links: [
            { label: "Browse Jobs", href: "/public/jobs" },
            { label: "How It Works", href: "/public/how-it-works" },
            { label: "Find a Recruiter", href: "/public/marketplace" },
            { label: "Help Center", href: "/public/help" },
            { label: "System Status", href: "/public/status" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Career Guides", href: "/public/resources/career-guides" },
            { label: "Resume Tips", href: "/public/resources/resume-tips" },
            {
                label: "Interview Prep",
                href: "/public/resources/interview-prep",
            },
            {
                label: "Salary Insights",
                href: "/public/resources/salary-insights",
            },
            {
                label: "Industry Trends",
                href: "/public/resources/industry-trends",
            },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "/public/about" },
            { label: "Contact", href: "/public/contact" },
            { label: "For Recruiters", href: "/public/for-recruiters" },
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
            { label: "Privacy Policy", href: "/public/privacy-policy" },
            { label: "Terms of Service", href: "/public/terms-of-service" },
            { label: "Cookie Policy", href: "/public/cookie-policy" },
        ],
    },
];

const SOCIAL_LINKS = [
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

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/public/privacy-policy" },
    { label: "Terms of Service", href: "/public/terms-of-service" },
    { label: "Cookie Policy", href: "/public/cookie-policy" },
];

const TRUST_STATS = [
    { value: "2,847", label: "Recruiters" },
    { value: "518", label: "Companies" },
    { value: "12,340", label: "Candidates" },
    { value: "$42M+", label: "In Placements" },
];

// ─── Footer Component ───────────────────────────────────────────────────────

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

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
                            className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-rocket" />
                            Get Started Free
                        </Link>
                        <Link
                            href="/public/jobs"
                            className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50"
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
                            <p className="text-xs opacity-50">
                                Weekly career tips, new job alerts, and platform
                                updates.
                            </p>
                        </div>
                    </div>

                    {subscribed ? (
                        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20">
                            <i className="fa-duotone fa-regular fa-circle-check text-success text-xl" />
                            <div>
                                <p className="text-sm font-bold text-success">
                                    You are subscribed!
                                </p>
                                <p className="text-xs opacity-50">
                                    Check your inbox for a confirmation email.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubscribe}
                            className="flex gap-2"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className="input input-sm flex-1 bg-neutral-content/5 border-neutral-content/10 text-neutral-content placeholder:text-neutral-content/30 focus:border-primary focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Subscribe
                            </button>
                        </form>
                    )}

                    <p className="text-[10px] opacity-30 mt-3">
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
                        Connecting talented candidates with amazing opportunities
                        through expert recruiters in a single transparent
                        marketplace.
                    </p>
                    <div className="flex gap-2">
                        {SOCIAL_LINKS.map((social) => (
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
                <>
                    {FOOTER_SECTIONS.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4">
                                {section.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        {"external" in link && link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-neutral-content/60 hover:text-neutral-content transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-sm text-neutral-content/60 hover:text-neutral-content transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            }
            stats={
                <>
                    {TRUST_STATS.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-black text-primary">
                                {stat.value}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest opacity-40 mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </>
            }
            bottomBar={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-[11px] opacity-30">
                        <i className="fa-duotone fa-regular fa-copyright" />
                        <span>
                            {new Date().getFullYear()} Employment Networks, Inc.
                            All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {LEGAL_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-[11px] opacity-30 hover:opacity-60 transition-opacity"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] opacity-30">
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
