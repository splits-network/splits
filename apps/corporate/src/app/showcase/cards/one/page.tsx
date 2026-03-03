"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { RoleCardEditorial } from "./role-card-editorial";
import { CandidateCardEditorial } from "./candidate-card-editorial";
import { ApplicationCardEditorial } from "./application-card-editorial";
import { PlacementCardEditorial } from "./placement-card-editorial";
import { CompanyCardEditorial } from "./company-card-editorial";
import { MatchCardEditorial } from "./match-card-editorial";
import {
    SAMPLE_ROLES,
    SAMPLE_CANDIDATES,
    SAMPLE_APPLICATIONS,
    SAMPLE_PLACEMENTS,
    SAMPLE_COMPANIES,
    SAMPLE_MATCHES,
} from "./data";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */

function CardSection({
    kicker,
    title,
    description,
    children,
    accentColor = "text-primary",
}: {
    kicker: string;
    title: string;
    description: string;
    children: React.ReactNode;
    accentColor?: string;
}) {
    return (
        <div className="cards-section opacity-0 mb-20">
            <div className="mb-8">
                <p
                    className={`text-sm font-semibold uppercase tracking-[0.2em] ${accentColor} mb-1`}
                >
                    {kicker}
                </p>
                <h2 className="text-3xl font-black tracking-tight mb-2">
                    {title}
                </h2>
                <p className="text-sm text-base-content/50 max-w-xl">
                    {description}
                </p>
            </div>
            {children}
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function CardsOne() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(
                $1(".cards-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" },
            )
                .fromTo(
                    $(".cards-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        clearProps: "transform",
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".cards-desc"),
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        clearProps: "transform",
                    },
                    "-=0.4",
                );

            $(".cards-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        clearProps: "transform",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                        },
                    },
                );
            });
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Hero Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="cards-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Design System — Editorial Cards
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="cards-title-word inline-block opacity-0">
                                Card
                            </span>{" "}
                            <span className="cards-title-word inline-block opacity-0 text-primary">
                                showcase.
                            </span>
                        </h1>
                        <p className="cards-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            The complete editorial card library for the Splits
                            Network platform. Each card follows Basel design
                            principles — sharp corners, typography-driven
                            hierarchy, and semantic color tokens.
                        </p>
                    </div>
                </div>
            </section>

            {/* Card Showcase */}
            <section className="container mx-auto px-6 lg:px-12 py-14 lg:py-20">
                {/* ── Roles ──────────────────────────────────────────── */}
                <CardSection
                    kicker="Roles"
                    title="Role Cards"
                    description="Job listings with salary, split fee, urgency indicators, and skills. The primary card for browsing open positions."
                >
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {SAMPLE_ROLES.map((role) => (
                            <RoleCardEditorial key={role.title} role={role} />
                        ))}
                    </div>
                </CardSection>

                {/* ── Candidates ─────────────────────────────────────── */}
                <CardSection
                    kicker="Candidates"
                    title="Candidate Cards"
                    description="Candidate profiles with status indicators, skills, availability, and work preferences. Shows the talent side of the marketplace."
                    accentColor="text-secondary"
                >
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {SAMPLE_CANDIDATES.map((candidate) => (
                            <CandidateCardEditorial
                                key={candidate.name}
                                candidate={candidate}
                            />
                        ))}
                    </div>
                </CardSection>

                {/* ── Applications ───────────────────────────────────── */}
                <CardSection
                    kicker="Applications"
                    title="Application Cards"
                    description="Track submissions through the hiring pipeline with progress indicators, match scores, and split agreements."
                    accentColor="text-accent"
                >
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {SAMPLE_APPLICATIONS.map((application) => (
                            <ApplicationCardEditorial
                                key={application.candidateName}
                                application={application}
                            />
                        ))}
                    </div>
                </CardSection>

                {/* ── Placements ─────────────────────────────────────── */}
                <CardSection
                    kicker="Placements"
                    title="Placement Cards"
                    description="Celebrate completed placements with dual avatars, fee breakdowns, split partner details, and guarantee status."
                    accentColor="text-success"
                >
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {SAMPLE_PLACEMENTS.map((placement) => (
                            <PlacementCardEditorial
                                key={placement.candidateName}
                                placement={placement}
                            />
                        ))}
                    </div>
                </CardSection>

                {/* ── Companies ──────────────────────────────────────── */}
                <CardSection
                    kicker="Companies"
                    title="Company Cards"
                    description="Employer profiles with hiring status, tech stack, perks, and key stats. Shows the demand side of the marketplace."
                    accentColor="text-warning"
                >
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {SAMPLE_COMPANIES.map((company) => (
                            <CompanyCardEditorial
                                key={company.name}
                                company={company}
                            />
                        ))}
                    </div>
                </CardSection>

                {/* ── Matches ────────────────────────────────────────── */}
                <CardSection
                    kicker="Matches"
                    title="Match Cards"
                    description="Visualize candidate-role pairings with match scores, skill overlap analysis, and recruiter attribution."
                    accentColor="text-info"
                >
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {SAMPLE_MATCHES.map((match) => (
                            <MatchCardEditorial
                                key={match.candidateName}
                                match={match}
                            />
                        ))}
                    </div>
                </CardSection>

                {/* ── Divider ────────────────────────────────────────── */}
                <div className="cards-section opacity-0 mb-20">
                    <div className="border-t border-base-300 pt-12">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-1 bg-base-300" />
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/30">
                                Legacy Reference
                            </p>
                            <div className="flex-1 h-px bg-base-300" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-base-content/40 mb-2">
                            Brief Cards
                        </h2>
                        <p className="text-sm text-base-content/30 max-w-xl">
                            Lightweight card variants from the original design.
                            These compact cards are suitable for dense list views
                            and quick-scan layouts where full editorial detail is
                            not needed.
                        </p>
                    </div>
                </div>

                {/* ── Brief Cards: Jobs ──────────────────────────────── */}
                <BriefJobCards />

                {/* ── Brief Cards: Recruiters ────────────────────────── */}
                <BriefRecruiterCards />

                {/* ── Brief Cards: Companies ─────────────────────────── */}
                <BriefCompanyCards />

                {/* ── Brief Cards: Candidates ────────────────────────── */}
                <BriefCandidateCards />
            </section>
        </main>
    );
}

/* ─── Brief Card Data (original compact cards) ───────────────────────────── */

const briefJobs = [
    {
        id: "j1",
        title: "Senior Full-Stack Engineer",
        company: "TechCorp",
        initials: "TC",
        location: "Remote",
        salary: "$180k-$220k",
        split: "20%",
        tags: ["React", "Node.js", "AWS"],
        applicants: 34,
    },
    {
        id: "j2",
        title: "VP of Engineering",
        company: "DataFlow",
        initials: "DF",
        location: "San Francisco",
        salary: "$250k-$300k",
        split: "25%",
        tags: ["Leadership", "Scale"],
        applicants: 12,
    },
    {
        id: "j3",
        title: "Product Manager",
        company: "InnovateCo",
        initials: "IC",
        location: "Remote",
        salary: "$160k-$185k",
        split: "20%",
        tags: ["B2B SaaS", "PLG"],
        applicants: 28,
    },
];

const briefRecruiters = [
    {
        id: "r1",
        name: "Sarah Kim",
        initials: "SK",
        specialty: "Engineering",
        placements: 47,
        rating: 4.9,
        location: "San Francisco",
        online: true,
    },
    {
        id: "r2",
        name: "Marcus Chen",
        initials: "MC",
        specialty: "Executive",
        placements: 31,
        rating: 4.8,
        location: "New York",
        online: true,
    },
    {
        id: "r3",
        name: "Elena Volkov",
        initials: "EV",
        specialty: "Data & AI",
        placements: 28,
        rating: 4.7,
        location: "Remote",
        online: false,
    },
];

const briefCompanies = [
    {
        id: "c1",
        name: "TechCorp",
        initials: "TC",
        industry: "Enterprise Software",
        openRoles: 12,
        size: "500-1000",
        stage: "Series C",
    },
    {
        id: "c2",
        name: "DataFlow Inc",
        initials: "DF",
        industry: "Data Analytics",
        openRoles: 8,
        size: "200-500",
        stage: "Series B",
    },
];

const briefCandidates = [
    {
        id: "ca1",
        name: "Alex Novak",
        initials: "AN",
        role: "Full-Stack Engineer",
        experience: "7 years",
        skills: ["React", "Node.js", "Go"],
        status: "Active",
        match: 95,
    },
    {
        id: "ca2",
        name: "Diana Wu",
        initials: "DW",
        role: "Product Manager",
        experience: "5 years",
        skills: ["Strategy", "Analytics", "B2B"],
        status: "Active",
        match: 88,
    },
];

/* ─── Brief Card Components (inline, compact) ────────────────────────────── */

function BriefJobCards() {
    return (
        <div className="cards-section opacity-0 mb-14">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/30 mb-1">
                        Brief Cards
                    </p>
                    <h3 className="text-xl font-black tracking-tight text-base-content/50">
                        Jobs
                    </h3>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {briefJobs.map((job) => (
                    <div
                        key={job.id}
                        className="bg-base-200 p-5 border border-base-300 hover:border-primary/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                                {job.initials}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">
                                    {job.title}
                                </h3>
                                <p className="text-xs text-base-content/40">
                                    {job.company}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-1 text-xs text-base-content/50 mb-3">
                            <div className="flex justify-between">
                                <span>{job.location}</span>
                                <span className="font-semibold text-primary">
                                    {job.salary}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>{job.applicants} applicants</span>
                                <span>{job.split} fee</span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {job.tags.map((t) => (
                                <span
                                    key={t}
                                    className="px-2 py-0.5 bg-base-100 text-sm font-semibold text-base-content/40"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BriefRecruiterCards() {
    return (
        <div className="cards-section opacity-0 mb-14">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/30 mb-1">
                        Brief Cards
                    </p>
                    <h3 className="text-xl font-black tracking-tight text-base-content/50">
                        Recruiters
                    </h3>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {briefRecruiters.map((r) => (
                    <div
                        key={r.id}
                        className="bg-base-200 p-5 border border-base-300 hover:border-primary/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-11 h-11 bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                                    {r.initials}
                                </div>
                                {r.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-base-200" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{r.name}</h3>
                                <p className="text-xs text-base-content/40">
                                    {r.specialty}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center mb-3">
                            <div className="bg-base-100 p-2">
                                <div className="text-lg font-black text-primary">
                                    {r.placements}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-base-content/40">
                                    Placements
                                </div>
                            </div>
                            <div className="bg-base-100 p-2">
                                <div className="text-lg font-black text-secondary">
                                    {r.rating}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-base-content/40">
                                    Rating
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-base-content/40 flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {r.location}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BriefCompanyCards() {
    return (
        <div className="cards-section opacity-0 mb-14">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/30 mb-1">
                        Brief Cards
                    </p>
                    <h3 className="text-xl font-black tracking-tight text-base-content/50">
                        Companies
                    </h3>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {briefCompanies.map((c) => (
                    <div
                        key={c.id}
                        className="bg-base-200 p-6 border border-base-300 hover:border-secondary/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg">
                                {c.initials}
                            </div>
                            <div>
                                <h3 className="font-bold">{c.name}</h3>
                                <p className="text-xs text-base-content/40">
                                    {c.industry}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div className="text-xl font-black text-secondary">
                                    {c.openRoles}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-base-content/40">
                                    Roles
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold">
                                    {c.size}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-base-content/40">
                                    Size
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold">
                                    {c.stage}
                                </div>
                                <div className="text-sm uppercase tracking-wider text-base-content/40">
                                    Stage
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BriefCandidateCards() {
    return (
        <div className="cards-section opacity-0">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/30 mb-1">
                        Brief Cards
                    </p>
                    <h3 className="text-xl font-black tracking-tight text-base-content/50">
                        Candidates
                    </h3>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {briefCandidates.map((c) => (
                    <div
                        key={c.id}
                        className="bg-base-200 p-5 border border-base-300 hover:border-accent/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-accent text-accent-content flex items-center justify-center font-bold text-sm">
                                    {c.initials}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">
                                        {c.name}
                                    </h3>
                                    <p className="text-xs text-base-content/40">
                                        {c.role}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-accent">
                                    {c.match}%
                                </div>
                                <div className="text-sm uppercase tracking-wider text-base-content/40">
                                    Match
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-base-content/50 mb-3">
                            <span>{c.experience}</span>
                            <span className="text-base-content/20">|</span>
                            <span
                                className={
                                    c.status === "Active"
                                        ? "text-success font-semibold"
                                        : "text-base-content/40"
                                }
                            >
                                {c.status}
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {c.skills.map((s) => (
                                <span
                                    key={s}
                                    className="px-2 py-0.5 bg-accent/10 text-accent text-sm font-semibold"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
