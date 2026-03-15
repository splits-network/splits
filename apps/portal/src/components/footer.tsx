"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BaselFooter, useScrollReveal } from "@splits-network/basel-ui";
import type {
    FooterNavConfig,
    FooterSection,
    FooterSocialLink,
    FooterTrustStat,
    FooterLinkItem,
} from "@splits-network/shared-types";

/* ─── Default Footer Data (fallback when CMS is unavailable) ─────────────── */

const DEFAULT_FOOTER_SECTIONS: FooterSection[] = [
    {
        title: "Platform",
        links: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Transparency", href: "/transparency" },
            { label: "Integrations", href: "/integration-partners" },
            { label: "Updates", href: "/updates" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Blog", href: "/blog" },
            { label: "Press", href: "/press" },
            { label: "Brand Kit", href: "/brand" },
            { label: "Partners", href: "/partners" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Help Center", href: "#" },
            { label: "Contact Us", href: "/contact" },
            { label: "Documentation", href: "/documentation" },
            { label: "API Reference", href: "#" },
            { label: "System Status", href: "/status" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms of Service", href: "/terms-of-service" },
            { label: "Cookie Policy", href: "/cookie-policy" },
            { label: "Security", href: "#" },
        ],
    },
];

const DEFAULT_SOCIAL_LINKS: FooterSocialLink[] = [
    {
        icon: "fa-brands fa-x-twitter",
        label: "Twitter",
        href: "https://x.com/employ_network",
    },
    {
        icon: "fa-brands fa-instagram",
        label: "Instagram",
        href: "https://www.instagram.com/employ_networks/",
    },
    {
        icon: "fa-brands fa-linkedin-in",
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/employment-networks-inc",
    },
    {
        icon: "fa-brands fa-facebook",
        label: "Facebook",
        href: "https://www.facebook.com/profile.php?id=61586842350461",
    },
    {
        icon: "fa-brands fa-github",
        label: "GitHub",
        href: "https://github.com/splits-network",
    },
    {
        icon: "fa-brands fa-youtube",
        label: "YouTube",
        href: "https://www.youtube.com/@employ_networks",
    },
];

const DEFAULT_TRUST_STATS: FooterTrustStat[] = [
    { value: "2,847", label: "Recruiters" },
    { value: "518", label: "Companies" },
    { value: "12,340", label: "Candidates" },
    { value: "$42M+", label: "In Placements" },
];

const DEFAULT_LEGAL_LINKS: FooterLinkItem[] = [
    { label: "Privacy", href: "/privacy-policy" },
    { label: "Terms", href: "/terms-of-service" },
    { label: "Cookies", href: "/cookie-policy" },
    { label: "Sitemap", href: "/sitemap.xml" },
];

/* ─── Footer Component ───────────────────────────────────────────────────── */

export function Footer({ footerNav }: { footerNav?: FooterNavConfig | null }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const sections = footerNav?.sections ?? DEFAULT_FOOTER_SECTIONS;
    const socialLinks = footerNav?.socialLinks ?? DEFAULT_SOCIAL_LINKS;
    const trustStats = footerNav?.trustStats ?? DEFAULT_TRUST_STATS;
    const legalLinks = footerNav?.legalLinks ?? DEFAULT_LEGAL_LINKS;

    // Offset footer when sidebar is visible (authenticated portal routes)
    const hasSidebar = pathname.startsWith("/portal/");

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    useScrollReveal(containerRef);

    return (
        <div className={hasSidebar ? "lg:ml-64" : ""}>
            <BaselFooter
                containerRef={containerRef as React.RefObject<HTMLElement>}
                cta={
                    !hasSidebar ? (
                        <div className="grid lg:grid-cols-5 gap-8 items-center">
                            <div className="lg:col-span-3">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                                    Ready to transform
                                    <br />
                                    how you recruit?
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
                                    href="#"
                                    className="btn btn-lg btn-outline border-primary-content/30 text-primary-content hover:bg-primary-content/10 hover:border-primary-content/50"
                                >
                                    <i className="fa-duotone fa-regular fa-calendar" />
                                    Book a Demo
                                </Link>
                            </div>
                        </div>
                    ) : undefined
                }
                newsletter={
                    <div className="text-neutral-content">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black">
                                    Stay in the loop
                                </h3>
                                <p className="text-sm opacity-50">
                                    Weekly insights on recruiting, marketplace
                                    trends, and platform updates.
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
                                        Check your inbox for a confirmation
                                        email.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubscribe}
                                className="flex flex-col sm:flex-row gap-2 max-w-md"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                    className="input input-sm flex-1 min-w-0 bg-neutral-content/5 border-neutral-content/10 text-base-content placeholder:text-base-content/30 focus:border-primary focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm shrink-0"
                                >
                                    <i className="fa-duotone fa-regular fa-paper-plane" />
                                    Subscribe
                                </button>
                            </form>
                        )}

                        <p className="text-sm opacity-30 mt-3">
                            No spam. Unsubscribe anytime. We respect your
                            privacy.
                        </p>
                    </div>
                }
                brand={
                    <>
                        <div className="mb-4">
                            <Image
                                src="/logo.png"
                                alt="Splits Network"
                                width={160}
                                height={54}
                                className="h-12 w-auto brightness-0 invert"
                            />
                        </div>
                        <p className="text-sm opacity-50 leading-relaxed mb-4 text-neutral-content/70">
                            The split-fee recruiting marketplace that connects
                            recruiters, companies, and candidates in a single
                            transparent ecosystem.
                        </p>
                        <div className="social-row flex gap-2">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={social.label}
                                    className="social-icon scroll-reveal pop-in w-9 h-9 bg-neutral-content/5 hover:bg-primary hover:text-primary-content flex items-center justify-center transition-all"
                                >
                                    <i className={`${social.icon} text-sm`} />
                                </a>
                            ))}
                        </div>
                    </>
                }
                columns={
                    <>
                        {sections.map((section) => (
                            <div
                                key={section.title}
                                className="footer-col scroll-reveal fade-up"
                            >
                                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4 flex items-center gap-2">
                                    <span className="w-4 h-0.5 bg-primary" />
                                    {section.title}
                                </h4>
                                <ul className="space-y-2.5">
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-neutral-content/60 hover:text-neutral-content transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </>
                }
                stats={
                    <>
                        {trustStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="footer-stat scroll-reveal fade-up text-center"
                            >
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
                    <div className="scroll-reveal fade-in flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-1 text-sm opacity-30">
                            <i className="fa-duotone fa-regular fa-copyright" />
                            <span>
                                {new Date().getFullYear()} Employment Networks
                                LLC. All rights reserved.
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {legalLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm opacity-30 hover:opacity-60 transition-opacity"
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
        </div>
    );
}
