"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    stagger,
} from "@/components/landing/shared/animation-utils";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const keyFacts = [
    { value: "2025", label: "Founded" },
    { value: "$0", label: "For companies to post roles" },
    { value: "0-100%", label: "Recruiter share of placement fees" },
    { value: "Cloud-Native", label: "Modern, scalable infrastructure" },
];

const brandColors = [
    {
        name: "Primary",
        hex: "#233876",
        className: "bg-primary text-primary-content",
    },
    {
        name: "Secondary",
        hex: "#0f9d8a",
        className: "bg-secondary text-secondary-content",
    },
    {
        name: "Accent",
        hex: "#945769",
        className: "bg-accent text-accent-content",
    },
    {
        name: "Neutral",
        hex: "#111827",
        className: "bg-neutral text-neutral-content",
    },
];

export function PressContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const overviewRef = useRef<HTMLDivElement>(null);
    const brandRef = useRef<HTMLDivElement>(null);
    const contactRef = useRef<HTMLDivElement>(null);
    const newsRef = useRef<HTMLDivElement>(null);

    // Hero animation - no scroll trigger (visible on load)
    useGSAP(
        () => {
            if (!heroRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const content = heroRef.current.querySelector(".hero-content");
            if (content) {
                gsap.fromTo(
                    content,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.hero,
                        ease: easing.smooth,
                    },
                );
            }
        },
        { scope: heroRef },
    );

    // Company Overview animation
    useGSAP(
        () => {
            if (!overviewRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const heading =
                overviewRef.current.querySelector(".section-heading");
            const content =
                overviewRef.current.querySelector(".overview-content");
            const factCards =
                overviewRef.current.querySelectorAll(".fact-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: overviewRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }

            if (content) {
                tl.fromTo(
                    content,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.3",
                );
            }

            if (factCards.length > 0) {
                tl.fromTo(
                    factCards,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: stagger.tight,
                    },
                    "-=0.3",
                );
            }
        },
        { scope: overviewRef },
    );

    // Brand Assets animation
    useGSAP(
        () => {
            if (!brandRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const heading = brandRef.current.querySelector(".section-heading");
            const logoCards = brandRef.current.querySelectorAll(".logo-card");
            const colorCards = brandRef.current.querySelectorAll(".color-card");
            const screenshotCards =
                brandRef.current.querySelectorAll(".screenshot-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: brandRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }

            if (logoCards.length > 0) {
                tl.fromTo(
                    logoCards,
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                    },
                    "-=0.3",
                );
            }

            if (colorCards.length > 0) {
                tl.fromTo(
                    colorCards,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                    },
                    "-=0.3",
                );
            }

            if (screenshotCards.length > 0) {
                tl.fromTo(
                    screenshotCards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                    },
                    "-=0.2",
                );
            }
        },
        { scope: brandRef },
    );

    // Contact animation
    useGSAP(
        () => {
            if (!contactRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const heading =
                contactRef.current.querySelector(".section-heading");
            const card = contactRef.current.querySelector(".contact-card");
            const cta = contactRef.current.querySelector(".contact-cta");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: contactRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }

            if (card) {
                tl.fromTo(
                    card,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.3",
                );
            }

            if (cta) {
                tl.fromTo(
                    cta,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.2",
                );
            }
        },
        { scope: contactRef },
    );

    // News animation
    useGSAP(
        () => {
            if (!newsRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const heading = newsRef.current.querySelector(".section-heading");
            const cards = newsRef.current.querySelectorAll(".news-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: newsRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }

            if (cards.length > 0) {
                tl.fromTo(
                    cards,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                    },
                    "-=0.3",
                );
            }
        },
        { scope: newsRef },
    );

    return (
        <>
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="hero bg-info text-info-content py-20 overflow-hidden"
            >
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">Press Kit</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Media resources, brand assets, and company
                            information for journalists and partners
                        </p>
                    </div>
                </div>
            </section>

            {/* Company Overview */}
            <section
                ref={overviewRef}
                className="py-20 bg-base-100 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-8 text-center">
                            Company Overview
                        </h2>
                        <div className="overview-content prose lg:prose-xl max-w-none">
                            <h3 className="text-2xl font-bold mb-4">
                                About Splits Network
                            </h3>
                            <p className="text-lg text-base-content/80 mb-6">
                                Splits Network is a modern recruiting
                                marketplace platform designed specifically for
                                split-fee placements. We connect specialized
                                recruiters with companies seeking top talent,
                                providing transparent fee structures,
                                collaborative tools, and a built-in ATS to
                                streamline the entire placement process.
                            </p>

                            <h3 className="text-2xl font-bold mb-4">
                                Key Facts
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                                {keyFacts.map((fact, index) => (
                                    <div
                                        key={index}
                                        className="fact-card card bg-base-200 shadow"
                                    >
                                        <div className="card-body">
                                            <div className="text-3xl font-bold text-primary mb-2">
                                                {fact.value}
                                            </div>
                                            <div className="text-sm text-base-content/70">
                                                {fact.label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-2xl font-bold mb-4">
                                Boilerplate
                            </h3>
                            <div className="bg-base-200 p-6 rounded-lg mb-6">
                                <p className="text-base-content/80 italic">
                                    Splits Network is a split-fee recruiting
                                    marketplace that connects specialized
                                    recruiters with companies seeking top
                                    talent. The platform provides transparent
                                    fee structures, collaborative ATS tools, and
                                    automated split tracking—eliminating the
                                    spreadsheets and email chaos traditionally
                                    associated with split placements. Founded by
                                    recruiting industry veterans, Splits Network
                                    is built specifically for collaborative
                                    recruiting, not retrofitted from
                                    general-purpose systems.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Assets */}
            <section
                ref={brandRef}
                className="py-20 bg-base-200 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center">
                            Brand Assets
                        </h2>

                        {/* Logos */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold mb-6">Logos</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="logo-card card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="card-title">
                                            Primary Logo
                                        </h4>
                                        <div className="bg-white p-8 rounded-lg mb-4 flex items-center justify-center min-h-32">
                                            <div className="text-4xl font-bold text-primary">
                                                <Image
                                                    src="/logo.svg"
                                                    alt="Splits Network"
                                                    width={200}
                                                    height={50}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                                const link =
                                                    document.createElement("a");
                                                link.href = "/logo.svg";
                                                link.download =
                                                    "splits-network-logo.svg";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <i className="fa-duotone fa-regular fa-download"></i>
                                            Download SVG
                                        </button>
                                    </div>
                                </div>
                                <div className="logo-card card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="card-title">
                                            Dark Background
                                        </h4>
                                        <div className="bg-neutral p-8 rounded-lg mb-4 flex items-center justify-center min-h-32">
                                            <div className="text-4xl font-bold text-neutral-content">
                                                <Image
                                                    src="/logo.svg"
                                                    alt="Splits Network"
                                                    width={200}
                                                    height={50}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                                const link =
                                                    document.createElement("a");
                                                link.href = "/logo.svg";
                                                link.download =
                                                    "splits-network-logo.svg";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <i className="fa-duotone fa-regular fa-download"></i>
                                            Download SVG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Color Palette */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold mb-6">
                                Color Palette
                            </h3>
                            <div className="grid md:grid-cols-4 gap-4">
                                {brandColors.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`color-card card ${color.className} shadow`}
                                    >
                                        <div className="card-body items-center text-center p-6">
                                            <div
                                                className={`w-20 h-20 rounded-full ${color.className} border-4 border-current mb-3`}
                                            ></div>
                                            <div className="font-bold">
                                                {color.name}
                                            </div>
                                            <div className="text-xs opacity-75">
                                                {color.hex}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Screenshots */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6">
                                Product Screenshots
                            </h3>
                            <div className="alert alert-info mb-6">
                                <i className="fa-duotone fa-regular fa-info-circle"></i>
                                <span>
                                    High-resolution product screenshots
                                    available upon request
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="screenshot-card card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="font-bold">
                                            Dashboard View
                                        </h4>
                                        <div className="bg-base-300 rounded-lg aspect-video flex items-center justify-center">
                                            <Image
                                                src="/screenshots/light/dashboard-light.png"
                                                alt="Dashboard Screenshot"
                                                width={640}
                                                height={360}
                                                className="object-contain rounded-lg shadow-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="screenshot-card card bg-base-100 shadow">
                                    <div className="card-body">
                                        <h4 className="font-bold">
                                            ATS Pipeline
                                        </h4>
                                        <div className="bg-base-300 rounded-lg aspect-video flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-image text-6xl opacity-20"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section
                ref={contactRef}
                className="py-20 bg-base-100 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center">
                            Media Contact
                        </h2>
                        <div className="contact-card card bg-base-200 shadow">
                            <div className="card-body">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">
                                            Press Inquiries
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-envelope text-primary"></i>
                                                <a
                                                    href="mailto:press@splits.network"
                                                    className="link link-hover"
                                                >
                                                    press@splits.network
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-phone text-primary"></i>
                                                <span>
                                                    Available upon request
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">
                                            Partnership Inquiries
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-envelope text-secondary"></i>
                                                <a
                                                    href="mailto:partnerships@splits.network"
                                                    className="link link-hover"
                                                >
                                                    partnerships@splits.network
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-handshake text-secondary"></i>
                                                <Link
                                                    href="/partners"
                                                    className="link link-hover"
                                                >
                                                    Partner Program
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="contact-cta text-center mt-12">
                            <p className="text-base-content/70 mb-6">
                                For additional materials, interview requests, or
                                custom assets, please contact our press team.
                            </p>
                            <a
                                href="mailto:press@splits.network"
                                className="btn btn-primary btn-lg"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Contact Press Team
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent News */}
            <section
                ref={newsRef}
                className="py-20 bg-neutral text-neutral-content overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center">
                            Recent News
                        </h2>
                        <div className="space-y-6">
                            <div className="news-card card bg-base-100 text-base-content shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-primary">
                                            DEC 2025
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-lg mb-2">
                                                Splits Network Launches Platform
                                                for Split-Fee Recruiting
                                            </h3>
                                            <p className="text-sm text-base-content/70">
                                                New marketplace connects
                                                specialized recruiters with
                                                companies, offering transparent
                                                fee structures and collaborative
                                                tools designed specifically for
                                                split placements.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
