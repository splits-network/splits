"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}
import {
    ACCENT_HEX,
    HeaderLogo,
    FooterDecorations,
    FooterLinkColumn,
    NewsletterSection,
    FooterBottomBar,
    SocialLink,
} from "@splits-network/memphis-ui";
import type { FooterLinkData, FooterBottomBarLegalLink } from "@splits-network/memphis-ui";

// ─── Animation constants ────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.5)",
};
const S = { tight: 0.04, loose: 0.12 };

// ─── Footer Link Data ───────────────────────────────────────────────────────
const FOOTER_SECTIONS: {
    title: string;
    icon: string;
    color: string;
    links: FooterLinkData[];
}[] = [
    {
        title: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        color: ACCENT_HEX.coral,
        links: [
            { label: "Features", icon: "fa-duotone fa-regular fa-sparkles", href: "/public/features" },
            { label: "Pricing", icon: "fa-duotone fa-regular fa-tag", href: "/public/pricing" },
            { label: "How It Works", icon: "fa-duotone fa-regular fa-gears", href: "/public/how-it-works" },
            { label: "Transparency", icon: "fa-duotone fa-regular fa-eye", href: "/public/transparency" },
            { label: "Integrations", icon: "fa-duotone fa-regular fa-puzzle-piece", href: "/public/integration-partners" },
            { label: "Updates", icon: "fa-duotone fa-regular fa-bell", href: "/public/updates" },
        ],
    },
    {
        title: "Company",
        icon: "fa-duotone fa-regular fa-building-columns",
        color: ACCENT_HEX.teal,
        links: [
            { label: "About Us", icon: "fa-duotone fa-regular fa-users", href: "/public/about" },
            { label: "Careers", icon: "fa-duotone fa-regular fa-briefcase", href: "/public/careers" },
            { label: "Blog", icon: "fa-duotone fa-regular fa-newspaper", href: "/public/blog" },
            { label: "Press", icon: "fa-duotone fa-regular fa-megaphone", href: "/public/press" },
            { label: "Brand Kit", icon: "fa-duotone fa-regular fa-palette", href: "/public/brand" },
            { label: "Partners", icon: "fa-duotone fa-regular fa-people-group", href: "/public/partners" },
        ],
    },
    {
        title: "Resources",
        icon: "fa-duotone fa-regular fa-books",
        color: ACCENT_HEX.yellow,
        links: [
            { label: "Help Center", icon: "fa-duotone fa-regular fa-circle-question" },
            { label: "Contact Us", icon: "fa-duotone fa-regular fa-envelope" },
            { label: "Documentation", icon: "fa-duotone fa-regular fa-book-open", href: "/public/documentation" },
            { label: "API Reference", icon: "fa-duotone fa-regular fa-code" },
            { label: "System Status", icon: "fa-duotone fa-regular fa-signal-bars", href: "/public/status" },
        ],
    },
    {
        title: "Legal",
        icon: "fa-duotone fa-regular fa-scale-balanced",
        color: ACCENT_HEX.purple,
        links: [
            { label: "Privacy Policy", icon: "fa-duotone fa-regular fa-shield-halved", href: "/public/privacy-policy" },
            { label: "Terms of Service", icon: "fa-duotone fa-regular fa-file-contract", href: "/public/terms-of-service" },
            { label: "Cookie Policy", icon: "fa-duotone fa-regular fa-cookie-bite", href: "/public/cookie-policy" },
            { label: "Security", icon: "fa-duotone fa-regular fa-shield-check" },
        ],
    },
];

// ─── Social Links ───────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
    { icon: "fa-brands fa-x-twitter", color: ACCENT_HEX.coral, label: "Twitter", href: "https://x.com/employ_network" },
    { icon: "fa-brands fa-instagram", color: ACCENT_HEX.teal, label: "Instagram", href: "https://www.instagram.com/employ_networks/" },
    { icon: "fa-brands fa-linkedin-in", color: ACCENT_HEX.purple, label: "LinkedIn", href: "https://www.linkedin.com/company/employment-networks-inc" },
    { icon: "fa-brands fa-facebook", color: ACCENT_HEX.yellow, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61586842350461" },
    { icon: "fa-brands fa-github", color: ACCENT_HEX.coral, label: "GitHub", href: "https://github.com/splits-network" },
    { icon: "fa-brands fa-youtube", color: ACCENT_HEX.teal, label: "YouTube", href: "https://www.youtube.com/@employ_networks" },
];

// ─── Bottom Bar Legal Links ─────────────────────────────────────────────────
const LEGAL_LINKS: FooterBottomBarLegalLink[] = [
    { label: "Privacy", href: "/public/privacy-policy" },
    { label: "Terms", href: "/public/terms-of-service" },
    { label: "Cookies", href: "/public/cookie-policy" },
    { label: "Sitemap", href: "/sitemap.xml" },
];

// ─── Footer Component ───────────────────────────────────────────────────────
export function FooterMemphis() {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    // Don't show footer on auth pages
    const isAuthPage =
        pathname?.startsWith("/sign-in") ||
        pathname?.startsWith("/sign-up") ||
        pathname?.startsWith("/sso-callback");

    // GSAP entrance animations with ScrollTrigger
    useGSAP(
        () => {
            if (!containerRef.current || isAuthPage) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);
            const footer = containerRef.current;

            // Newsletter section — reveals when footer scrolls into view
            const newsletter = $1(".newsletter-section");
            if (newsletter) {
                gsap.fromTo(
                    newsletter,
                    { y: 30, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: D.slow, ease: E.smooth,
                        scrollTrigger: { trigger: footer, start: "top 85%" },
                    },
                );
            }

            // Footer columns stagger
            gsap.fromTo(
                $(".footer-column"),
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: D.normal, ease: E.bounce, stagger: S.loose,
                    scrollTrigger: { trigger: footer, start: "top 80%" },
                },
            );

            // Social links
            gsap.fromTo(
                $(".social-link"),
                { scale: 0, rotation: -20 },
                {
                    scale: 1, rotation: 0, duration: D.fast, ease: E.elastic, stagger: S.tight,
                    scrollTrigger: { trigger: $1(".footer-brand"), start: "top 90%" },
                },
            );

            // Brand block
            const brand = $1(".footer-brand");
            if (brand) {
                gsap.fromTo(
                    brand,
                    { x: -30, opacity: 0 },
                    {
                        x: 0, opacity: 1, duration: D.normal, ease: E.bounce,
                        scrollTrigger: { trigger: brand, start: "top 90%" },
                    },
                );
            }

            // Bottom bar
            const bottom = $1(".footer-bottom");
            if (bottom) {
                gsap.fromTo(
                    bottom,
                    { y: 20, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: D.normal, ease: E.smooth,
                        scrollTrigger: { trigger: bottom, start: "top 95%" },
                    },
                );
            }

            // Floating animation on decoration shapes
            $(".footer-shape").forEach((shape, i) => {
                gsap.to(shape, {
                    y: `+=${4 + (i % 3) * 3}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (2 + i)}`,
                    duration: 4 + i * 0.5,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: i * 0.2,
                });
            });
        },
        { scope: containerRef, dependencies: [isAuthPage] },
    );

    if (isAuthPage) return null;

    return (
        <footer
            ref={containerRef}
            className="relative bg-dark"
        >
            <FooterDecorations />

            <div className="relative z-10">
                {/* ─── Newsletter ─── */}
                <div className="newsletter-section">
                    <NewsletterSection />
                </div>

                {/* ─── Link Columns ─── */}
                <div className="py-12 px-4 md:px-10 border-b-4 border-dark-gray">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                            {FOOTER_SECTIONS.map((section, i) => (
                                <div key={i} className="footer-column">
                                    <FooterLinkColumn
                                        title={section.title}
                                        icon={section.icon}
                                        color={section.color}
                                        links={section.links}
                                        linkComponent={Link}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Social & Brand Bar ─── */}
                <div className="py-8 px-4 md:px-10 border-b-4 border-dark-gray">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Brand block */}
                            <div className="footer-brand flex items-center gap-4">
                                <Link href="/">
                                    <HeaderLogo brand="splits" size="md" />
                                </Link>
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                                        Recruiting, Rewired
                                    </div>
                                </div>
                            </div>

                            {/* Social links */}
                            <div className="flex items-center gap-3">
                                {SOCIAL_LINKS.map((social, i) => (
                                    <div key={i} className="social-link">
                                        <SocialLink
                                            icon={social.icon}
                                            color={social.color}
                                            label={social.label}
                                            href={social.href}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Bottom Bar ─── */}
                <div className="footer-bottom">
                    <FooterBottomBar legalLinks={LEGAL_LINKS} linkComponent={Link} />
                </div>
            </div>

            {/* Memphis accent bar at very bottom */}
            <div className="flex">
                <div className="flex-1 h-1 bg-coral" />
                <div className="flex-1 h-1 bg-teal" />
                <div className="flex-1 h-1 bg-yellow" />
                <div className="flex-1 h-1 bg-purple" />
            </div>
        </footer>
    );
}
