"use client";

import { useRef } from "react";
import Image from "next/image";
import { useScrollReveal, BaselFooter } from "@splits-network/basel-ui";

const PLATFORM_LINKS = [
    { label: "Splits Network", href: "https://splits.network" },
    { label: "Applicant Network", href: "https://applicant.network" },
    {
        label: "Employment Networks",
        href: "https://employment-networks.com",
    },
];

const LEGAL_LINKS = [
    {
        label: "Privacy Policy",
        href: "https://employment-networks.com/privacy-policy",
    },
    {
        label: "Terms of Service",
        href: "https://employment-networks.com/terms-of-service",
    },
    {
        label: "Cookie Policy",
        href: "https://employment-networks.com/cookie-policy",
    },
];

const BOTTOM_LEGAL = [
    {
        label: "Privacy",
        href: "https://employment-networks.com/privacy-policy",
    },
    {
        label: "Terms",
        href: "https://employment-networks.com/terms-of-service",
    },
    {
        label: "Cookies",
        href: "https://employment-networks.com/cookie-policy",
    },
];

export function Footer() {
    const containerRef = useRef<HTMLDivElement>(null);

    useScrollReveal(containerRef);

    return (
        <BaselFooter
            containerRef={containerRef as React.RefObject<HTMLElement>}
            cta={
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-3">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                            Experiencing issues
                            <br />
                            not reflected here?
                        </h2>
                    </div>
                    <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 lg:justify-end">
                        <a
                            href="#contact"
                            className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90 border-0 shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-message" />
                            Report an Issue
                        </a>
                        <a
                            href="mailto:help@splits.network"
                            className="btn btn-lg btn-outline border-primary-content/30 text-primary-content hover:bg-primary-content/10 hover:border-primary-content/50"
                        >
                            <i className="fa-duotone fa-regular fa-envelope" />
                            Email Support
                        </a>
                    </div>
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
                        Real-time health monitoring for the Splits Network
                        platform. Powered by Employment Networks.
                    </p>
                </>
            }
            columns={
                <>
                    <div className="footer-col scroll-reveal fade-up">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-primary" />
                            Platform
                        </h4>
                        <ul className="space-y-2.5">
                            {PLATFORM_LINKS.map((link) => (
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

                    <div className="footer-col scroll-reveal fade-up">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-content/40 mb-4 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-primary" />
                            Legal
                        </h4>
                        <ul className="space-y-2.5">
                            {LEGAL_LINKS.map((link) => (
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

                    <div className="footer-col scroll-reveal fade-up" />
                    <div className="footer-col scroll-reveal fade-up" />
                </>
            }
            bottomBar={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 scroll-reveal fade-in">
                    <div className="flex items-center gap-1 text-sm opacity-30">
                        <i className="fa-duotone fa-regular fa-copyright" />
                        <span>
                            {new Date().getFullYear()} Employment Networks LLC.
                            All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {BOTTOM_LEGAL.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm opacity-30 hover:opacity-60 transition-opacity"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            }
        />
    );
}
