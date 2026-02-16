"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const profile = {
    name: "Sarah Chen",
    title: "Senior Technical Recruiter",
    agency: "TechHire Partners",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&auto=format&fit=crop",
    bio: "Passionate about connecting exceptional talent with companies building the future. Specializing in senior engineering, product, and design roles at high-growth startups and FAANG companies. Over 8 years of experience in technical recruiting with a focus on creating meaningful matches that last.",
    email: "sarah@techhire.com",
    phone: "+1 (415) 555-0142",
    linkedin: "linkedin.com/in/sarachen",
    website: "techhirepartners.com",
    joined: "March 2022",
    verified: true,
};

const stats = [
    {
        value: "247",
        label: "Placements",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    { value: "4.9", label: "Rating", icon: "fa-duotone fa-regular fa-star" },
    {
        value: "96%",
        label: "Success Rate",
        icon: "fa-duotone fa-regular fa-chart-line",
    },
    {
        value: "18 days",
        label: "Avg. Time-to-Fill",
        icon: "fa-duotone fa-regular fa-clock",
    },
];

const skills = [
    "Engineering",
    "Product",
    "Design",
    "Executive Search",
    "Startups",
    "FAANG",
    "Backend",
    "Frontend",
    "Full-Stack",
    "AI/ML",
    "Data Science",
    "DevOps",
];

const experience = [
    {
        period: "2022 - Present",
        role: "Senior Partner",
        company: "TechHire Partners",
        desc: "Leading technical recruiting for Series A-C startups. Built a network of 500+ engineering leaders.",
    },
    {
        period: "2019 - 2022",
        role: "Technical Recruiter",
        company: "Scale Recruiting",
        desc: "Focused on backend and infrastructure roles. Achieved 120% of placement targets consistently.",
    },
    {
        period: "2017 - 2019",
        role: "Associate Recruiter",
        company: "Talent Bridge",
        desc: "Started career in agency recruiting. Developed specialization in software engineering roles.",
    },
];

const recentActivity = [
    {
        type: "placement",
        text: "Placed a Staff Engineer at Notion",
        time: "2 hours ago",
        icon: "fa-duotone fa-regular fa-handshake",
        color: "text-success",
    },
    {
        type: "listing",
        text: "Posted new role: Senior Product Designer at Stripe",
        time: "5 hours ago",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "text-primary",
    },
    {
        type: "milestone",
        text: "Reached 247 career placements",
        time: "1 day ago",
        icon: "fa-duotone fa-regular fa-trophy",
        color: "text-warning",
    },
    {
        type: "review",
        text: "Received 5-star review from Airbnb hiring manager",
        time: "2 days ago",
        icon: "fa-duotone fa-regular fa-star",
        color: "text-warning",
    },
    {
        type: "connection",
        text: "Connected with 12 new candidates this week",
        time: "3 days ago",
        icon: "fa-duotone fa-regular fa-user-plus",
        color: "text-info",
    },
];

const recentPlacements = [
    {
        title: "Staff Software Engineer",
        company: "Notion",
        salary: "$240k",
        date: "Feb 2026",
    },
    {
        title: "VP of Engineering",
        company: "Linear",
        salary: "$320k",
        date: "Jan 2026",
    },
    {
        title: "Senior Product Designer",
        company: "Figma",
        salary: "$195k",
        date: "Jan 2026",
    },
    {
        title: "Engineering Manager",
        company: "Stripe",
        salary: "$280k",
        date: "Dec 2025",
    },
];

const relatedProfiles = [
    {
        name: "Michael Torres",
        role: "Backend Specialist",
        agency: "Scale Recruiting",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        placements: 189,
        rating: 4.8,
    },
    {
        name: "Jessica Park",
        role: "Creative Recruiter",
        agency: "CreativeEdge Talent",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        placements: 134,
        rating: 4.7,
    },
    {
        name: "David Kim",
        role: "Data & ML Recruiter",
        agency: "DataTalent Group",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        placements: 167,
        rating: 4.9,
    },
];

export default function ProfileFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                return;
            const $ = (s: string) => containerRef.current!.querySelectorAll(s);
            const $1 = (s: string) => containerRef.current!.querySelector(s);

            gsap.fromTo(
                $1(".cin-profile-info"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    delay: 0.2,
                },
            );
            gsap.fromTo(
                $(".cin-stat"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".cin-stats"),
                        start: "top 85%",
                    },
                },
            );
            $(".cin-section").forEach((s) =>
                gsap.fromTo(
                    s,
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: "power3.out",
                        scrollTrigger: { trigger: s, start: "top 82%" },
                    },
                ),
            );
            gsap.fromTo(
                $(".cin-timeline-entry"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: $1(".cin-experience"),
                        start: "top 80%",
                    },
                },
            );
            gsap.fromTo(
                $(".cin-related-card"),
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-related"),
                        start: "top 85%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100">
            {/* Cover */}
            <div className="relative h-48 md:h-64 overflow-hidden bg-neutral">
                <img
                    src={profile.cover}
                    alt=""
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-neutral/60" />
            </div>

            {/* Profile Header */}
            <div className="cin-profile-info max-w-5xl mx-auto px-6 -mt-16 relative z-10 opacity-0">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-28 h-28 rounded-2xl object-cover ring-4 ring-base-100 shadow-xl"
                    />
                    <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="text-3xl md:text-4xl font-black">
                                {profile.name}
                            </h1>
                            {profile.verified && (
                                <span className="badge badge-primary font-semibold">
                                    <i className="fa-duotone fa-regular fa-badge-check mr-1" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <p className="text-base-content/50 font-medium text-lg">
                            {profile.title}
                        </p>
                        <p className="text-sm text-base-content/40">
                            {profile.agency}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-base-content/40">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-location-dot text-primary" />
                                {profile.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-calendar text-primary" />
                                Joined {profile.joined}
                            </span>
                            <a
                                href="#"
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                            >
                                <i className="fa-brands fa-linkedin text-primary" />
                                {profile.linkedin}
                            </a>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0 pt-2">
                        <button className="btn btn-primary font-semibold">
                            <i className="fa-duotone fa-regular fa-comment" />
                            Message
                        </button>
                        <button className="btn bg-base-200 border-base-content/10 font-semibold">
                            <i className="fa-duotone fa-regular fa-user-plus" />
                            Connect
                        </button>
                        <button className="btn btn-ghost btn-square">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                        </button>
                        <button className="btn btn-ghost btn-square">
                            <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="cin-stats max-w-5xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="cin-stat bg-base-200 rounded-xl p-4 text-center opacity-0"
                        >
                            <i
                                className={`${s.icon} text-primary text-lg mb-2 block`}
                            />
                            <div className="text-2xl font-black">{s.value}</div>
                            <div className="text-xs text-base-content/40 font-medium uppercase tracking-wider">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* About */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                About
                            </h2>
                            <p className="text-base-content/70 leading-relaxed">
                                {profile.bio}
                            </p>
                        </section>

                        {/* Skills */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                Specializations
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((s, i) => (
                                    <span
                                        key={i}
                                        className="badge badge-lg bg-primary/10 text-primary border-0 font-medium"
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="cin-section cin-experience opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-6">
                                Experience
                            </h2>
                            <div className="space-y-0">
                                {experience.map((exp, i) => (
                                    <div
                                        key={i}
                                        className="cin-timeline-entry flex gap-4 pb-6 last:pb-0 relative opacity-0"
                                    >
                                        {i < experience.length - 1 && (
                                            <div className="absolute left-[15px] top-8 w-px h-[calc(100%-16px)] bg-base-content/10" />
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                                            <i className="fa-duotone fa-regular fa-briefcase text-primary text-xs" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-primary font-semibold mb-1">
                                                {exp.period}
                                            </div>
                                            <h3 className="font-bold">
                                                {exp.role}
                                            </h3>
                                            <p className="text-sm text-base-content/50 font-medium">
                                                {exp.company}
                                            </p>
                                            <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
                                                {exp.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Placements */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                Recent Placements
                            </h2>
                            <div className="space-y-3">
                                {recentPlacements.map((p, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3"
                                    >
                                        <div>
                                            <div className="font-bold text-sm">
                                                {p.title}
                                            </div>
                                            <div className="text-xs text-base-content/40">
                                                {p.company}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm text-primary">
                                                {p.salary}
                                            </div>
                                            <div className="text-xs text-base-content/30">
                                                {p.date}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Activity Feed */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-6">
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {recentActivity.map((a, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                                            <i
                                                className={`${a.icon} ${a.color} text-xs`}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-base-content/70">
                                                {a.text}
                                            </p>
                                            <span className="text-xs text-base-content/30">
                                                {a.time}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <div className="cin-section border border-base-content/5 rounded-xl p-5 opacity-0">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                Contact
                            </h3>
                            <div className="space-y-3 text-sm">
                                <a
                                    href="#"
                                    className="flex items-center gap-3 text-base-content/50 hover:text-primary transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-envelope w-5 text-center" />
                                    {profile.email}
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 text-base-content/50 hover:text-primary transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-phone w-5 text-center" />
                                    {profile.phone}
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 text-base-content/50 hover:text-primary transition-colors"
                                >
                                    <i className="fa-duotone fa-regular fa-globe w-5 text-center" />
                                    {profile.website}
                                </a>
                            </div>
                        </div>

                        <div className="cin-section bg-neutral text-white rounded-xl p-5 opacity-0">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
                                Hire Sarah
                            </h3>
                            <p className="text-sm text-white/50 mb-4 leading-relaxed">
                                Looking for top talent? Sarah specializes in
                                senior technical roles at high-growth companies.
                            </p>
                            <button className="btn btn-primary btn-block font-semibold">
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Work Together
                            </button>
                        </div>

                        <div className="cin-section border border-base-content/5 rounded-xl p-5 opacity-0">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
                                Availability
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-success" />
                                <span className="text-sm font-medium">
                                    Taking new clients
                                </span>
                            </div>
                            <p className="text-xs text-base-content/40">
                                Typically responds within 4 hours
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Related */}
            <section className="cin-related bg-base-200 py-14">
                <div className="max-w-5xl mx-auto px-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">
                        Network
                    </p>
                    <h2 className="text-2xl font-black mb-8">
                        Similar Recruiters
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {relatedProfiles.map((r, i) => (
                            <div
                                key={i}
                                className="cin-related-card bg-base-100 border border-base-content/5 rounded-xl p-5 text-center hover:shadow-lg hover:border-coral/20 transition-all cursor-pointer group opacity-0"
                            >
                                <img
                                    src={r.avatar}
                                    alt={r.name}
                                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-2 ring-primary/20"
                                />
                                <h3 className="font-black group-hover:text-primary transition-colors">
                                    {r.name}
                                </h3>
                                <p className="text-xs text-base-content/40 mb-1">
                                    {r.role}
                                </p>
                                <p className="text-xs text-base-content/30 mb-3">
                                    {r.agency}
                                </p>
                                <div className="flex justify-center gap-4 text-xs text-base-content/40">
                                    <span>
                                        <strong className="text-base-content">
                                            {r.placements}
                                        </strong>{" "}
                                        placements
                                    </span>
                                    <span>
                                        <i className="fa-solid fa-star text-warning text-[10px]" />{" "}
                                        {r.rating}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
