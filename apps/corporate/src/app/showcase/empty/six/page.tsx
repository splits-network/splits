"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Memphis Colors ─────────────────────────────────────────────────────────
const C = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

// ─── Memphis Illustration: Search Empty ─────────────────────────────────────
function SearchEmptyIllustration() {
    return (
        <div className="relative w-36 h-36 mx-auto mb-6">
            {/* Magnifying glass body */}
            <div className="absolute top-2 left-6 w-24 h-24 rounded-full border-[6px]"
                style={{ borderColor: C.coral }} />
            {/* Handle */}
            <div className="absolute bottom-0 right-3 w-4 h-14 rotate-45 origin-top-left"
                style={{ backgroundColor: C.coral, borderRadius: "0 0 4px 4px" }} />
            {/* X inside */}
            <div className="absolute top-8 left-12 w-12 h-12 flex items-center justify-center">
                <i className="fa-solid fa-xmark text-2xl" style={{ color: C.coral, opacity: 0.4 }}></i>
            </div>
            {/* Memphis shapes */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rotate-12" style={{ backgroundColor: C.yellow }} />
            <div className="absolute -bottom-1 -left-2 w-5 h-5 rounded-full" style={{ backgroundColor: C.teal }} />
            <div className="absolute top-1 -left-4 w-4 h-4 rotate-45 border-2" style={{ borderColor: C.purple }} />
        </div>
    );
}

// ─── Memphis Illustration: First Time ───────────────────────────────────────
function FirstTimeIllustration() {
    return (
        <div className="relative w-36 h-36 mx-auto mb-6">
            {/* Big plus */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ backgroundColor: C.teal }} />
                    <div className="w-6 h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ backgroundColor: C.teal }} />
                </div>
            </div>
            {/* Dashed circle */}
            <div className="absolute inset-3 rounded-full border-[3px] border-dashed"
                style={{ borderColor: C.teal, opacity: 0.4 }} />
            {/* Memphis accents */}
            <div className="absolute -top-2 right-2 w-5 h-5 rounded-full" style={{ backgroundColor: C.coral }} />
            <div className="absolute bottom-0 -left-1 w-6 h-6 rotate-45" style={{ backgroundColor: C.yellow }} />
            <svg className="absolute -top-3 left-4 opacity-50" width="20" height="20" viewBox="0 0 20 20">
                <line x1="10" y1="2" x2="10" y2="18" stroke={C.purple} strokeWidth="3" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" stroke={C.purple} strokeWidth="3" strokeLinecap="round" />
            </svg>
        </div>
    );
}

// ─── Memphis Illustration: Error State ──────────────────────────────────────
function ErrorIllustration() {
    return (
        <div className="relative w-36 h-36 mx-auto mb-6">
            {/* Warning triangle */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div style={{
                    width: 0, height: 0,
                    borderLeft: "50px solid transparent",
                    borderRight: "50px solid transparent",
                    borderBottom: `87px solid ${C.yellow}`,
                }} />
            </div>
            {/* Exclamation mark */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <div className="w-2 h-8" style={{ backgroundColor: C.dark }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.dark }} />
            </div>
            {/* Memphis accents */}
            <div className="absolute -top-1 -right-2 w-5 h-5 rounded-full border-3" style={{ borderColor: C.coral }} />
            <div className="absolute -bottom-2 -left-1 w-4 h-4 rotate-12" style={{ backgroundColor: C.purple }} />
            <svg className="absolute top-2 -left-4 opacity-40" width="30" height="12" viewBox="0 0 30 12">
                <polyline points="0,10 5,2 10,10 15,2 20,10 25,2 30,10" fill="none" stroke={C.coral} strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
    );
}

// ─── Memphis Illustration: Access Denied ────────────────────────────────────
function AccessDeniedIllustration() {
    return (
        <div className="relative w-36 h-36 mx-auto mb-6">
            {/* Lock body */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-16 border-[5px]"
                style={{ borderColor: C.purple, backgroundColor: C.purple }} />
            {/* Shackle */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-12 rounded-t-full border-[5px] border-b-0"
                style={{ borderColor: C.purple }} />
            {/* Keyhole */}
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: C.dark }} />
                <div className="w-2 h-3 -mt-1" style={{ backgroundColor: C.dark }} />
            </div>
            {/* Memphis accents */}
            <div className="absolute -top-1 -left-2 w-5 h-5 rounded-full" style={{ backgroundColor: C.coral }} />
            <div className="absolute -bottom-1 -right-3 w-6 h-6 rotate-45 border-2" style={{ borderColor: C.teal }} />
            <div className="absolute top-10 -right-4 w-4 h-4 rounded-full" style={{ backgroundColor: C.yellow }} />
        </div>
    );
}

// ─── Empty State Card ───────────────────────────────────────────────────────
function EmptyStateCard({
    title,
    subtitle,
    description,
    illustration,
    actions,
    color,
    className = "",
}: {
    title: string;
    subtitle: string;
    description: string;
    illustration: React.ReactNode;
    actions: { label: string; icon: string; primary: boolean; color: string }[];
    color: string;
    className?: string;
}) {
    return (
        <div className={`empty-card border-4 overflow-hidden ${className}`}
            style={{ borderColor: color, backgroundColor: C.white }}>
            {/* Top strip */}
            <div className="h-1.5" style={{ backgroundColor: color }} />

            {/* Badge */}
            <div className="pt-6 px-8">
                <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ backgroundColor: color, color: color === C.yellow ? C.dark : C.white }}>
                    {subtitle}
                </span>
            </div>

            <div className="p-8 text-center">
                {illustration}

                <h3 className="text-xl font-black uppercase tracking-wider mb-3"
                    style={{ color: C.dark }}>
                    {title}
                </h3>

                <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
                    style={{ color: C.dark, opacity: 0.6 }}>
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {actions.map((action, i) => (
                        <button key={i}
                            className="px-6 py-3 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                            style={{
                                borderColor: action.color,
                                backgroundColor: action.primary ? action.color : "transparent",
                                color: action.primary
                                    ? (action.color === C.yellow ? C.dark : C.white)
                                    : action.color,
                            }}>
                            <i className={`${action.icon} text-xs`}></i>
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function EmptySixPage() {
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(
            pageRef.current.querySelector(".page-heading"),
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        );

        const cards = pageRef.current.querySelectorAll(".empty-card");
        cards.forEach((card) => {
            gsap.fromTo(
                card,
                { opacity: 0, y: 50, scale: 0.92, rotation: -2 },
                {
                    opacity: 1, y: 0, scale: 1, rotation: 0,
                    duration: 0.5, ease: "back.out(1.7)",
                    scrollTrigger: { trigger: card, start: "top 85%" },
                },
            );
        });

        // Float Memphis shapes
        const shapes = pageRef.current.querySelectorAll(".memphis-bg-shape");
        shapes.forEach((shape, i) => {
            gsap.to(shape, {
                y: `+=${8 + (i % 3) * 4}`,
                x: `+=${4 + (i % 2) * 6}`,
                rotation: `+=${(i % 2 === 0 ? 1 : -1) * (4 + i * 2)}`,
                duration: 3 + i * 0.4,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });
        });
    }, []);

    return (
        <div ref={pageRef} className="min-h-screen relative overflow-hidden" style={{ backgroundColor: C.dark }}>
            {/* Memphis Background Shapes */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="memphis-bg-shape absolute top-[6%] left-[4%] w-20 h-20 rounded-full border-[4px] opacity-15" style={{ borderColor: C.coral }} />
                <div className="memphis-bg-shape absolute top-[40%] right-[5%] w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: C.teal }} />
                <div className="memphis-bg-shape absolute bottom-[18%] left-[8%] w-12 h-12 rotate-45 opacity-10" style={{ backgroundColor: C.yellow }} />
                <div className="memphis-bg-shape absolute top-[22%] right-[15%] w-14 h-14 rotate-12 opacity-12" style={{ backgroundColor: C.purple }} />
                <div className="memphis-bg-shape absolute bottom-[30%] right-[25%] w-10 h-10 rounded-full border-3 opacity-10" style={{ borderColor: C.coral }} />
                <div className="memphis-bg-shape absolute top-[65%] left-[20%] opacity-10"
                    style={{ width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: `35px solid ${C.teal}` }} />
                <svg className="memphis-bg-shape absolute bottom-[12%] right-[35%] opacity-10" width="80" height="25" viewBox="0 0 80 25">
                    <polyline points="0,20 10,5 20,20 30,5 40,20 50,5 60,20 70,5 80,20" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <svg className="memphis-bg-shape absolute top-[80%] left-[45%] opacity-10" width="30" height="30" viewBox="0 0 30 30">
                    <line x1="15" y1="3" x2="15" y2="27" stroke={C.yellow} strokeWidth="3" strokeLinecap="round" />
                    <line x1="3" y1="15" x2="27" y2="15" stroke={C.yellow} strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            {/* Color Bar */}
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16">
                {/* Header */}
                <div className="page-heading text-center mb-16 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] mb-6"
                        style={{ backgroundColor: C.purple, color: C.white }}>
                        <i className="fa-duotone fa-regular fa-ghost"></i>
                        Empty States
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-4"
                        style={{ color: C.white }}>
                        Nothing{" "}
                        <span className="relative inline-block">
                            <span style={{ color: C.purple }}>Here</span>
                            <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: C.purple }} />
                        </span>
                        {" "}Yet
                    </h1>
                    <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
                        When there&apos;s nothing to show, make the emptiness engaging and helpful.
                    </p>
                </div>

                {/* Empty States Grid */}
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* 1. No Search Results */}
                    <EmptyStateCard
                        title="No Results Found"
                        subtitle="Empty Search"
                        description="We couldn't find any jobs matching your search criteria. Try broadening your filters or using different keywords to discover more opportunities."
                        illustration={<SearchEmptyIllustration />}
                        color={C.coral}
                        actions={[
                            { label: "Reset Filters", icon: "fa-duotone fa-regular fa-rotate-left", primary: true, color: C.coral },
                            { label: "Browse All Jobs", icon: "fa-duotone fa-regular fa-grid-2", primary: false, color: C.dark },
                        ]}
                    />

                    {/* 2. First Time / No Data */}
                    <EmptyStateCard
                        title="Welcome Aboard!"
                        subtitle="Getting Started"
                        description="Your dashboard is empty because you haven't created any job listings yet. Post your first role and start receiving applications from top recruiters in the network."
                        illustration={<FirstTimeIllustration />}
                        color={C.teal}
                        actions={[
                            { label: "Create First Job", icon: "fa-duotone fa-regular fa-plus", primary: true, color: C.teal },
                            { label: "Watch Tutorial", icon: "fa-duotone fa-regular fa-circle-play", primary: false, color: C.dark },
                        ]}
                    />

                    {/* 3. Error State */}
                    <EmptyStateCard
                        title="Something Went Wrong"
                        subtitle="Error"
                        description="We hit a snag loading your data. This is usually temporary. Try refreshing the page, and if the problem persists, our team has already been notified."
                        illustration={<ErrorIllustration />}
                        color={C.yellow}
                        actions={[
                            { label: "Try Again", icon: "fa-duotone fa-regular fa-rotate-right", primary: true, color: C.yellow },
                            { label: "Contact Support", icon: "fa-duotone fa-regular fa-headset", primary: false, color: C.dark },
                        ]}
                    />

                    {/* 4. Access Denied */}
                    <EmptyStateCard
                        title="Access Restricted"
                        subtitle="Permissions"
                        description="You don't have permission to view this content. This area is restricted to users with the appropriate role. Contact your organization admin to request access."
                        illustration={<AccessDeniedIllustration />}
                        color={C.purple}
                        actions={[
                            { label: "Request Access", icon: "fa-duotone fa-regular fa-paper-plane", primary: true, color: C.purple },
                            { label: "Go to Dashboard", icon: "fa-duotone fa-regular fa-grid-2", primary: false, color: C.dark },
                        ]}
                    />
                </div>

                {/* Inline Empty States */}
                <div className="max-w-5xl mx-auto mt-16">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em]"
                            style={{ backgroundColor: C.yellow, color: C.dark }}>
                            <i className="fa-duotone fa-regular fa-rectangle-wide mr-2"></i>
                            Inline Variants
                        </span>
                        <div className="flex-1 h-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                    </div>

                    <div className="space-y-6">
                        {/* Compact: No Messages */}
                        <div className="border-4 p-6 flex items-center gap-6" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3"
                                style={{ borderColor: C.teal }}>
                                <i className="fa-duotone fa-regular fa-comments text-xl" style={{ color: C.teal }}></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>
                                    No Messages Yet
                                </h4>
                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>
                                    Start a conversation with a recruiter or company to see your messages here.
                                </p>
                            </div>
                            <button className="px-4 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex-shrink-0"
                                style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>
                                Start Chat
                            </button>
                        </div>

                        {/* Compact: No Candidates */}
                        <div className="border-4 p-6 flex items-center gap-6" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3"
                                style={{ borderColor: C.coral }}>
                                <i className="fa-duotone fa-regular fa-user-group text-xl" style={{ color: C.coral }}></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>
                                    No Candidates in Pipeline
                                </h4>
                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>
                                    Submit your first candidate to this job to begin tracking their progress.
                                </p>
                            </div>
                            <button className="px-4 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex-shrink-0"
                                style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                Submit Candidate
                            </button>
                        </div>

                        {/* Compact: No Notifications */}
                        <div className="border-4 p-6 flex items-center gap-6" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3"
                                style={{ borderColor: C.purple }}>
                                <i className="fa-duotone fa-regular fa-bell text-xl" style={{ color: C.purple }}></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>
                                    All Caught Up
                                </h4>
                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>
                                    You have no new notifications. We&apos;ll let you know when something needs your attention.
                                </p>
                            </div>
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                                style={{ backgroundColor: C.purple }}>
                                <i className="fa-solid fa-check text-sm" style={{ color: C.white }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
