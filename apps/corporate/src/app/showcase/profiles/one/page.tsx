"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

/* ─── Data ───────────────────────────────────────────────────────────────── */

const profile = {
    name: "Sarah Kim", initials: "SK", title: "Senior Technical Recruiter", location: "San Francisco, CA",
    email: "sarah@example.com", phone: "+1 (415) 555-0142", linkedin: "linkedin.com/in/sarahkim",
    bio: "Veteran technical recruiter with 8+ years specializing in engineering and product placements. Built talent pipelines for 50+ startups from Series A through IPO. Passionate about connecting exceptional talent with companies that value culture fit alongside technical excellence.",
    online: true, memberSince: "March 2023", verified: true,
    stats: [
        { label: "Placements", value: "47", icon: "fa-duotone fa-regular fa-trophy" },
        { label: "Success Rate", value: "94%", icon: "fa-duotone fa-regular fa-bullseye" },
        { label: "Avg Time-to-Fill", value: "28d", icon: "fa-duotone fa-regular fa-clock" },
        { label: "Rating", value: "4.9", icon: "fa-duotone fa-regular fa-star" },
    ],
    specializations: ["Engineering", "Product", "Data Science", "DevOps", "Machine Learning"],
    industries: ["SaaS", "Fintech", "Healthcare Tech", "Developer Tools"],
    experience: [
        { title: "Senior Technical Recruiter", company: "Splits Network", period: "2023 - Present", description: "Top-performing recruiter on the marketplace. 47 placements across engineering and product roles." },
        { title: "Technical Recruiter", company: "TalentBridge", period: "2020 - 2023", description: "Built engineering pipelines for Series A-C startups. Specialized in hard-to-fill senior roles." },
        { title: "Recruiting Coordinator", company: "BigTech Corp", period: "2018 - 2020", description: "Coordinated hiring for 200+ engineering roles annually. Developed interview process improvements." },
    ],
    recentActivity: [
        { action: "Placed a Senior Engineer at TechCorp", time: "2 days ago", icon: "fa-duotone fa-regular fa-trophy", color: "text-success" },
        { action: "Submitted 3 candidates to DataFlow VP role", time: "4 days ago", icon: "fa-duotone fa-regular fa-paper-plane", color: "text-primary" },
        { action: "Earned Pro Recruiter badge", time: "1 week ago", icon: "fa-duotone fa-regular fa-award", color: "text-warning" },
        { action: "Completed 5-star review from InnovateCo", time: "2 weeks ago", icon: "fa-duotone fa-regular fa-star", color: "text-accent" },
    ],
    testimonials: [
        { text: "Sarah consistently delivers exceptional candidates. Her understanding of our engineering culture is unmatched.", author: "Priya Patel", role: "VP Talent, TechCorp", initials: "PP" },
        { text: "The fastest placement we have ever had. Sarah had qualified candidates within 48 hours.", author: "Robert Tanaka", role: "CTO, DataFlow", initials: "RT" },
    ],
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ProfilesOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [activeTab, setActiveTab] = useState<"about" | "experience" | "reviews">("about");

    useGSAP(() => {
        if (!mainRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => mainRef.current!.querySelectorAll(s);
        const $1 = (s: string) => mainRef.current!.querySelector(s);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".profile-avatar"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 })
          .fromTo($1(".profile-name"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
          .fromTo($(".profile-meta"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, "-=0.3")
          .fromTo($(".profile-stat"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.2")
          .fromTo($(".profile-action"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 }, "-=0.2");

        $(".profile-section").forEach((section) => {
            gsap.fromTo(section, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 85%" } });
        });
    }, { scope: mainRef });

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="absolute top-0 right-0 w-2/5 h-full bg-primary/10" style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }} />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                        <div className="flex items-start gap-6 flex-1">
                            <div className="profile-avatar opacity-0 relative">
                                <div className="w-24 h-24 lg:w-28 lg:h-28 bg-primary text-primary-content flex items-center justify-center font-black text-3xl">{profile.initials}</div>
                                {profile.online && <div className="absolute bottom-1 right-1 w-5 h-5 bg-success border-3 border-neutral rounded-full" />}
                                {profile.verified && <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary text-secondary-content flex items-center justify-center rounded-full"><i className="fa-solid fa-check text-[10px]" /></div>}
                            </div>
                            <div className="profile-name opacity-0">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-2">{profile.name}</h1>
                                <p className="text-lg text-neutral-content/60 mb-3">{profile.title}</p>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { icon: "fa-duotone fa-regular fa-location-dot", text: profile.location },
                                        { icon: "fa-duotone fa-regular fa-calendar", text: `Member since ${profile.memberSince}` },
                                    ].map((m) => (
                                        <span key={m.text} className="profile-meta opacity-0 flex items-center gap-1.5 text-sm text-neutral-content/40">
                                            <i className={`${m.icon} text-xs`} />{m.text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button className="profile-action opacity-0 btn btn-primary"><i className="fa-duotone fa-regular fa-comments" /> Message</button>
                            <button className="profile-action opacity-0 btn btn-ghost border-neutral-content/20"><i className="fa-duotone fa-regular fa-user-plus" /> Connect</button>
                            <button className="profile-action opacity-0 btn btn-ghost border-neutral-content/20"><i className="fa-duotone fa-regular fa-share-nodes" /> Share</button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                        {profile.stats.map((stat) => (
                            <div key={stat.label} className="profile-stat opacity-0 bg-neutral-content/5 p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 flex items-center justify-center"><i className={`${stat.icon} text-primary`} /></div>
                                <div><div className="text-xl font-black">{stat.value}</div><div className="text-[10px] uppercase tracking-widest opacity-40">{stat.label}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex gap-0">
                        {(["about", "experience", "reviews"] as const).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all capitalize ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-base-content/40 hover:text-base-content/60"}`}>{tab}</button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    <div className="lg:col-span-3">
                        {activeTab === "about" && (
                            <>
                                <div className="profile-section opacity-0 mb-10">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2"><i className="fa-duotone fa-regular fa-user text-primary" /> About</h2>
                                    <p className="text-base-content/70 leading-relaxed">{profile.bio}</p>
                                </div>
                                <div className="profile-section opacity-0 mb-10">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2"><i className="fa-duotone fa-regular fa-bullseye text-primary" /> Specializations</h2>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {profile.specializations.map((s) => <span key={s} className="px-3 py-1.5 bg-primary text-primary-content text-xs font-semibold">{s}</span>)}
                                    </div>
                                    <h3 className="text-sm font-bold text-base-content/50 mb-2">Industries</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.industries.map((ind) => <span key={ind} className="px-3 py-1.5 bg-base-200 text-base-content/60 text-xs font-semibold border border-base-300">{ind}</span>)}
                                    </div>
                                </div>
                                <div className="profile-section opacity-0">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2"><i className="fa-duotone fa-regular fa-clock-rotate-left text-primary" /> Recent Activity</h2>
                                    <div className="space-y-3">
                                        {profile.recentActivity.map((a, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-base-200">
                                                <i className={`${a.icon} ${a.color}`} />
                                                <div className="flex-1"><p className="text-sm">{a.action}</p><p className="text-[10px] text-base-content/30">{a.time}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "experience" && (
                            <div className="profile-section opacity-0">
                                <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2"><i className="fa-duotone fa-regular fa-briefcase text-primary" /> Experience</h2>
                                <div className="space-y-0">
                                    {profile.experience.map((exp, i) => (
                                        <div key={i} className="flex gap-4 pb-8 relative">
                                            {i < profile.experience.length - 1 && <div className="absolute left-[18px] top-10 bottom-0 w-px bg-base-300" />}
                                            <div className="w-9 h-9 bg-primary text-primary-content flex items-center justify-center flex-shrink-0 z-10"><i className="fa-duotone fa-regular fa-briefcase text-xs" /></div>
                                            <div className="flex-1">
                                                <h3 className="font-bold">{exp.title}</h3>
                                                <p className="text-sm text-primary font-semibold">{exp.company}</p>
                                                <p className="text-xs text-base-content/40 mb-2">{exp.period}</p>
                                                <p className="text-sm text-base-content/60 leading-relaxed">{exp.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="profile-section opacity-0">
                                <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2"><i className="fa-duotone fa-regular fa-star text-primary" /> Reviews</h2>
                                <div className="space-y-4">
                                    {profile.testimonials.map((t, i) => (
                                        <div key={i} className="border-l-4 border-primary bg-base-200 p-6">
                                            <i className="fa-duotone fa-regular fa-quote-left text-2xl text-primary/20 mb-3 block" />
                                            <p className="text-base-content/70 leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-secondary text-secondary-content flex items-center justify-center font-bold text-xs">{t.initials}</div>
                                                <div><div className="font-bold text-sm">{t.author}</div><div className="text-xs text-base-content/50">{t.role}</div></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        <div className="bg-base-200 border-t-4 border-primary p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Contact</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: "fa-duotone fa-regular fa-envelope", label: "Email", value: profile.email },
                                    { icon: "fa-duotone fa-regular fa-phone", label: "Phone", value: profile.phone },
                                    { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", value: profile.linkedin },
                                ].map((c) => (
                                    <div key={c.label} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0"><i className={`${c.icon} text-primary text-xs`} /></div>
                                        <div><div className="text-[10px] uppercase tracking-widest text-base-content/40">{c.label}</div><div className="text-sm font-semibold">{c.value}</div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-base-200 p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Badges</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Pro Recruiter", icon: "fa-duotone fa-regular fa-award", color: "text-warning" },
                                    { label: "Top 10%", icon: "fa-duotone fa-regular fa-ranking-star", color: "text-primary" },
                                    { label: "Verified", icon: "fa-duotone fa-regular fa-badge-check", color: "text-secondary" },
                                    { label: "Fast Placer", icon: "fa-duotone fa-regular fa-bolt", color: "text-accent" },
                                ].map((b) => (
                                    <div key={b.label} className="flex items-center gap-2 p-3 bg-base-100 border border-base-300">
                                        <i className={`${b.icon} ${b.color}`} /><span className="text-xs font-semibold">{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
