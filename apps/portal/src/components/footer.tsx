"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BaselFooter } from "@splits-network/basel-ui";
import type {
    FooterNavConfig,
    FooterSection,
    FooterSocialLink,
    FooterTrustStat,
    FooterLinkItem,
} from "@splits-network/shared-types";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

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
            { label: "Contact Us", href: "/contact-memphis" },
            { label: "Documentation", href: "/documentation" },
            { label: "API Reference", href: "#" },
            { label: "System Status", href: "/status-memphis" },
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

    // GSAP scroll-triggered animations
    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                containerRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => {
                        gsap.set(el, { opacity: 1 });
                    });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // CTA band
            const ctaBand = $1(".footer-cta-band");
            if (ctaBand) {
                gsap.fromTo(
                    ctaBand,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: { trigger: ctaBand, start: "top 85%" },
                    },
                );
            }

            // Newsletter section
            const newsletter = $1(".footer-newsletter");
            if (newsletter) {
                gsap.fromTo(
                    newsletter,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: newsletter,
                            start: "top 85%",
                        },
                    },
                );
            }

            // Footer columns stagger
            gsap.fromTo(
                $(".footer-col"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".footer-columns"),
                        start: "top 85%",
                    },
                },
            );

            // Trust stats bar
            gsap.fromTo(
                $(".footer-stat"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".footer-stats-bar"),
                        start: "top 90%",
                    },
                },
            );

            // Social icons
            gsap.fromTo(
                $(".social-icon"),
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    stagger: 0.06,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: $1(".social-row"),
                        start: "top 90%",
                    },
                },
            );

            // Bottom bar
            const bottom = $1(".footer-bottom");
            if (bottom) {
                gsap.fromTo(
                    bottom,
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: 0.6,
                        ease: "power2.out",
                        scrollTrigger: { trigger: bottom, start: "top 95%" },
                    },
                );
            }
        },
        { scope: containerRef },
    );

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
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black">
                                    Stay in the loop
                                </h3>
                                <p className="text-xs opacity-50">
                                    Weekly insights on recruiting, marketplace
                                    trends, and platform updates.
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
                                    className="input input-sm flex-1 min-w-0 bg-neutral-content/5 border-neutral-content/10 text-neutral-content placeholder:text-neutral-content/30 focus:border-primary focus:outline-none"
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

                        <p className="text-[10px] opacity-30 mt-3">
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
                        <p className="text-sm opacity-50 leading-relaxed mb-4">
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
                                    className="social-icon w-9 h-9 bg-neutral-content/5 hover:bg-primary hover:text-primary-content flex items-center justify-center transition-all opacity-0"
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
                                className="footer-col opacity-0"
                            >
                                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4 flex items-center gap-2">
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
                                className="footer-stat text-center opacity-0"
                            >
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
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 opacity-0">
                        <div className="flex items-center gap-1 text-[11px] opacity-30">
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
        </div>
    );
}
