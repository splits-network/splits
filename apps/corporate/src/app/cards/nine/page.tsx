"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- Data ---------------------------------------------------------------------

const categories = ["All", "Engineering", "Product", "Design", "Marketing", "Sales"];

const featuredJob = {
    title: "VP of Engineering",
    company: "ScaleUp Inc",
    initials: "SU",
    location: "New York, NY",
    remote: true,
    salary: "$280,000 - $350,000",
    type: "Full-Time",
    applicants: 8,
    recruiters: 6,
    posted: "1 day ago",
    ref: "JOB-0901",
    featured: true,
    skills: ["Leadership", "Architecture", "Scaling", "Mentorship"],
    desc: "Lead our 40-person engineering organization through the next phase of growth. Report directly to the CEO and shape our technical vision.",
};

const jobs = [
    { title: "Senior Frontend Engineer", company: "TechCorp", initials: "TC", location: "San Francisco, CA", remote: true, salary: "$150-200K", type: "Full-Time", applicants: 24, posted: "3 days ago", ref: "JOB-0847", cat: "Engineering", skills: ["React", "TypeScript", "Node.js"] },
    { title: "Product Manager", company: "StartupXYZ", initials: "SX", location: "Remote", remote: true, salary: "$130-170K", type: "Full-Time", applicants: 18, posted: "2 days ago", ref: "JOB-0852", cat: "Product", skills: ["Strategy", "Analytics", "Roadmap"] },
    { title: "UX Designer", company: "DesignCo", initials: "DC", location: "Austin, TX", remote: false, salary: "$110-140K", type: "Full-Time", applicants: 31, posted: "5 days ago", ref: "JOB-0838", cat: "Design", skills: ["Figma", "Research", "Prototyping"] },
    { title: "Backend Engineer", company: "CloudSys", initials: "CS", location: "Seattle, WA", remote: true, salary: "$140-180K", type: "Full-Time", applicants: 15, posted: "1 day ago", ref: "JOB-0856", cat: "Engineering", skills: ["Go", "PostgreSQL", "K8s"] },
    { title: "Marketing Director", company: "GrowthCo", initials: "GC", location: "Chicago, IL", remote: false, salary: "$120-160K", type: "Full-Time", applicants: 9, posted: "4 days ago", ref: "JOB-0841", cat: "Marketing", skills: ["SEO", "Content", "Brand"] },
    { title: "Sales Engineer", company: "SaaS Corp", initials: "SC", location: "Remote", remote: true, salary: "$130-170K", type: "Full-Time", applicants: 7, posted: "6 days ago", ref: "JOB-0835", cat: "Sales", skills: ["Demo", "API", "Enterprise"] },
    { title: "Staff Engineer", company: "DataFlow", initials: "DF", location: "Boston, MA", remote: true, salary: "$180-240K", type: "Full-Time", applicants: 12, posted: "2 days ago", ref: "JOB-0862", cat: "Engineering", skills: ["Python", "ML", "Data"] },
    { title: "Design Lead", company: "Pixel Inc", initials: "PI", location: "Portland, OR", remote: false, salary: "$140-175K", type: "Full-Time", applicants: 14, posted: "3 days ago", ref: "JOB-0849", cat: "Design", skills: ["Systems", "Leadership", "UI"] },
    { title: "Product Analyst", company: "MetricsCo", initials: "MC", location: "Denver, CO", remote: true, salary: "$90-120K", type: "Full-Time", applicants: 22, posted: "1 day ago", ref: "JOB-0865", cat: "Product", skills: ["SQL", "Analytics", "A/B Testing"] },
];

const recruiters = [
    { name: "Sarah Chen", initials: "SC", specialty: "Tech Recruiting", placements: 47, rating: 4.9, location: "San Francisco" },
    { name: "Marcus Rivera", initials: "MR", specialty: "Executive Search", placements: 31, rating: 4.8, location: "New York" },
    { name: "Jamie Park", initials: "JP", specialty: "Product & Design", placements: 28, rating: 4.7, location: "Remote" },
];

// -- Component ----------------------------------------------------------------

export default function CardsNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredJobs = activeCategory === "All" ? jobs : jobs.filter((j) => j.cat === activeCategory);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".cards-nine-title"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 });
            tl.fromTo($1(".cards-nine-featured"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");

            gsap.fromTo($(".cards-nine-filter-btn"), { opacity: 0, y: 10 }, {
                opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out",
                scrollTrigger: { trigger: $1(".cards-nine-filters"), start: "top 90%" },
            });
            gsap.fromTo($(".cards-nine-job-card"), { opacity: 0, y: 25 }, {
                opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out",
                scrollTrigger: { trigger: $1(".cards-nine-grid"), start: "top 85%" },
            });
            gsap.fromTo($(".cards-nine-recruiter"), { opacity: 0, x: -20 }, {
                opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power3.out",
                scrollTrigger: { trigger: $1(".cards-nine-recruiters"), start: "top 85%" },
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f7f8fa]">
            {/* Header */}
            <section className="relative py-16 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="cards-nine-title opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-4">REF: EN-CARDS-09 // Browse</span>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] leading-tight mb-4">
                                Open <span className="text-[#233876]">Roles</span>
                            </h1>
                            <p className="text-lg text-[#0f1b3d]/50 max-w-xl">Browse available positions across the network. Filter by category, location, and more.</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>
            </section>

            {/* Featured Card */}
            <section className="relative py-8 bg-[#f7f8fa] overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-4">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase">Featured Role</span>
                        </div>
                        <div className="cards-nine-featured border-2 border-[#233876]/20 bg-white p-8 relative opacity-0">
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/40" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/40" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/40" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/40" />
                            <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/20">{featuredJob.ref}</div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="font-mono text-[9px] tracking-wider text-white bg-[#233876] px-2 py-0.5 uppercase">Featured</span>
                                        <span className="font-mono text-[9px] tracking-wider text-[#233876]/40 border border-[#233876]/15 px-2 py-0.5 uppercase">{featuredJob.posted}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 border-2 border-[#233876]/20 flex items-center justify-center bg-[#233876]">
                                            <span className="font-mono text-sm font-bold text-white">{featuredJob.initials}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#0f1b3d]">{featuredJob.title}</h2>
                                            <div className="text-sm text-[#0f1b3d]/40">{featuredJob.company} &middot; {featuredJob.location}{featuredJob.remote ? " (Remote)" : ""}</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#0f1b3d]/50 leading-relaxed mb-4">{featuredJob.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {featuredJob.skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1 border border-[#233876]/15 text-xs text-[#233876]/60 font-medium">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-[#233876]/8">
                                            <span className="text-xs text-[#0f1b3d]/40">Salary</span>
                                            <span className="font-mono text-sm font-bold text-[#233876]">{featuredJob.salary}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-[#233876]/8">
                                            <span className="text-xs text-[#0f1b3d]/40">Applicants</span>
                                            <span className="font-mono text-sm font-bold text-[#0f1b3d]">{featuredJob.applicants}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#0f1b3d]/40">Recruiters</span>
                                            <span className="font-mono text-sm font-bold text-[#0f1b3d]">{featuredJob.recruiters}</span>
                                        </div>
                                    </div>
                                    <button className="w-full px-5 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                        View Details <i className="fa-regular fa-arrow-right text-xs ml-1" />
                                    </button>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#233876]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters + Grid */}
            <section className="relative py-8 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {/* Filter bar */}
                        <div className="cards-nine-filters flex flex-wrap items-center gap-2 mb-6">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`cards-nine-filter-btn opacity-0 px-4 py-2 text-xs font-medium transition-colors ${
                                        activeCategory === cat
                                            ? "border-2 border-[#233876] bg-[#233876] text-white"
                                            : "border-2 border-[#233876]/10 text-[#0f1b3d]/40 hover:border-[#233876]/25 hover:text-[#0f1b3d]/60"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                            <span className="font-mono text-[10px] text-[#233876]/25 ml-2">{filteredJobs.length} roles</span>
                        </div>

                        {/* Job cards grid */}
                        <div className="cards-nine-grid grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#233876]/10">
                            {filteredJobs.map((job, i) => (
                                <div key={i} className="cards-nine-job-card bg-white p-6 relative opacity-0 group hover:bg-[#f7f8fa] transition-colors cursor-pointer">
                                    <div className="absolute top-3 right-3 font-mono text-[9px] text-[#233876]/12">{job.ref}</div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876]">
                                            <span className="font-mono text-[10px] font-bold text-white">{job.initials}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-[#0f1b3d] group-hover:text-[#233876] transition-colors">{job.title}</h3>
                                            <div className="text-xs text-[#0f1b3d]/35">{job.company}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <i className="fa-regular fa-location-dot text-[10px] text-[#233876]/30 w-3" />
                                            <span className="text-xs text-[#0f1b3d]/40">{job.location}{job.remote ? " (Remote)" : ""}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <i className="fa-regular fa-money-bill text-[10px] text-[#233876]/30 w-3" />
                                            <span className="text-xs font-semibold text-[#0f1b3d]/60">{job.salary}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {job.skills.map((s, j) => (
                                            <span key={j} className="px-2 py-0.5 border border-[#233876]/10 text-[10px] text-[#233876]/50">{s}</span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#233876]/8">
                                        <span className="font-mono text-[10px] text-[#0f1b3d]/25">{job.applicants} applicants</span>
                                        <span className="font-mono text-[10px] text-[#233876]/25">{job.posted}</span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#233876] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Recruiter Cards - Different variant */}
            <section className="relative py-12 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-2">Top Performers</span>
                            <h2 className="text-2xl font-bold text-[#0f1b3d]">Featured Recruiters</h2>
                        </div>
                        <div className="cards-nine-recruiters grid md:grid-cols-3 gap-6">
                            {recruiters.map((rec, i) => (
                                <div key={i} className="cards-nine-recruiter border-2 border-[#233876]/10 bg-white p-6 relative opacity-0 hover:border-[#233876]/25 transition-colors">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876]">
                                            <span className="font-mono text-lg font-bold text-white">{rec.initials}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0f1b3d]">{rec.name}</h3>
                                            <div className="text-xs text-[#0f1b3d]/40">{rec.specialty}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-px bg-[#233876]/10 mb-4">
                                        <div className="bg-white px-3 py-2 text-center">
                                            <div className="font-mono text-lg font-bold text-[#233876]">{rec.placements}</div>
                                            <div className="font-mono text-[8px] text-[#0f1b3d]/25 uppercase tracking-wider">Placed</div>
                                        </div>
                                        <div className="bg-white px-3 py-2 text-center">
                                            <div className="font-mono text-lg font-bold text-[#233876]">{rec.rating}</div>
                                            <div className="font-mono text-[8px] text-[#0f1b3d]/25 uppercase tracking-wider">Rating</div>
                                        </div>
                                        <div className="bg-white px-3 py-2 text-center">
                                            <div className="text-xs font-bold text-[#0f1b3d]/60">{rec.location}</div>
                                            <div className="font-mono text-[8px] text-[#0f1b3d]/25 uppercase tracking-wider">Based</div>
                                        </div>
                                    </div>
                                    <button className="w-full px-4 py-2 border-2 border-[#233876]/15 text-xs text-[#233876] font-medium hover:border-[#233876] transition-colors">
                                        View Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-[#f7f8fa]">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // CARDS v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
