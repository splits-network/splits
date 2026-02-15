"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

const PROFILE = {
    name: "Marcus Thompson",
    title: "Senior Technical Recruiter",
    company: "Talent Partners Inc.",
    location: "San Francisco, CA",
    email: "marcus@talentpartners.com",
    phone: "+1 (555) 234-5678",
    joined: "March 2023",
    bio: "Experienced technical recruiter with 8+ years specializing in engineering and product roles at high-growth startups and Fortune 500 companies. Known for building genuine relationships and maintaining a 95%+ candidate satisfaction rate. Passionate about connecting exceptional talent with transformative opportunities.",
    stats: [
        { label: "Placements", value: "147", color: C.coral },
        { label: "Success Rate", value: "94%", color: C.teal },
        { label: "Avg. Days to Fill", value: "28", color: C.yellow },
        { label: "Rating", value: "4.9", color: C.purple },
    ],
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Kubernetes", "System Design", "Machine Learning", "Product Management", "Data Engineering"],
    specializations: ["Software Engineering", "Product Management", "DevOps / SRE", "Data Science"],
};

const EXPERIENCE = [
    { role: "Senior Technical Recruiter", company: "Talent Partners Inc.", period: "2023 - Present", desc: "Leading engineering recruitment for Series B-D startups. 47 placements in 2 years.", color: C.coral },
    { role: "Technical Recruiter", company: "HireRight Solutions", period: "2020 - 2023", desc: "Specialized in frontend and full-stack roles. Built referral network of 500+ engineers.", color: C.teal },
    { role: "Recruitment Coordinator", company: "BigTech Corp", period: "2018 - 2020", desc: "Coordinated hiring for engineering teams. Managed 200+ candidates through pipeline.", color: C.purple },
];

const ACTIVITY = [
    { action: "Placed a candidate", detail: "Senior Frontend Engineer at TechCorp", time: "2 hours ago", icon: "fa-duotone fa-regular fa-trophy", color: C.coral },
    { action: "Submitted 3 candidates", detail: "Backend Engineer at DataDriven", time: "5 hours ago", icon: "fa-duotone fa-regular fa-paper-plane", color: C.teal },
    { action: "Split-fee agreement", detail: "60/40 split with Sarah Kim", time: "1 day ago", icon: "fa-duotone fa-regular fa-handshake", color: C.yellow },
    { action: "New job assignment", detail: "VP of Engineering at RocketLab", time: "2 days ago", icon: "fa-duotone fa-regular fa-briefcase", color: C.purple },
    { action: "Received 5-star review", detail: "From candidate Priya Sharma", time: "3 days ago", icon: "fa-duotone fa-regular fa-star", color: C.coral },
];

const RELATED = [
    { name: "Sarah Kim", title: "Contract Specialist", placements: 55, color: C.teal },
    { name: "David Chen", title: "Executive Search", placements: 18, color: C.purple },
    { name: "Emily Rodriguez", title: "Tech Recruiter", placements: 39, color: C.coral },
];

export default function ProfilesSixPage() {
    const [activeTab, setActiveTab] = useState<"about" | "activity" | "reviews">("about");
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(pageRef.current.querySelector(".profile-header"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        gsap.fromTo(pageRef.current.querySelectorAll(".stat-block"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.08, delay: 0.3 });
        gsap.fromTo(pageRef.current.querySelectorAll(".profile-section"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)", stagger: 0.1, delay: 0.5 });
    }, []);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.cream }}>
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Profile Header */}
            <div className="profile-header border-b-4" style={{ backgroundColor: C.dark, borderColor: C.dark }}>
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-28 h-28 border-4 flex items-center justify-center"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral }}>
                                    <span className="text-4xl font-black" style={{ color: C.white }}>MT</span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center border-2"
                                    style={{ backgroundColor: C.teal, borderColor: C.dark }}>
                                    <i className="fa-solid fa-check text-xs" style={{ color: C.dark }}></i>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                                        style={{ backgroundColor: C.teal, color: C.dark }}>Verified</span>
                                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                                        style={{ backgroundColor: C.yellow, color: C.dark }}>Top Performer</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-1" style={{ color: C.white }}>
                                    {PROFILE.name}
                                </h1>
                                <p className="text-sm font-bold mb-3" style={{ color: C.coral }}>{PROFILE.title}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    <span><i className="fa-duotone fa-regular fa-building mr-1" style={{ color: C.coral }}></i>{PROFILE.company}</span>
                                    <span><i className="fa-duotone fa-regular fa-location-dot mr-1" style={{ color: C.teal }}></i>{PROFILE.location}</span>
                                    <span><i className="fa-duotone fa-regular fa-calendar mr-1" style={{ color: C.yellow }}></i>Joined {PROFILE.joined}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button className="w-10 h-10 flex items-center justify-center border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: "rgba(255,255,255,0.2)", color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-share-nodes text-sm"></i>
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: "rgba(255,255,255,0.2)", color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-bookmark text-sm"></i>
                                </button>
                                <button className="px-5 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                    style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>
                                    <i className="fa-duotone fa-regular fa-comment text-xs"></i>Message
                                </button>
                                <button className="px-5 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-handshake text-xs"></i>Connect
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {PROFILE.stats.map((stat, i) => (
                                <div key={i} className="stat-block border-3 p-4 text-center"
                                    style={{ borderColor: stat.color, backgroundColor: "rgba(255,255,255,0.03)" }}>
                                    <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b-4" style={{ backgroundColor: C.white, borderColor: C.dark }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto flex">
                        {([
                            { key: "about" as const, label: "About", icon: "fa-duotone fa-regular fa-user", color: C.coral },
                            { key: "activity" as const, label: "Recent Activity", icon: "fa-duotone fa-regular fa-clock-rotate-left", color: C.teal },
                            { key: "reviews" as const, label: "Reviews", icon: "fa-duotone fa-regular fa-star", color: C.yellow },
                        ]).map((tab) => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className="px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-4 -mb-1 transition-colors"
                                style={{ borderColor: activeTab === tab.key ? tab.color : "transparent", color: activeTab === tab.key ? C.dark : "rgba(26,26,46,0.4)" }}>
                                <i className={`${tab.icon} text-xs`} style={{ color: activeTab === tab.key ? tab.color : undefined }}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-10">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === "about" && (
                            <>
                                {/* Bio */}
                                <div className="profile-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                    <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                        <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
                                            <i className="fa-duotone fa-regular fa-user text-xs" style={{ color: C.white }}></i>
                                        </span>About
                                    </h2>
                                    <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.7 }}>{PROFILE.bio}</p>
                                </div>

                                {/* Specializations */}
                                <div className="profile-section border-4 p-8" style={{ borderColor: C.teal, backgroundColor: C.white }}>
                                    <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                        <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                            <i className="fa-duotone fa-regular fa-bullseye text-xs" style={{ color: C.dark }}></i>
                                        </span>Specializations
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {PROFILE.specializations.map((s) => (
                                            <span key={s} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-3"
                                                style={{ borderColor: C.teal, color: C.dark }}>{s}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                        <i className="fa-duotone fa-regular fa-tags text-xs" style={{ color: C.yellow }}></i>Recruiting For
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {PROFILE.skills.map((s) => {
                                            const colors = [C.coral, C.teal, C.yellow, C.purple];
                                            return (
                                                <span key={s} className="px-2 py-1 text-[10px] font-bold uppercase border-2"
                                                    style={{ borderColor: colors[PROFILE.skills.indexOf(s) % 4], color: C.dark }}>{s}</span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="profile-section border-4 p-8" style={{ borderColor: C.purple, backgroundColor: C.white }}>
                                    <h2 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: C.dark }}>
                                        <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.purple }}>
                                            <i className="fa-duotone fa-regular fa-timeline text-xs" style={{ color: C.white }}></i>
                                        </span>Experience
                                    </h2>
                                    <div className="relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: "rgba(26,26,46,0.1)" }} />
                                        <div className="space-y-6">
                                            {EXPERIENCE.map((exp, i) => (
                                                <div key={i} className="flex items-start gap-5 relative">
                                                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border-3 relative z-10"
                                                        style={{ borderColor: exp.color, backgroundColor: C.white }}>
                                                        <i className="fa-duotone fa-regular fa-briefcase text-xs" style={{ color: exp.color }}></i>
                                                    </div>
                                                    <div className="flex-1 border-3 p-4" style={{ borderColor: exp.color }}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="text-sm font-black uppercase tracking-wide" style={{ color: C.dark }}>{exp.role}</h4>
                                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5"
                                                                style={{ backgroundColor: exp.color, color: exp.color === C.yellow ? C.dark : C.white }}>{exp.period}</span>
                                                        </div>
                                                        <p className="text-xs font-semibold mb-1" style={{ color: exp.color }}>{exp.company}</p>
                                                        <p className="text-xs" style={{ color: C.dark, opacity: 0.6 }}>{exp.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "activity" && (
                            <div className="profile-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                <h2 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: C.dark }}>
                                    <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-xs" style={{ color: C.dark }}></i>
                                    </span>Recent Activity
                                </h2>
                                <div className="space-y-4">
                                    {ACTIVITY.map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 border-3 transition-transform hover:-translate-y-0.5"
                                            style={{ borderColor: item.color }}>
                                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                                                style={{ backgroundColor: item.color }}>
                                                <i className={`${item.icon} text-sm`} style={{ color: item.color === C.yellow ? C.dark : C.white }}></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold" style={{ color: C.dark }}>{item.action}</p>
                                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>{item.detail}</p>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: C.dark, opacity: 0.3 }}>{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="profile-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                <h2 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: C.dark }}>
                                    <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.yellow }}>
                                        <i className="fa-duotone fa-regular fa-star text-xs" style={{ color: C.dark }}></i>
                                    </span>Reviews (24)
                                </h2>
                                {[
                                    { name: "Priya S.", role: "Software Engineer", rating: 5, text: "Marcus was incredible throughout the entire process. He understood exactly what I was looking for and matched me with a role that exceeded expectations.", color: C.coral },
                                    { name: "David L.", role: "VP of Talent", rating: 5, text: "Consistently delivers top-tier candidates. Marcus has become our go-to recruiter for senior engineering hires.", color: C.teal },
                                    { name: "Jennifer W.", role: "Product Manager", rating: 4, text: "Great communication and follow-through. Kept me updated at every stage. Would definitely recommend.", color: C.purple },
                                ].map((review, i) => (
                                    <div key={i} className="border-3 p-5 mb-4" style={{ borderColor: review.color }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 flex items-center justify-center border-2 rounded-full"
                                                    style={{ borderColor: review.color, backgroundColor: review.color }}>
                                                    <span className="text-xs font-black" style={{ color: review.color === C.yellow ? C.dark : C.white }}>
                                                        {review.name.split(" ").map(n => n[0]).join("")}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase" style={{ color: C.dark }}>{review.name}</p>
                                                    <p className="text-[10px]" style={{ color: C.dark, opacity: 0.5 }}>{review.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, si) => (
                                                    <i key={si} className={`${si < review.rating ? "fa-solid" : "fa-regular"} fa-star text-xs`}
                                                        style={{ color: C.yellow }}></i>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.7 }}>{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact */}
                        <div className="border-4 p-6" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
                                    <i className="fa-duotone fa-regular fa-address-card text-xs" style={{ color: C.white }}></i>
                                </span>Contact Info
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <i className="fa-duotone fa-regular fa-envelope text-xs" style={{ color: C.coral }}></i>
                                    <span style={{ color: C.dark, opacity: 0.7 }}>{PROFILE.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <i className="fa-duotone fa-regular fa-phone text-xs" style={{ color: C.teal }}></i>
                                    <span style={{ color: C.dark, opacity: 0.7 }}>{PROFILE.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <i className="fa-brands fa-linkedin-in text-xs" style={{ color: C.purple }}></i>
                                    <span style={{ color: C.dark, opacity: 0.7 }}>linkedin.com/in/marcust</span>
                                </div>
                            </div>
                        </div>

                        {/* Related Recruiters */}
                        <div className="border-4 p-6" style={{ borderColor: C.teal, backgroundColor: C.white }}>
                            <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                    <i className="fa-duotone fa-regular fa-users text-xs" style={{ color: C.dark }}></i>
                                </span>Similar Recruiters
                            </h3>
                            <div className="space-y-3">
                                {RELATED.map((r, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 border-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
                                        style={{ borderColor: r.color }}>
                                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 rounded-full"
                                            style={{ borderColor: r.color, backgroundColor: r.color }}>
                                            <span className="text-xs font-black" style={{ color: r.color === C.yellow ? C.dark : C.white }}>
                                                {r.name.split(" ").map(n => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black uppercase truncate" style={{ color: C.dark }}>{r.name}</p>
                                            <p className="text-[10px]" style={{ color: C.dark, opacity: 0.5 }}>{r.title}</p>
                                        </div>
                                        <span className="text-sm font-black" style={{ color: r.color }}>{r.placements}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="border-4 p-6" style={{ borderColor: C.yellow, backgroundColor: C.white }}>
                            <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.yellow }}>
                                    <i className="fa-duotone fa-regular fa-calendar-check text-xs" style={{ color: C.dark }}></i>
                                </span>Availability
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.teal }} />
                                <span className="text-sm font-bold" style={{ color: C.teal }}>Currently Available</span>
                            </div>
                            <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Open to new split-fee partnerships and direct assignments.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
