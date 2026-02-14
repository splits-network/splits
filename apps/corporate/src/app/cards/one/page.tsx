"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Card Data ───────────────────────────────────────────────────────────── */

const categories = ["All", "Engineering", "Design", "Product", "Marketing", "Data", "Sales"];

const jobCards = [
    { id: 1, title: "Senior Product Designer", company: "Stripe", location: "San Francisco, CA", salary: "USD 150k-200k", type: "full-time", department: "Design", level: "senior", featured: true, hot: true, applicants: 127, tags: ["Figma", "Design Systems", "Payments"], avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", recruiter: "Sarah Chen" },
    { id: 2, title: "Staff Software Engineer", company: "Notion", location: "Remote (US)", salary: "USD 180k-240k", type: "remote", department: "Engineering", level: "senior", featured: true, hot: false, applicants: 203, tags: ["Go", "Python", "Distributed Systems"], avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", recruiter: "Michael Torres" },
    { id: 3, title: "Marketing Manager", company: "Figma", location: "New York, NY", salary: "USD 120k-160k", type: "full-time", department: "Marketing", level: "mid", featured: false, hot: false, applicants: 89, tags: ["B2B", "SaaS", "Events"], avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", recruiter: "Jessica Park" },
    { id: 4, title: "Data Scientist", company: "Airbnb", location: "Seattle, WA", salary: "USD 140k-180k", type: "full-time", department: "Data", level: "mid", featured: true, hot: true, applicants: 156, tags: ["Python", "ML", "A/B Testing"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", recruiter: "David Kim" },
    { id: 5, title: "Frontend Engineer", company: "Linear", location: "Remote (EU)", salary: "EUR 90k-130k", type: "remote", department: "Engineering", level: "mid", featured: true, hot: false, applicants: 241, tags: ["React", "TypeScript", "GSAP"], avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100", recruiter: "Emma Schmidt" },
    { id: 6, title: "Head of Customer Success", company: "Webflow", location: "San Francisco, CA", salary: "USD 160k-210k", type: "full-time", department: "Sales", level: "executive", featured: true, hot: false, applicants: 47, tags: ["Leadership", "SaaS", "CS"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", recruiter: "Robert Johnson" },
    { id: 7, title: "ML Engineer", company: "OpenAI", location: "San Francisco, CA", salary: "USD 200k-300k", type: "full-time", department: "Engineering", level: "senior", featured: true, hot: true, applicants: 876, tags: ["PyTorch", "LLMs", "Python"], avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100", recruiter: "Dr. Priya Patel" },
    { id: 8, title: "Product Manager", company: "Superhuman", location: "San Francisco, CA", salary: "USD 140k-180k", type: "full-time", department: "Product", level: "mid", featured: false, hot: false, applicants: 134, tags: ["PM", "SaaS", "Email"], avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100", recruiter: "Lisa Wang" },
    { id: 9, title: "DevOps Engineer", company: "GitLab", location: "Remote (Global)", salary: "USD 110k-150k", type: "remote", department: "Engineering", level: "mid", featured: false, hot: false, applicants: 178, tags: ["Kubernetes", "Docker", "AWS"], avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100", recruiter: "Alex Martinez" },
];

const recruiterCards = [
    { name: "Sarah Chen", agency: "TechHire Partners", placements: 87, rating: 4.9, specialty: "Design & Product", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" },
    { name: "Michael Torres", agency: "Scale Recruiting", placements: 124, rating: 4.8, specialty: "Engineering", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" },
    { name: "Dr. Priya Patel", agency: "AI Talent Partners", placements: 45, rating: 5.0, specialty: "AI/ML", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200" },
];

const companyCards = [
    { name: "Stripe", industry: "Fintech", openRoles: 12, logo: "fa-duotone fa-regular fa-credit-card" },
    { name: "Notion", industry: "Productivity", openRoles: 8, logo: "fa-duotone fa-regular fa-note-sticky" },
    { name: "OpenAI", industry: "AI Research", openRoles: 23, logo: "fa-duotone fa-regular fa-brain" },
    { name: "Linear", industry: "Developer Tools", openRoles: 6, logo: "fa-duotone fa-regular fa-diagram-project" },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function CardsOnePage() {
    const mainRef = useRef<HTMLElement>(null);
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredJobs = activeCategory === "All"
        ? jobCards
        : jobCards.filter((j) => j.department === activeCategory);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
            heroTl
                .fromTo($1(".hero-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
                .fromTo($(".hero-headline-word"), { opacity: 0, y: 80, rotateX: 40 }, { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.12 }, "-=0.3")
                .fromTo($1(".hero-body"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");

            $(".card-section").forEach((section) => {
                gsap.fromTo(section, { opacity: 0, y: 40 }, {
                    opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: section, start: "top 80%" },
                });
            });
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="overflow-hidden bg-base-100 min-h-screen">
            {/* ═══════════════════ HERO ═══════════════════ */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-grid-2 mr-2"></i>Card Patterns
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                            <span className="hero-headline-word inline-block opacity-0">Card</span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">design</span>{" "}
                            <span className="hero-headline-word inline-block opacity-0">system.</span>
                        </h1>
                        <p className="hero-body text-lg text-neutral-content/60 leading-relaxed max-w-xl opacity-0">
                            Multiple card variants for jobs, recruiters, and
                            companies. Filterable, interactive, and responsive.
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
            </section>

            {/* ═══════════════════ FEATURED CARDS — Large Hero Cards ═══════════════════ */}
            <section className="card-section py-16 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">01</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Featured Roles</p>
                            <h2 className="text-2xl font-black tracking-tight">Hero cards</h2>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {jobCards.filter((j) => j.hot).map((job) => (
                            <div key={job.id} className="group border-2 border-base-300 hover:border-primary transition-colors cursor-pointer">
                                <div className="bg-primary text-primary-content px-6 py-3 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                                        <i className="fa-duotone fa-regular fa-fire mr-1"></i>Hot Role
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-content/60">{job.applicants} applicants</span>
                                </div>
                                <div className="p-6 lg:p-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight leading-tight mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                                            <p className="text-sm text-base-content/50">{job.company} &middot; {job.location}</p>
                                        </div>
                                        <span className="text-lg font-black text-primary">{job.salary}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {job.tags.map((tag, i) => (
                                            <span key={i} className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 font-bold">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-base-200">
                                        <div className="flex items-center gap-2">
                                            <img src={job.avatar} alt={job.recruiter} className="w-6 h-6 object-cover" />
                                            <span className="text-xs text-base-content/50">{job.recruiter}</span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider text-base-content/30 capitalize">{job.type} &middot; {job.level}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ JOB CARDS — Filterable Grid ═══════════════════ */}
            <section className="card-section py-16 bg-base-200 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">02</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">All Roles</p>
                            <h2 className="text-2xl font-black tracking-tight">Standard cards</h2>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                                    activeCategory === cat
                                        ? "bg-primary text-primary-content"
                                        : "bg-base-100 text-base-content/50 hover:text-base-content"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="group bg-base-100 border-2 border-base-300 hover:border-primary/30 transition-colors cursor-pointer p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {job.featured && <i className="fa-duotone fa-regular fa-star text-primary text-xs"></i>}
                                        <span className="text-[9px] uppercase tracking-wider text-base-content/30 capitalize">{job.type}</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-success font-bold">Open</span>
                                </div>
                                <h3 className="text-lg font-black tracking-tight leading-tight mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                                <p className="text-sm text-base-content/50 mb-3">{job.company}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/40 mb-4">
                                    <span><i className="fa-duotone fa-regular fa-location-dot mr-1"></i>{job.location}</span>
                                    <span className="capitalize"><i className="fa-duotone fa-regular fa-signal mr-1"></i>{job.level}</span>
                                </div>
                                <p className="text-base font-black text-primary tracking-tight mb-4">{job.salary}</p>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {job.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[8px] uppercase tracking-wider bg-base-200 text-base-content/40 px-2 py-0.5">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-base-200">
                                    <div className="flex items-center gap-2">
                                        <img src={job.avatar} alt={job.recruiter} className="w-5 h-5 object-cover" />
                                        <span className="text-[10px] text-base-content/40">{job.recruiter}</span>
                                    </div>
                                    <span className="text-[10px] text-base-content/30"><i className="fa-duotone fa-regular fa-users mr-1"></i>{job.applicants}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ RECRUITER CARDS ═══════════════════ */}
            <section className="card-section py-16 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl font-black tracking-tighter text-base-content/10">03</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Top Recruiters</p>
                            <h2 className="text-2xl font-black tracking-tight">Profile cards</h2>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {recruiterCards.map((rec, i) => (
                            <div key={i} className="group bg-base-100 border-2 border-base-300 hover:border-secondary/30 transition-colors cursor-pointer text-center p-8">
                                <img src={rec.avatar} alt={rec.name} className="w-20 h-20 object-cover mx-auto mb-4" />
                                <h3 className="text-xl font-black tracking-tight mb-0.5">{rec.name}</h3>
                                <p className="text-sm text-base-content/50 mb-1">{rec.agency}</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold mb-4">{rec.specialty}</p>
                                <div className="grid grid-cols-2 gap-[2px] bg-base-300 mb-4">
                                    <div className="bg-base-100 p-3">
                                        <p className="text-lg font-black">{rec.placements}</p>
                                        <p className="text-[9px] uppercase tracking-wider text-base-content/30">Placements</p>
                                    </div>
                                    <div className="bg-base-100 p-3">
                                        <p className="text-lg font-black text-primary">{rec.rating}</p>
                                        <p className="text-[9px] uppercase tracking-wider text-base-content/30">Rating</p>
                                    </div>
                                </div>
                                <button className="btn btn-outline btn-sm w-full text-xs font-bold uppercase tracking-wider">View Profile</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ COMPANY CARDS — Compact ═══════════════════ */}
            <section className="card-section py-16 bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl font-black tracking-tighter text-neutral-content/10">04</span>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Hiring Now</p>
                            <h2 className="text-2xl font-black tracking-tight">Company cards</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {companyCards.map((comp, i) => (
                            <div key={i} className="group border border-neutral-content/10 hover:border-primary/30 transition-colors cursor-pointer p-6">
                                <div className="w-12 h-12 bg-neutral-content/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <i className={`${comp.logo} text-xl text-primary`}></i>
                                </div>
                                <h3 className="text-lg font-black tracking-tight mb-0.5">{comp.name}</h3>
                                <p className="text-xs text-neutral-content/40 mb-3">{comp.industry}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-primary">{comp.openRoles} roles</span>
                                    <i className="fa-duotone fa-regular fa-arrow-right text-xs text-neutral-content/20 group-hover:text-primary transition-colors"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
