"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = ["All", "Engineering", "Design", "Product", "Data", "Marketing", "Sales"];

const jobCards = [
    { id: "JOB-001", title: "Senior Product Designer", company: "Stripe", location: "San Francisco, CA", salary: "USD 150K-200K", type: "FULL-TIME", level: "SENIOR", status: "open", featured: true, applicants: 127, tags: ["Figma", "Design Systems", "UX Research"], category: "Design" },
    { id: "JOB-002", title: "Staff Software Engineer", company: "Notion", location: "Remote (US)", salary: "USD 180K-240K", type: "REMOTE", level: "SENIOR", status: "open", featured: true, applicants: 203, tags: ["Go", "Python", "Distributed Systems"], category: "Engineering" },
    { id: "JOB-003", title: "Marketing Manager", company: "Figma", location: "New York, NY", salary: "USD 120K-160K", type: "FULL-TIME", level: "MID", status: "open", featured: false, applicants: 89, tags: ["B2B Marketing", "SaaS", "Events"], category: "Marketing" },
    { id: "JOB-004", title: "Data Scientist", company: "Airbnb", location: "Seattle, WA", salary: "USD 140K-180K", type: "FULL-TIME", level: "MID", status: "open", featured: true, applicants: 156, tags: ["Python", "SQL", "Machine Learning"], category: "Data" },
    { id: "JOB-005", title: "Frontend Engineer", company: "Linear", location: "Remote (Europe)", salary: "EUR 90K-130K", type: "REMOTE", level: "MID", status: "open", featured: true, applicants: 241, tags: ["React", "TypeScript", "Performance"], category: "Engineering" },
    { id: "JOB-008", title: "Product Manager", company: "Superhuman", location: "San Francisco, CA", salary: "USD 140K-180K", type: "FULL-TIME", level: "MID", status: "open", featured: false, applicants: 134, tags: ["Product Management", "SaaS"], category: "Product" },
    { id: "JOB-014", title: "Machine Learning Engineer", company: "OpenAI", location: "San Francisco, CA", salary: "USD 200K-300K", type: "FULL-TIME", level: "SENIOR", status: "open", featured: true, applicants: 876, tags: ["PyTorch", "LLMs", "Python"], category: "Data" },
    { id: "JOB-012", title: "Sales Development Rep", company: "HubSpot", location: "Boston, MA", salary: "USD 55K-75K", type: "FULL-TIME", level: "ENTRY", status: "open", featured: false, applicants: 312, tags: ["Sales", "SDR", "SaaS"], category: "Sales" },
    { id: "JOB-016", title: "Engineering Manager", company: "Shopify", location: "Ottawa, Canada", salary: "CAD 150K-190K", type: "FULL-TIME", level: "SENIOR", status: "open", featured: true, applicants: 103, tags: ["Leadership", "Ruby on Rails"], category: "Engineering" },
];

const recruiterCards = [
    { name: "Sarah Chen", agency: "TechHire Partners", speciality: "Product Design", placements: 42, rating: "4.9", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" },
    { name: "Michael Torres", agency: "Scale Recruiting", speciality: "Backend Engineering", placements: 67, rating: "4.8", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" },
    { name: "Dr. Priya Patel", agency: "AI Talent Partners", speciality: "Machine Learning", placements: 47, rating: "4.9", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400" },
];

const companyCards = [
    { name: "Stripe", roles: 14, industry: "Fintech", size: "8,000+", logo: "ST" },
    { name: "OpenAI", roles: 23, industry: "AI Research", size: "3,000+", logo: "OA" },
    { name: "Linear", roles: 8, industry: "Developer Tools", size: "100+", logo: "LN" },
    { name: "Notion", roles: 11, industry: "Productivity", size: "1,500+", logo: "NT" },
];

const statusColors: Record<string, string> = { open: "text-[#22c55e]", filled: "text-[#14b8a6]", pending: "text-[#eab308]", closed: "text-[#ef4444]" };

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CardsSevenPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredJobs = activeCategory === "All"
        ? jobCards
        : jobCards.filter((j) => j.category === activeCategory);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-cards-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-cards-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-filter-btn", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04 }, "-=0.3");
            tl.fromTo(".bp-job-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.1");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59,92,204,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,92,204,0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    {/* Header */}
                    <div className="bp-cards-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-CARDS07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            {filteredJobs.length} RECORDS
                        </div>
                    </div>

                    <h1 className="bp-cards-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                        Card <span className="text-[#3b5ccc]">Variants</span>
                    </h1>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-8">// INTERACTIVE CARD GRID SHOWCASE</p>

                    {/* ═══ SECTION 1: Job Cards ═══ */}
                    <div className="mb-16">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// JOB LISTING CARDS</div>

                        {/* Category filters */}
                        <div className="flex flex-wrap gap-px bg-[#3b5ccc]/10 mb-6 w-fit">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`bp-filter-btn px-4 py-2 font-mono text-[10px] tracking-widest transition-colors opacity-0 ${
                                        activeCategory === cat ? "bg-[#3b5ccc] text-white" : "bg-[#0d1220] text-[#c8ccd4]/40 hover:text-white"
                                    }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Featured hero card */}
                        {filteredJobs.some((j) => j.featured) && (
                            <div className="mb-6">
                                {filteredJobs.filter((j) => j.featured).slice(0, 1).map((job) => (
                                    <div key={job.id} className="bp-job-card border border-[#3b5ccc]/30 bg-[#0d1220] p-8 relative group opacity-0">
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-[#eab308] font-mono text-[9px] text-[#0a0e17] tracking-widest font-bold">
                                            FEATURED
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <div className="font-mono text-[9px] text-[#3b5ccc]/40 tracking-widest mb-1">{job.id}</div>
                                                <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                                                <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                                                    <span className="text-[#3b5ccc]">{job.company}</span>
                                                    <span className="text-[#c8ccd4]/15">|</span>
                                                    <span className="text-[#c8ccd4]/40">{job.location}</span>
                                                    <span className="text-[#c8ccd4]/15">|</span>
                                                    <span className="text-[#14b8a6]">{job.salary}</span>
                                                    <span className="text-[#c8ccd4]/15">|</span>
                                                    <span className="text-[#c8ccd4]/30">{job.applicants} applicants</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {job.tags.map((t) => (
                                                    <span key={t} className="px-2.5 py-1 border border-[#3b5ccc]/15 font-mono text-[9px] text-[#c8ccd4]/40 tracking-wider">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Standard job cards grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#3b5ccc]/10">
                            {filteredJobs.filter((j) => !j.featured || filteredJobs.filter(f => f.featured).indexOf(j) > 0).map((job) => (
                                <div key={job.id} className="bp-job-card bg-[#0a0e17] p-6 group relative cursor-pointer opacity-0 hover:bg-[#0d1220] transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono text-[9px] text-[#3b5ccc]/40 tracking-widest">{job.id}</span>
                                        <div className="flex items-center gap-2">
                                            {job.featured && <i className="fa-duotone fa-regular fa-star text-[#eab308] text-[8px]"></i>}
                                            <span className={`font-mono text-[9px] tracking-wider ${statusColors[job.status]}`}>[{job.status.toUpperCase()}]</span>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">{job.title}</h3>
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/60 mb-3">{job.company}</div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] mb-3">
                                        <span className="text-[#c8ccd4]/40">{job.location}</span>
                                        <span className="text-[#14b8a6]">{job.salary}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            {job.tags.slice(0, 2).map((t) => (
                                                <span key={t} className="px-2 py-0.5 border border-[#3b5ccc]/10 font-mono text-[8px] text-[#c8ccd4]/30 tracking-wider">{t}</span>
                                            ))}
                                        </div>
                                        <span className="font-mono text-[9px] text-[#c8ccd4]/20">{job.applicants} apps</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══ SECTION 2: Recruiter Cards ═══ */}
                    <div className="mb-16">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// RECRUITER PROFILE CARDS</div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {recruiterCards.map((rc) => (
                                <div key={rc.name} className="border border-[#3b5ccc]/15 bg-[#0a0e17] p-6 group relative">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={rc.avatar} alt={rc.name} className="w-14 h-14 object-cover border border-[#3b5ccc]/30" />
                                        <div>
                                            <div className="font-mono text-sm text-white font-bold">{rc.name}</div>
                                            <div className="font-mono text-[10px] text-[#c8ccd4]/40">{rc.agency}</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/50 mb-4">SPECIALITY: {rc.speciality}</div>
                                    <div className="grid grid-cols-2 gap-px bg-[#3b5ccc]/10">
                                        <div className="bg-[#0a0e17] p-3 text-center">
                                            <div className="font-mono text-base font-bold text-white">{rc.placements}</div>
                                            <div className="font-mono text-[8px] text-[#3b5ccc]/50 tracking-widest">PLACEMENTS</div>
                                        </div>
                                        <div className="bg-[#0a0e17] p-3 text-center">
                                            <div className="font-mono text-base font-bold text-white">{rc.rating}</div>
                                            <div className="font-mono text-[8px] text-[#3b5ccc]/50 tracking-widest">RATING</div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#14b8a6] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══ SECTION 3: Company Cards ═══ */}
                    <div>
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// COMPANY CARDS</div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#3b5ccc]/10">
                            {companyCards.map((cc) => (
                                <div key={cc.name} className="bg-[#0a0e17] p-6 group relative cursor-pointer hover:bg-[#0d1220] transition-colors">
                                    <div className="w-12 h-12 border-2 border-[#3b5ccc]/30 flex items-center justify-center font-mono text-sm font-bold text-[#3b5ccc] mb-4">
                                        {cc.logo}
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">{cc.name}</h3>
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/40 mb-3">{cc.industry}</div>
                                    <div className="flex items-center justify-between font-mono text-[9px]">
                                        <span className="text-[#14b8a6]">{cc.roles} OPEN ROLES</span>
                                        <span className="text-[#c8ccd4]/20">{cc.size}</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
