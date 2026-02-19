"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BaselFooter } from "@splits-network/basel-ui";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Footer Links Data ──────────────────────────────────────────────────────

const PRODUCT_LINKS = [
    { label: "Splits Network", href: "https://splits.network" },
    { label: "Applicant Network", href: "https://applicant.network" },
];

const COMPANY_LINKS = [
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "/contact" },
    { label: "System Status", href: "/status" },
];

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
];

const SOCIAL_LINKS = [
    { label: "Twitter", href: "https://x.com/employ_network", icon: "fa-brands fa-x-twitter" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/employment-networks-inc", icon: "fa-brands fa-linkedin-in" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61586842350461", icon: "fa-brands fa-facebook" },
    { label: "Instagram", href: "https://www.instagram.com/employ_networks/", icon: "fa-brands fa-instagram" },
    { label: "GitHub", href: "https://github.com/splits-network", icon: "fa-brands fa-github" },
    { label: "YouTube", href: "https://www.youtube.com/@employ_networks", icon: "fa-brands fa-youtube" },
];

const BOTTOM_LEGAL = [
    { label: "Privacy", href: "/privacy-policy" },
    { label: "Terms", href: "/terms-of-service" },
    { label: "Cookies", href: "/cookie-policy" },
];

// ─── Footer Component ───────────────────────────────────────────────────────

export function Footer() {
    const containerRef = useRef<HTMLDivElement>(null);

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
                        scrollTrigger: {
                            trigger: ctaBand,
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
                        scrollTrigger: {
                            trigger: bottom,
                            start: "top 95%",
                        },
                    },
                );
            }
        },
        { scope: containerRef },
    );

    return (
        <BaselFooter
            containerRef={containerRef as React.RefObject<HTMLElement>}
            cta={
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-3">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                            Ready to transform
                            <br />
                            how you recruit?
                        </h2>
                    </div>
                    <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 lg:justify-end">
                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90 border-0 shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-rocket" />
                            Get Started Free
                        </a>
                        <Link
                            href="/contact"
                            className="btn btn-lg btn-outline border-primary-content/30 text-primary-content hover:bg-primary-content/10 hover:border-primary-content/50"
                        >
                            <i className="fa-duotone fa-regular fa-calendar" />
                            Book a Demo
                        </Link>
                    </div>
                </div>
            }
            brand={
                <>
                    <div className="mb-4">
                        <Image
                            src="/logo.png"
                            alt="Employment Networks"
                            width={160}
                            height={54}
                            className="h-12 w-auto brightness-0 invert"
                        />
                    </div>
                    <p className="text-sm opacity-50 leading-relaxed mb-4">
                        Building the future of recruiting through innovative
                        split-fee collaboration.
                    </p>
                    <div className="social-row flex gap-2">
                        {SOCIAL_LINKS.map((social) => (
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
                    {/* Products */}
                    <div className="footer-col opacity-0">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-primary" />
                            Products
                        </h4>
                        <ul className="space-y-2.5">
                            {PRODUCT_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-neutral-content/60 hover:text-neutral-content transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="footer-col opacity-0">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-primary" />
                            Company
                        </h4>
                        <ul className="space-y-2.5">
                            {COMPANY_LINKS.map((link) => (
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

                    {/* Legal */}
                    <div className="footer-col opacity-0">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-primary" />
                            Legal
                        </h4>
                        <ul className="space-y-2.5">
                            {LEGAL_LINKS.map((link) => (
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

                    {/* Empty 4th column for grid balance */}
                    <div className="footer-col opacity-0" />
                </>
            }
            bottomBar={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 opacity-0">
                    <div className="flex items-center gap-1 text-[11px] opacity-30">
                        <i className="fa-duotone fa-regular fa-copyright" />
                        <span>
                            {new Date().getFullYear()} Employment Networks LLC.
                            All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {BOTTOM_LEGAL.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-[11px] opacity-30 hover:opacity-60 transition-opacity"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            }
        />
    );
}
