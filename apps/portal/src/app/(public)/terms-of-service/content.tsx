"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* -- Unsplash images -------------------------------------------------------- */
const img = {
    hero: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80",
    collaboration:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    professional:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
};

/* -- TOC entries ------------------------------------------------------------ */
const tocItems = [
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "description", label: "Service Description" },
    { id: "eligibility", label: "Eligibility" },
    { id: "accounts", label: "Accounts & Registration" },
    { id: "conduct", label: "User Conduct" },
    { id: "platform-rules", label: "Platform Rules" },
    { id: "fees", label: "Fees & Payments" },
    { id: "ip", label: "Intellectual Property" },
    { id: "ai-features", label: "AI-Powered Features" },
    { id: "privacy", label: "Privacy" },
    { id: "disclaimers", label: "Disclaimers & Liability" },
    { id: "indemnification", label: "Indemnification" },
    { id: "termination", label: "Termination" },
    { id: "disputes", label: "Dispute Resolution" },
    { id: "governing-law", label: "Governing Law" },
    { id: "changes", label: "Changes to Terms" },
];

/* -- Component -------------------------------------------------------------- */

export default function TermsOfServiceContent() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            if (prefersReducedMotion) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            const $ = (sel: string) =>
                mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                mainRef.current!.querySelector(sel);

            /* -- HERO --------------------------------------------------------- */
            const heroTl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            const heroKicker = $1(".hero-kicker");
            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                );
            }

            const heroWords = $(".hero-headline-word");
            if (heroWords.length) {
                heroTl.fromTo(
                    heroWords,
                    { opacity: 0, y: 80, rotateX: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.12,
                    },
                    "-=0.3",
                );
            }

            const heroSubtitle = $1(".hero-subtitle");
            if (heroSubtitle) {
                heroTl.fromTo(
                    heroSubtitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.5",
                );
            }

            const heroMeta = $(".hero-meta-item");
            if (heroMeta.length) {
                heroTl.fromTo(
                    heroMeta,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.3",
                );
            }

            /* Hero image parallax */
            const heroImgWrap = $1(".hero-img-wrap");
            if (heroImgWrap) {
                gsap.fromTo(
                    heroImgWrap,
                    { opacity: 0, scale: 1.08 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 1.4,
                        ease: "power2.out",
                        delay: 0.2,
                    },
                );

                const heroImg = heroImgWrap.querySelector("img");
                const heroSection = $1(".hero-section");
                if (heroImg && heroSection) {
                    gsap.to(heroImg, {
                        yPercent: 12,
                        ease: "none",
                        scrollTrigger: {
                            trigger: heroSection,
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                }
            }

            /* -- SECTION REVEALS ---------------------------------------------- */
            $(".article-block").forEach((block) => {
                gsap.fromTo(
                    block,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: block,
                            start: "top 80%",
                        },
                    },
                );
            });

            /* -- SPLIT-SCREEN SECTIONS ---------------------------------------- */
            $(".split-text-left").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-img-right").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-text-right").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            $(".split-img-left").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 70%",
                        },
                    },
                );
            });

            /* -- PULL QUOTES -------------------------------------------------- */
            $(".pull-quote-block").forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, scale: 0.96 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.9,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: quote,
                            start: "top 80%",
                        },
                    },
                );
            });

            /* -- CTA ---------------------------------------------------------- */
            const ctaContent = $1(".final-cta-content");
            const ctaSection = $1(".final-cta");
            if (ctaContent && ctaSection) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden">
            {/* =================================================================
                HERO -- Split-screen 60/40 with diagonal clip
               ================================================================= */}
            <section className="hero-section relative min-h-[92vh] flex items-center bg-base-100">
                {/* Right image panel */}
                <div
                    className="hero-img-wrap absolute inset-0 lg:left-[58%] opacity-0"
                    style={{
                        clipPath:
                            "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                >
                    <img
                        src={img.hero}
                        alt="Professional contract signing and legal documentation"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral/60 lg:bg-neutral/20"></div>
                </div>

                {/* Content panel -- 60% on desktop */}
                <div className="relative z-10 container mx-auto px-6 lg:px-12 py-28">
                    <div className="max-w-2xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-file-contract mr-2"></i>
                            Legal Agreement
                        </p>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight mb-8">
                            <span className="hero-headline-word inline-block opacity-0 text-base-content lg:text-base-content">
                                Terms of
                            </span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-secondary">
                                Service.
                            </span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl mb-8 opacity-0">
                            The rules, guidelines, and mutual commitments that
                            govern your use of the Splits Network platform.
                            Please read carefully before using our services.
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-building mr-1"></i>
                                Employment Networks, Inc.
                            </span>
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-calendar mr-1"></i>
                                Last Updated: February 20, 2026
                            </span>
                            <span className="hero-meta-item text-xs uppercase tracking-[0.15em] text-base-content/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                16 Sections
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                TABLE OF CONTENTS
               ================================================================= */}
            <section className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            <i className="fa-duotone fa-regular fa-list mr-2"></i>
                            Quick Navigation
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Table of contents.
                        </h2>
                        <div className="border-l-4 border-secondary pl-8">
                            <div className="grid sm:grid-cols-2 gap-4">
                                {tocItems.map((item, i) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="flex items-center gap-3 text-base-content/70 hover:text-secondary transition-colors"
                                    >
                                        <span className="text-xs font-bold text-secondary/50 w-6">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="text-sm">
                                            {item.label}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 1 -- Acceptance of Terms
                Article block
               ================================================================= */}
            <section id="acceptance" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            01 -- Agreement
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Acceptance of terms.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                By accessing, browsing, or using the Splits Network platform
                                (the &ldquo;Platform&rdquo;), operated by Employment Networks, Inc.
                                (&ldquo;Splits Network,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
                                or &ldquo;our&rdquo;), you acknowledge that you have read,
                                understood, and agree to be bound by these Terms of Service
                                (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you must
                                not access or use the Platform.
                            </p>
                            <p>
                                These Terms constitute a legally binding agreement between you and
                                Employment Networks, Inc. They apply to all users of the Platform,
                                including but not limited to recruiters, candidates, company
                                representatives, and visitors. By creating an account, submitting
                                content, or using any feature of the Platform, you affirm your
                                acceptance of these Terms and any additional policies referenced
                                herein.
                            </p>
                            <p>
                                We may update these Terms from time to time. Your continued use of
                                the Platform after such changes constitutes acceptance of the revised
                                Terms. We encourage you to review these Terms periodically. If you
                                are using the Platform on behalf of an organization, you represent
                                and warrant that you have the authority to bind that organization to
                                these Terms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 2 -- Service Description
                Split-screen editorial (60 text / 40 image)
               ================================================================= */}
            <section id="description" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-left lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                02 -- The Platform
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Service
                                <br />
                                description.
                            </h2>
                            <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                                <p>
                                    Splits Network is a split-fee recruiting marketplace that
                                    connects recruiters, companies seeking talent, and candidates.
                                    The Platform provides the infrastructure for collaborative hiring
                                    through split-fee placement arrangements, where two or more
                                    recruiting professionals partner on a single placement and share
                                    the resulting fee.
                                </p>
                                <p>
                                    The Platform includes AI-powered features driven by OpenAI
                                    technology, including intelligent candidate matching, job
                                    recommendations, and an AI chat assistant. These features analyze
                                    user-provided data to surface optimal matches between candidates,
                                    job opportunities, and recruiting partners.
                                </p>
                                <p>
                                    Our services include but are not limited to: job posting and
                                    management, candidate profile creation and discovery, split-fee
                                    agreement facilitation, pipeline tracking and visibility,
                                    automated payment processing through Stripe, AI-driven matching
                                    and recommendations, real-time messaging and collaboration tools,
                                    and analytics dashboards for performance tracking.
                                </p>
                                <p>
                                    Splits Network acts as a marketplace platform and is not itself a
                                    recruiting agency, employer, or staffing firm. We do not
                                    guarantee placements, employment outcomes, or the quality of any
                                    candidate, job opportunity, or recruiting partner.
                                </p>
                            </div>
                        </div>

                        {/* Image -- 2 of 5 columns (40%) */}
                        <div className="split-img-right lg:col-span-2 opacity-0">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.collaboration}
                                    alt="Team collaboration in recruiting"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-secondary/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 3 -- Eligibility
                Article block
               ================================================================= */}
            <section id="eligibility" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            03 -- Requirements
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Eligibility.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                To access and use the Platform, you must meet all of the following
                                eligibility requirements. By using the Platform, you represent and
                                warrant that you satisfy each condition.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Age Requirement.
                                </strong>{" "}
                                You must be at least eighteen (18) years of age. The Platform is not
                                intended for individuals under the age of 18, and we do not
                                knowingly collect information from minors.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Legal Capacity.
                                </strong>{" "}
                                You must have the legal capacity and authority to enter into a
                                binding contract. If you are accepting these Terms on behalf of a
                                company, organization, or other legal entity, you represent and
                                warrant that you have the authority to bind that entity.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Work Authorization.
                                </strong>{" "}
                                If you are using the Platform as a recruiter or candidate, you must
                                be legally authorized to work or provide recruiting services in your
                                jurisdiction. It is your responsibility to comply with all applicable
                                employment laws and regulations.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    No Restrictions.
                                </strong>{" "}
                                You are not subject to any sanctions, embargoes, or legal
                                restrictions that would prohibit you from using the Platform. You
                                have not been previously banned or removed from the Platform for
                                violations of these Terms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 4 -- Accounts & Registration
                Article block
               ================================================================= */}
            <section id="accounts" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            04 -- Your Account
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Accounts &<br />
                            registration.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    Account Creation.
                                </strong>{" "}
                                To access most features of the Platform, you must create an account.
                                Account creation and authentication are managed through Clerk, our
                                third-party identity and authentication provider. You may register
                                using email, single sign-on (SSO), or supported social login
                                providers as made available through Clerk. By creating an account,
                                you consent to the processing of your authentication data by Clerk
                                in accordance with their privacy policy.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Accurate Information.
                                </strong>{" "}
                                You agree to provide accurate, current, and complete information
                                during registration and to keep your account information updated at
                                all times. Providing false, misleading, or outdated information is a
                                violation of these Terms and may result in immediate account
                                suspension or termination.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Account Security.
                                </strong>{" "}
                                You are solely responsible for maintaining the confidentiality of
                                your account credentials, including any passwords or authentication
                                tokens. You agree to accept full responsibility for all activities
                                that occur under your account. You must notify us immediately at{" "}
                                <a
                                    href="mailto:security@splits.network"
                                    className="text-secondary underline"
                                >
                                    security@splits.network
                                </a>{" "}
                                if you suspect any unauthorized access to or use of your account.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    One Account Per Person.
                                </strong>{" "}
                                Each individual may maintain only one account on the Platform.
                                Creating multiple accounts to circumvent restrictions, manipulate
                                platform features, or evade enforcement actions is strictly
                                prohibited.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Account Types.
                                </strong>{" "}
                                The Platform supports multiple account types, including Recruiter,
                                Company, and Candidate accounts. Each account type has specific
                                features, permissions, and obligations as described in these Terms
                                and on the Platform. You agree to use your account only in
                                accordance with its designated type and purpose.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                PULL QUOTE 1
               ================================================================= */}
            <section className="pull-quote-block py-20 bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
                            <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary/30 mb-6 block"></i>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                &ldquo;Trust is built on transparency. Every
                                agreement, every term, documented and
                                clear.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Splits Network
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 5 -- User Conduct
                Article block
               ================================================================= */}
            <section id="conduct" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            05 -- Expectations
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            User conduct.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                You agree to use the Platform in a manner consistent with all
                                applicable laws, regulations, and these Terms. You are responsible
                                for all content you submit, communications you make, and actions
                                you take on the Platform.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    You agree NOT to:
                                </strong>
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Violate any applicable local, state, national, or international law, regulation, or third-party rights",
                                    "Engage in fraud, misrepresentation, or deceptive practices, including providing false information about yourself, your qualifications, or job opportunities",
                                    "Harass, threaten, intimidate, defame, or discriminate against any other user or individual",
                                    "Circumvent, manipulate, or attempt to avoid any fees, commissions, or payment obligations owed through the Platform",
                                    "Interfere with or disrupt the Platform's operation, availability, security, or infrastructure, including through hacking, DDoS attacks, or automated scraping",
                                    "Post, transmit, or distribute content that is unlawful, harmful, threatening, abusive, defamatory, vulgar, obscene, or otherwise objectionable",
                                    "Use the Platform to send unsolicited bulk communications (spam) or engage in any form of unauthorized advertising",
                                    "Attempt to gain unauthorized access to other users' accounts, the Platform's systems, or any connected networks",
                                    "Use automated tools, bots, or scripts to access or interact with the Platform except as expressly authorized by us",
                                    "Engage in any activity that could disable, overburden, or impair the proper functioning of the Platform",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-8 h-8 flex-shrink-0 bg-secondary/10 flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-ban text-secondary text-xs"></i>
                                        </div>
                                        <p className="text-base text-base-content/70 leading-relaxed">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p>
                                We reserve the right to investigate and take appropriate action
                                against any user who violates this section, including removing
                                content, suspending or terminating accounts, and reporting
                                violations to law enforcement authorities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 6 -- Platform Rules
                Split-screen editorial (40 image / 60 text)
               ================================================================= */}
            <section id="platform-rules" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Image -- 2 of 5 columns (40%) */}
                        <div className="split-img-left lg:col-span-2 opacity-0">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
                                }}
                            >
                                <img
                                    src={img.professional}
                                    alt="Professional work environment"
                                    className="w-full h-[520px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Text -- 3 of 5 columns (60%) */}
                        <div className="split-text-right lg:col-span-3 opacity-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                                06 -- Rules of Engagement
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                                Platform
                                <br />
                                rules.
                            </h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-base-content mb-3">
                                        <i className="fa-duotone fa-regular fa-briefcase text-secondary mr-2"></i>
                                        For Recruiters
                                    </h3>
                                    <div className="space-y-2 text-base-content/70 leading-relaxed">
                                        <p>
                                            You must conduct all split-fee placements exclusively
                                            through the Platform. Circumventing the Platform to
                                            complete placements off-platform with contacts made
                                            through the Platform is a material breach of these Terms.
                                            You must honor all split-fee agreements entered into on
                                            the Platform. You agree to maintain professional conduct
                                            in all interactions, report placements accurately and
                                            promptly, and provide truthful information about
                                            candidates and job opportunities.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-base-content mb-3">
                                        <i className="fa-duotone fa-regular fa-building text-secondary mr-2"></i>
                                        For Companies
                                    </h3>
                                    <div className="space-y-2 text-base-content/70 leading-relaxed">
                                        <p>
                                            You must provide accurate and complete job descriptions,
                                            compensation details, and hiring requirements. You agree
                                            to pay all agreed placement fees promptly and in
                                            accordance with the fee schedule. You must honor placement
                                            agreements and treat all candidates referred through the
                                            Platform professionally and in compliance with applicable
                                            employment laws. You may not contact candidates directly
                                            to circumvent placement fees.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-base-content mb-3">
                                        <i className="fa-duotone fa-regular fa-user text-secondary mr-2"></i>
                                        For Candidates
                                    </h3>
                                    <div className="space-y-2 text-base-content/70 leading-relaxed">
                                        <p>
                                            You must provide accurate information about your
                                            qualifications, experience, work history, and
                                            authorization to work. You agree to communicate promptly
                                            and professionally with recruiters and companies. You
                                            understand that your profile information may be shared
                                            with recruiters and potential employers in the course of
                                            the placement process. You must not misrepresent your
                                            skills, credentials, or employment history.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 7 -- Fees & Payments
                Article block
               ================================================================= */}
            <section id="fees" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            07 -- Financial Terms
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Fees & payments.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    Fee Structure.
                                </strong>{" "}
                                Placement fees are calculated as a percentage of the placed
                                candidate&apos;s agreed first-year compensation. Fee percentages vary
                                based on role type, seniority level, and market conditions. Detailed
                                fee information is provided at the time each split-fee agreement is
                                created on the Platform. Splits Network may charge platform fees,
                                subscription fees, or transaction fees as described on the Platform
                                and in your account agreement.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Payment Processing.
                                </strong>{" "}
                                All payments on the Platform are processed through Stripe, our
                                third-party payment processor. By using the Platform&apos;s payment
                                features, you agree to Stripe&apos;s terms of service and privacy
                                policy. You authorize Splits Network and Stripe to charge your
                                designated payment method for all fees and charges incurred. Payment
                                information is transmitted securely and is never stored on our
                                servers.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Payment Terms.
                                </strong>{" "}
                                Placement fees are due within thirty (30) days of a confirmed
                                placement start date. Split-fee payments to recruiting partners are
                                processed after the placement fee has been received and the
                                guarantee period has been satisfied. The standard guarantee period
                                is ninety (90) days from the candidate&apos;s start date, unless
                                otherwise specified in the placement agreement.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Refunds and Guarantees.
                                </strong>{" "}
                                If a placed candidate does not complete the guarantee period, a
                                pro-rated refund or replacement search will be offered in accordance
                                with the terms of the specific placement agreement. Disputes
                                regarding fees or payments must be raised within thirty (30) days
                                of the transaction date.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Taxes.
                                </strong>{" "}
                                You are responsible for all applicable taxes associated with your
                                use of the Platform and any fees or payments received through the
                                Platform. Splits Network does not provide tax advice, and you should
                                consult with a qualified tax professional regarding your tax
                                obligations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 8 -- Intellectual Property
                Article block
               ================================================================= */}
            <section id="ip" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            08 -- Ownership
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Intellectual property.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    Platform Ownership.
                                </strong>{" "}
                                All content, features, functionality, design, code, trademarks,
                                logos, and other intellectual property comprising the Splits Network
                                platform are owned by Employment Networks, Inc. or our licensors and
                                are protected by United States and international copyright,
                                trademark, patent, trade secret, and other intellectual property
                                laws.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Limited License.
                                </strong>{" "}
                                We grant you a limited, non-exclusive, non-transferable, revocable
                                license to access and use the Platform for its intended purpose,
                                subject to these Terms. This license does not include the right to
                                reproduce, distribute, modify, create derivative works from,
                                publicly display, publicly perform, reverse engineer, or otherwise
                                exploit any part of the Platform without our prior written consent.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Your Content.
                                </strong>{" "}
                                You retain ownership of any content you submit to the Platform,
                                including profile information, job descriptions, candidate
                                summaries, and communications (&ldquo;User Content&rdquo;). By
                                submitting User Content, you grant Splits Network a worldwide,
                                non-exclusive, royalty-free license to use, reproduce, modify,
                                display, and distribute your User Content solely for the purpose of
                                operating and improving the Platform. This license terminates when
                                you delete your content or account, except where your content has
                                been shared with others who have not deleted it.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Restrictions.
                                </strong>{" "}
                                You may not: sell, trade, or transfer your Platform access to any
                                third party; use any automated tools to scrape, extract, or harvest
                                data from the Platform; remove, alter, or obscure any copyright,
                                trademark, or other proprietary notices; or use Platform trademarks
                                or branding without express written permission.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                PULL QUOTE 2
               ================================================================= */}
            <section className="pull-quote-block py-20 bg-secondary text-secondary-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary-content/20 mb-6 block"></i>
                        <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            &ldquo;Your content, your rights. We provide the
                            platform, you own the work.&rdquo;
                        </blockquote>
                        <cite className="text-sm uppercase tracking-[0.2em] text-secondary-content/50 not-italic">
                            -- Splits Network
                        </cite>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 9 -- AI-Powered Features & Automated Processing
                Article block
               ================================================================= */}
            <section id="ai-features" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            09 -- Artificial Intelligence
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            AI-powered features &<br />
                            automated processing.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    AI Features Overview.
                                </strong>{" "}
                                The Platform incorporates artificial intelligence and machine
                                learning features powered by OpenAI (ChatGPT) technology. These
                                features include, but are not limited to: intelligent candidate-to-job
                                matching, personalized job recommendations, an AI-powered chat
                                assistant for platform guidance, automated candidate profile analysis,
                                and skill-based matching algorithms.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Data Processing for AI.
                                </strong>{" "}
                                By using the Platform, you consent to the processing of your data by
                                AI systems. This includes the analysis of your profile information,
                                job preferences, search history, and interactions on the Platform to
                                generate matches, recommendations, and insights. Your data may be
                                transmitted to OpenAI&apos;s servers for processing in accordance
                                with their data processing agreements. We implement appropriate
                                safeguards to protect your data during AI processing.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    AI Limitations.
                                </strong>{" "}
                                AI-generated matches, recommendations, and responses are provided for
                                informational purposes and as decision-support tools. They do not
                                constitute professional advice, guarantees of employment, or
                                assurances of candidate quality. AI outputs may contain
                                inaccuracies, biases, or errors. You should exercise your own
                                judgment and conduct your own due diligence before making hiring,
                                career, or business decisions based on AI-generated information.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Automated Decision-Making.
                                </strong>{" "}
                                Certain Platform features involve automated processing that may
                                influence which candidates, jobs, or partners are displayed to you.
                                No fully automated decisions are made regarding employment or
                                contractual outcomes without human review. All final placement
                                decisions are made by human users of the Platform.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Opt-Out Rights.
                                </strong>{" "}
                                You have the right to opt out of AI-powered features and automated
                                data processing. To exercise this right, contact us at{" "}
                                <a
                                    href="mailto:privacy@splits.network"
                                    className="text-secondary underline"
                                >
                                    privacy@splits.network
                                </a>
                                . Please note that opting out may limit the availability of certain
                                Platform features, including personalized matching and
                                recommendations. You may also request a human review of any
                                decision that was significantly influenced by automated processing.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    AI Content.
                                </strong>{" "}
                                Content generated by AI features on the Platform (including match
                                summaries, recommendations, and chat responses) is provided &ldquo;as
                                is&rdquo; without warranty of accuracy, completeness, or fitness for
                                any purpose. You are responsible for reviewing and verifying any
                                AI-generated content before relying on it.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 10 -- Privacy
                Article block
               ================================================================= */}
            <section id="privacy" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            10 -- Data Protection
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Privacy.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                Your privacy is critically important to us. Our collection, use, and
                                protection of your personal information is governed by our{" "}
                                <Link
                                    href="/privacy-policy"
                                    className="text-secondary underline"
                                >
                                    Privacy Policy
                                </Link>
                                , which is incorporated into these Terms by reference. By using the
                                Platform, you consent to the practices described in our Privacy
                                Policy.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Analytics and Tracking.
                                </strong>{" "}
                                The Platform uses Google Analytics (GA4) for platform analytics and
                                usage measurement, and Microsoft Clarity for user experience analysis
                                including session recordings and heatmaps. These tools collect
                                anonymized and aggregated data about how users interact with the
                                Platform to help us identify issues, improve features, and enhance
                                the overall user experience. For detailed information about cookies
                                and tracking technologies, please review our{" "}
                                <Link
                                    href="/cookie-policy"
                                    className="text-secondary underline"
                                >
                                    Cookie Policy
                                </Link>
                                .
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Third-Party Data Processors.
                                </strong>{" "}
                                In the course of providing our services, your data may be processed
                                by the following third-party service providers: Clerk (authentication
                                and account management), Stripe (payment processing), Supabase
                                (database infrastructure), OpenAI (AI-powered features), Google
                                (analytics), and Microsoft (UX analytics). Each of these providers
                                operates under their own privacy policies and data processing
                                agreements.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Data Security.
                                </strong>{" "}
                                We implement industry-standard security measures including
                                encryption in transit (TLS 1.3) and at rest (AES-256), role-based
                                access controls, multi-factor authentication, continuous security
                                monitoring, and regular security audits. While we take reasonable
                                measures to protect your data, no system can guarantee absolute
                                security.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                PULL QUOTE 3
               ================================================================= */}
            <section className="pull-quote-block py-20 bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="border-l-4 border-secondary pl-8 lg:pl-12">
                            <i className="fa-duotone fa-regular fa-quote-left text-4xl text-secondary/30 mb-6 block"></i>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                                &ldquo;Privacy is the foundation of trust.
                                Without it, no marketplace can thrive.&rdquo;
                            </blockquote>
                            <cite className="text-sm uppercase tracking-[0.2em] text-neutral-content/50 not-italic">
                                -- Splits Network
                            </cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 11 -- Disclaimers & Limitation of Liability
                Article block
               ================================================================= */}
            <section id="disclaimers" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            11 -- Legal Protections
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Disclaimers & limitation
                            <br />
                            of liability.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    AS-IS Service.
                                </strong>{" "}
                                THE PLATFORM AND ALL CONTENT, FEATURES, AND SERVICES ARE PROVIDED
                                &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
                                WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR
                                OTHERWISE. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO
                                IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                                PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE
                                OF DEALING OR USAGE OF TRADE.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    No Guarantees.
                                </strong>{" "}
                                We do not warrant that the Platform will be uninterrupted, secure,
                                or error-free, that defects will be corrected, that the Platform is
                                free of viruses or other harmful components, or that any content or
                                information on the Platform is accurate, reliable, or complete. We
                                make no guarantees regarding the success of placements, the quality
                                of candidates or job opportunities, or the reliability of any user
                                on the Platform.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Independent Relationship.
                                </strong>{" "}
                                Splits Network is a platform provider, not an employer, recruiter,
                                or staffing agency. All users are independent parties. We are not
                                responsible for the actions, omissions, or conduct of any user. We
                                do not verify the accuracy of user-provided information except as
                                expressly stated.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Limitation of Liability.
                                </strong>{" "}
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, EMPLOYMENT
                                NETWORKS, INC. AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS,
                                AFFILIATES, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT,
                                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
                                BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES,
                                OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM,
                                REGARDLESS OF THE THEORY OF LIABILITY. OUR TOTAL AGGREGATE LIABILITY
                                SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN
                                THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED
                                DOLLARS ($100).
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    AI Disclaimer.
                                </strong>{" "}
                                We specifically disclaim all liability for AI-generated content,
                                recommendations, and matching results. AI features are provided as
                                decision-support tools and should not be the sole basis for any
                                hiring, employment, or business decision.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 12 -- Indemnification
                Article block
               ================================================================= */}
            <section id="indemnification" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            12 -- Your Responsibility
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Indemnification.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                You agree to indemnify, defend, and hold harmless Employment
                                Networks, Inc. and its officers, directors, employees, agents,
                                affiliates, successors, and assigns (&ldquo;Indemnified
                                Parties&rdquo;) from and against any and all claims, damages,
                                losses, liabilities, costs, and expenses (including reasonable
                                attorneys&apos; fees and court costs) arising out of or related to:
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Your use of or access to the Platform",
                                    "Your violation of these Terms or any applicable law or regulation",
                                    "Your User Content, including any claim that your content infringes or violates the intellectual property, privacy, or other rights of any third party",
                                    "Any disputes between you and other Platform users, including disputes related to placements, fees, or payments",
                                    "Your negligence or willful misconduct in connection with your use of the Platform",
                                    "Any misrepresentation made by you regarding your qualifications, authority, or eligibility",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <span className="text-sm font-bold text-secondary/60 w-6 flex-shrink-0 mt-1">
                                            {String.fromCharCode(97 + i)}.
                                        </span>
                                        <p className="text-base text-base-content/70 leading-relaxed">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p>
                                We reserve the right, at your expense, to assume the exclusive
                                defense and control of any matter for which you are required to
                                indemnify us, and you agree to cooperate with our defense of such
                                claims. You agree not to settle any such matter without our prior
                                written consent.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 13 -- Termination
                Article block
               ================================================================= */}
            <section id="termination" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            13 -- Account Closure
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Termination.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    Termination by You.
                                </strong>{" "}
                                You may terminate your account at any time by contacting our support
                                team at{" "}
                                <a
                                    href="mailto:support@splits.network"
                                    className="text-secondary underline"
                                >
                                    support@splits.network
                                </a>{" "}
                                or through the account settings within the Platform. Upon
                                termination, your right to use the Platform will cease immediately.
                                Any outstanding obligations, including unpaid fees or pending
                                placements, will survive termination.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Termination by Splits Network.
                                </strong>{" "}
                                We reserve the right to suspend or terminate your account, with or
                                without notice, for any reason, including but not limited to:
                                violation of these Terms; fraudulent, abusive, or illegal activity;
                                repeated misconduct or professional violations; non-payment of fees
                                or outstanding balances; extended inactivity (accounts inactive for
                                more than twelve consecutive months); or at our sole discretion if
                                we believe your continued use poses a risk to the Platform, its
                                users, or our business.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Effect of Termination.
                                </strong>{" "}
                                Upon termination, your license to use the Platform is immediately
                                revoked. We may delete your account data in accordance with our
                                Privacy Policy and data retention schedule. The following provisions
                                survive termination: Intellectual Property, Disclaimers, Limitation
                                of Liability, Indemnification, Dispute Resolution, and Governing
                                Law. Any accrued rights or obligations, including payment
                                obligations, will not be affected by termination.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Data After Termination.
                                </strong>{" "}
                                Upon account termination, you may request a copy of your data in a
                                machine-readable format by contacting{" "}
                                <a
                                    href="mailto:privacy@splits.network"
                                    className="text-secondary underline"
                                >
                                    privacy@splits.network
                                </a>{" "}
                                within thirty (30) days. After this period, we may delete your data
                                in accordance with our retention policies, except where retention is
                                required by law.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 14 -- Dispute Resolution
                Article block
               ================================================================= */}
            <section id="disputes" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            14 -- Resolving Disagreements
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Dispute resolution.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                <strong className="text-base-content font-bold">
                                    Informal Resolution.
                                </strong>{" "}
                                Before initiating any formal dispute resolution proceeding, you
                                agree to first attempt to resolve any dispute, claim, or controversy
                                arising out of or relating to these Terms or the Platform
                                (&ldquo;Dispute&rdquo;) informally by contacting us at{" "}
                                <a
                                    href="mailto:legal@splits.network"
                                    className="text-secondary underline"
                                >
                                    legal@splits.network
                                </a>
                                . The parties will attempt in good faith to resolve the Dispute
                                within thirty (30) days of written notice.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Mediation.
                                </strong>{" "}
                                If the Dispute cannot be resolved informally, the parties agree to
                                submit the Dispute to non-binding mediation administered by a
                                mutually agreed-upon mediator before resorting to arbitration or
                                litigation. Mediation shall take place within sixty (60) days of the
                                end of the informal resolution period. The costs of mediation shall
                                be shared equally between the parties.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Binding Arbitration.
                                </strong>{" "}
                                If the Dispute is not resolved through mediation, it shall be
                                resolved by binding arbitration administered by the American
                                Arbitration Association (&ldquo;AAA&rdquo;) in accordance with its
                                Commercial Arbitration Rules. The arbitration shall be conducted by a
                                single arbitrator in the State of Delaware. The arbitrator&apos;s
                                decision shall be final and binding, and judgment on the award may be
                                entered in any court of competent jurisdiction.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Class Action Waiver.
                                </strong>{" "}
                                YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED
                                ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR
                                REPRESENTATIVE ACTION. You expressly waive any right to participate
                                in a class action lawsuit or class-wide arbitration.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Exceptions.
                                </strong>{" "}
                                Notwithstanding the above, either party may seek injunctive or
                                other equitable relief in any court of competent jurisdiction to
                                prevent the actual or threatened infringement of intellectual
                                property rights, breach of confidentiality obligations, or other
                                irreparable harm.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 15 -- Governing Law
                Article block
               ================================================================= */}
            <section id="governing-law" className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            15 -- Jurisdiction
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Governing law.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                These Terms of Service and any Dispute arising out of or related to
                                them or the Platform shall be governed by and construed in
                                accordance with the laws of the State of Delaware, United States of
                                America, without regard to its conflict of law principles.
                            </p>
                            <p>
                                For any matters not subject to arbitration under these Terms, you
                                agree to submit to the personal and exclusive jurisdiction of the
                                state and federal courts located in the State of Delaware. You waive
                                any objection to the exercise of jurisdiction over you by such
                                courts and to venue in such courts.
                            </p>
                            <p>
                                If you are accessing the Platform from outside the United States,
                                you are responsible for compliance with all applicable local laws.
                                Nothing in these Terms shall be construed to limit any rights or
                                remedies available to you under the mandatory consumer protection
                                laws of your jurisdiction of residence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                SECTION 16 -- Changes to Terms
                Article block
               ================================================================= */}
            <section id="changes" className="py-28 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            16 -- Updates
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Changes to terms.
                        </h2>
                        <div className="space-y-6 text-base-content/70 leading-relaxed text-lg">
                            <p>
                                We reserve the right to modify, update, or replace these Terms at
                                any time at our sole discretion. When we make changes, we will
                                update the &ldquo;Last Updated&rdquo; date at the top of these
                                Terms and post the revised version on the Platform.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Material Changes.
                                </strong>{" "}
                                For material changes that significantly affect your rights or
                                obligations, we will provide at least thirty (30) days&apos; advance
                                notice before the changes take effect. Notice will be provided
                                through one or more of the following methods: email notification to
                                the address associated with your account, prominent notice within the
                                Platform, or announcement on our website.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Acceptance of Changes.
                                </strong>{" "}
                                Your continued use of the Platform after the effective date of any
                                changes constitutes your acceptance of the revised Terms. If you do
                                not agree to the revised Terms, you must stop using the Platform and
                                may terminate your account in accordance with Section 13.
                            </p>
                            <p>
                                <strong className="text-base-content font-bold">
                                    Version History.
                                </strong>{" "}
                                We maintain previous versions of these Terms for reference. You may
                                request a copy of any prior version by contacting{" "}
                                <a
                                    href="mailto:legal@splits.network"
                                    className="text-secondary underline"
                                >
                                    legal@splits.network
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                CROSS-LINKS
               ================================================================= */}
            <section className="py-28 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="article-block max-w-3xl mx-auto opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Related Policies
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-10">
                            Further reading.
                        </h2>
                        <div className="space-y-6">
                            <Link
                                href="/privacy-policy"
                                className="flex items-center gap-6 p-6 bg-base-100 border-l-4 border-secondary hover:bg-base-300 transition-colors group"
                            >
                                <div className="w-12 h-12 flex-shrink-0 bg-secondary/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-shield-check text-secondary text-xl"></i>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-base-content group-hover:text-secondary transition-colors">
                                        Privacy Policy
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        How we collect, use, and protect your personal
                                        information
                                    </p>
                                </div>
                                <i className="fa-duotone fa-regular fa-arrow-right text-secondary opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </Link>

                            <Link
                                href="/cookie-policy"
                                className="flex items-center gap-6 p-6 bg-base-100 border-l-4 border-secondary hover:bg-base-300 transition-colors group"
                            >
                                <div className="w-12 h-12 flex-shrink-0 bg-secondary/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-cookie text-secondary text-xl"></i>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-base-content group-hover:text-secondary transition-colors">
                                        Cookie Policy
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        How we use cookies and tracking technologies
                                    </p>
                                </div>
                                <i className="fa-duotone fa-regular fa-arrow-right text-secondary opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
                CONTACT CTA
               ================================================================= */}
            <section className="final-cta py-28 bg-secondary text-secondary-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="final-cta-content max-w-4xl mx-auto text-center opacity-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-content/50 mb-6">
                            <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                            Contact Us
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-8">
                            Questions about
                            <br />
                            these terms?
                        </h2>
                        <p className="text-xl text-secondary-content/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Employment Networks, Inc. is here to help. Reach out to our
                            legal team for any questions, concerns, or requests related to
                            these Terms of Service.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-12">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 bg-secondary-content/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-scale-balanced text-secondary-content text-xl"></i>
                                </div>
                                <p className="text-sm font-semibold uppercase tracking-wider mb-1">
                                    Legal Questions
                                </p>
                                <a
                                    href="mailto:legal@splits.network"
                                    className="underline text-secondary-content/80 hover:text-secondary-content transition-colors"
                                >
                                    legal@splits.network
                                </a>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 bg-secondary-content/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-headset text-secondary-content text-xl"></i>
                                </div>
                                <p className="text-sm font-semibold uppercase tracking-wider mb-1">
                                    General Support
                                </p>
                                <a
                                    href="mailto:support@splits.network"
                                    className="underline text-secondary-content/80 hover:text-secondary-content transition-colors"
                                >
                                    support@splits.network
                                </a>
                            </div>
                        </div>

                        <div className="text-sm text-secondary-content/50">
                            <p>Employment Networks, Inc.</p>
                            <p>
                                Last updated: February 20, 2026
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
