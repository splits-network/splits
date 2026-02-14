"use client";

import { useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface JobResult {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    salaryNum: number;
    type: "full-time" | "part-time" | "contract" | "remote";
    department: string;
    level: string;
    posted: string;
    daysAgo: number;
    applicants: number;
    tags: string[];
    splitFee: string;
    recruiter: string;
    avatar: string;
    description: string;
}

type SortOption = "relevance" | "newest" | "salary-high" | "salary-low" | "applicants";
type ViewMode = "list" | "grid";

/* ─── Data ────────────────────────────────────────────────────────────────── */

const departments = ["All", "Engineering", "Design", "Product", "Marketing", "Data", "Sales", "Operations"];
const levels = ["All", "Junior", "Mid", "Senior", "Lead", "Executive"];
const types = ["All", "Full-time", "Part-time", "Contract", "Remote"];
const locationOptions = ["All", "San Francisco", "New York", "Remote (US)", "Remote (EU)", "Remote (Global)", "Seattle", "Austin", "London"];

const allJobs: JobResult[] = [
    { id: 1, title: "Senior Product Designer", company: "Stripe", location: "San Francisco, CA", salary: "$150k\u2013200k", salaryNum: 175, type: "full-time", department: "Design", level: "Senior", posted: "2 days ago", daysAgo: 2, applicants: 127, tags: ["Figma", "Design Systems", "Payments"], splitFee: "20%", recruiter: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", description: "Lead end-to-end product design for Stripe\u2019s flagship payment products. Work on design systems, user research, and cross-platform experiences." },
    { id: 2, title: "Staff Software Engineer", company: "Notion", location: "Remote (US)", salary: "$180k\u2013240k", salaryNum: 210, type: "remote", department: "Engineering", level: "Senior", posted: "1 day ago", daysAgo: 1, applicants: 203, tags: ["Go", "Python", "Distributed Systems"], splitFee: "18%", recruiter: "Michael Torres", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", description: "Build the next generation of Notion\u2019s collaborative infrastructure. Deep experience with distributed systems required." },
    { id: 3, title: "Marketing Manager", company: "Figma", location: "New York, NY", salary: "$120k\u2013160k", salaryNum: 140, type: "full-time", department: "Marketing", level: "Mid", posted: "5 days ago", daysAgo: 5, applicants: 89, tags: ["B2B", "SaaS", "Events"], splitFee: "15%", recruiter: "Jessica Park", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", description: "Drive growth marketing initiatives for Figma\u2019s enterprise segment. Manage events, content, and demand generation campaigns." },
    { id: 4, title: "Data Scientist", company: "Airbnb", location: "Seattle, WA", salary: "$140k\u2013180k", salaryNum: 160, type: "full-time", department: "Data", level: "Mid", posted: "3 days ago", daysAgo: 3, applicants: 156, tags: ["Python", "ML", "A/B Testing"], splitFee: "20%", recruiter: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", description: "Apply machine learning and statistical analysis to improve Airbnb\u2019s search and pricing algorithms." },
    { id: 5, title: "Frontend Engineer", company: "Linear", location: "Remote (EU)", salary: "$90k\u2013130k", salaryNum: 110, type: "remote", department: "Engineering", level: "Mid", posted: "1 week ago", daysAgo: 7, applicants: 241, tags: ["React", "TypeScript", "GSAP"], splitFee: "18%", recruiter: "Emma Schmidt", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100", description: "Build beautiful, performant interfaces for Linear\u2019s project management tool. Deep React and animation experience preferred." },
    { id: 6, title: "Head of Customer Success", company: "Webflow", location: "San Francisco, CA", salary: "$160k\u2013210k", salaryNum: 185, type: "full-time", department: "Sales", level: "Executive", posted: "4 days ago", daysAgo: 4, applicants: 47, tags: ["Leadership", "SaaS", "CS"], splitFee: "22%", recruiter: "Robert Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", description: "Lead Webflow\u2019s customer success organization. Build and scale a world-class CS team serving enterprise customers." },
    { id: 7, title: "ML Engineer", company: "OpenAI", location: "San Francisco, CA", salary: "$200k\u2013300k", salaryNum: 250, type: "full-time", department: "Engineering", level: "Senior", posted: "6 hours ago", daysAgo: 0, applicants: 876, tags: ["PyTorch", "LLMs", "Python"], splitFee: "25%", recruiter: "Dr. Priya Patel", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100", description: "Work on foundational language models at OpenAI. Research and engineer solutions at the frontier of artificial intelligence." },
    { id: 8, title: "Product Manager", company: "Superhuman", location: "San Francisco, CA", salary: "$140k\u2013180k", salaryNum: 160, type: "full-time", department: "Product", level: "Mid", posted: "2 weeks ago", daysAgo: 14, applicants: 134, tags: ["PM", "SaaS", "Email"], splitFee: "18%", recruiter: "Lisa Wang", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100", description: "Own the product roadmap for Superhuman\u2019s flagship email client. Drive product-market fit and user delight." },
    { id: 9, title: "DevOps Engineer", company: "GitLab", location: "Remote (Global)", salary: "$110k\u2013150k", salaryNum: 130, type: "remote", department: "Engineering", level: "Mid", posted: "3 days ago", daysAgo: 3, applicants: 178, tags: ["Kubernetes", "Docker", "AWS"], splitFee: "17%", recruiter: "Alex Martinez", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100", description: "Build and maintain GitLab\u2019s CI/CD infrastructure. Work on Kubernetes-native deployment pipelines and developer tooling." },
    { id: 10, title: "UX Researcher", company: "Spotify", location: "New York, NY", salary: "$110k\u2013140k", salaryNum: 125, type: "full-time", department: "Design", level: "Mid", posted: "1 week ago", daysAgo: 7, applicants: 92, tags: ["User Research", "Interviews", "Usability"], splitFee: "15%", recruiter: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", description: "Conduct qualitative and quantitative research to inform product decisions for Spotify\u2019s premium experience." },
    { id: 11, title: "Junior Backend Developer", company: "Vercel", location: "Remote (US)", salary: "$80k\u2013110k", salaryNum: 95, type: "remote", department: "Engineering", level: "Junior", posted: "6 days ago", daysAgo: 6, applicants: 312, tags: ["Node.js", "TypeScript", "Edge"], splitFee: "12%", recruiter: "Michael Torres", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", description: "Join Vercel\u2019s platform team and help build the future of web deployment. Great opportunity for early-career engineers." },
    { id: 12, title: "VP of Engineering", company: "Loom", location: "San Francisco, CA", salary: "$250k\u2013350k", salaryNum: 300, type: "full-time", department: "Engineering", level: "Executive", posted: "2 days ago", daysAgo: 2, applicants: 23, tags: ["Leadership", "Scaling", "Video"], splitFee: "25%", recruiter: "Robert Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", description: "Lead Loom\u2019s engineering organization through the next phase of growth. Build high-performing teams and define technical strategy." },
    { id: 13, title: "Contract UI Designer", company: "Framer", location: "Remote (EU)", salary: "$75/hr", salaryNum: 150, type: "contract", department: "Design", level: "Senior", posted: "4 days ago", daysAgo: 4, applicants: 64, tags: ["Framer", "Prototyping", "Motion"], splitFee: "20%", recruiter: "Emma Schmidt", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100", description: "3-month contract to redesign Framer\u2019s marketing pages. Motion design and prototyping expertise required." },
    { id: 14, title: "Sales Development Rep", company: "HubSpot", location: "Austin, TX", salary: "$55k\u201375k + commission", salaryNum: 65, type: "full-time", department: "Sales", level: "Junior", posted: "1 day ago", daysAgo: 1, applicants: 198, tags: ["SDR", "Cold Outreach", "CRM"], splitFee: "10%", recruiter: "Lisa Wang", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100", description: "Kickstart your sales career at HubSpot. Generate qualified leads through outbound prospecting and discovery calls." },
    { id: 15, title: "Part-time Content Strategist", company: "Notion", location: "Remote (US)", salary: "$50k\u201370k", salaryNum: 60, type: "part-time", department: "Marketing", level: "Mid", posted: "5 days ago", daysAgo: 5, applicants: 76, tags: ["Content", "SEO", "Writing"], splitFee: "12%", recruiter: "Jessica Park", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", description: "20 hours/week role creating thought leadership content for Notion\u2019s blog, social channels, and community." },
];

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "relevance", label: "Most Relevant" },
    { value: "newest", label: "Newest First" },
    { value: "salary-high", label: "Highest Salary" },
    { value: "salary-low", label: "Lowest Salary" },
    { value: "applicants", label: "Most Applicants" },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function SearchOnePage() {
    const mainRef = useRef<HTMLElement>(null);

    /* ── State ── */
    const [query, setQuery] = useState("");
    const [department, setDepartment] = useState("All");
    const [level, setLevel] = useState("All");
    const [type, setType] = useState("All");
    const [location, setLocation] = useState("All");
    const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 400]);
    const [sortBy, setSortBy] = useState<SortOption>("relevance");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [showFilters, setShowFilters] = useState(true);
    const [savedSearch, setSavedSearch] = useState(false);

    /* ── Active filters ── */
    const activeFilters = useMemo(() => {
        const filters: { key: string; label: string; value: string }[] = [];
        if (query) filters.push({ key: "query", label: "Search", value: query });
        if (department !== "All") filters.push({ key: "department", label: "Department", value: department });
        if (level !== "All") filters.push({ key: "level", label: "Level", value: level });
        if (type !== "All") filters.push({ key: "type", label: "Type", value: type });
        if (location !== "All") filters.push({ key: "location", label: "Location", value: location });
        if (salaryRange[0] > 0 || salaryRange[1] < 400) filters.push({ key: "salary", label: "Salary", value: `$${salaryRange[0]}k\u2013$${salaryRange[1]}k` });
        return filters;
    }, [query, department, level, type, location, salaryRange]);

    /* ── Filtered + sorted results ── */
    const results = useMemo(() => {
        let filtered = allJobs.filter((job) => {
            if (query) {
                const q = query.toLowerCase();
                const match = job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.tags.some((t) => t.toLowerCase().includes(q)) || job.description.toLowerCase().includes(q);
                if (!match) return false;
            }
            if (department !== "All" && job.department !== department) return false;
            if (level !== "All" && job.level !== level) return false;
            if (type !== "All" && job.type !== type.toLowerCase().replace(" ", "-")) return false;
            if (location !== "All" && !job.location.includes(location)) return false;
            if (job.salaryNum < salaryRange[0] || job.salaryNum > salaryRange[1]) return false;
            return true;
        });

        switch (sortBy) {
            case "newest": filtered.sort((a, b) => a.daysAgo - b.daysAgo); break;
            case "salary-high": filtered.sort((a, b) => b.salaryNum - a.salaryNum); break;
            case "salary-low": filtered.sort((a, b) => a.salaryNum - b.salaryNum); break;
            case "applicants": filtered.sort((a, b) => b.applicants - a.applicants); break;
            default: break;
        }

        return filtered;
    }, [query, department, level, type, location, salaryRange, sortBy]);

    /* ── Clear single filter ── */
    function clearFilter(key: string) {
        switch (key) {
            case "query": setQuery(""); break;
            case "department": setDepartment("All"); break;
            case "level": setLevel("All"); break;
            case "type": setType("All"); break;
            case "location": setLocation("All"); break;
            case "salary": setSalaryRange([0, 400]); break;
        }
    }

    function clearAll() {
        setQuery("");
        setDepartment("All");
        setLevel("All");
        setType("All");
        setLocation("All");
        setSalaryRange([0, 400]);
    }

    /* ── Animations ── */
    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl
                .fromTo($1(".hero-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
                .fromTo($(".hero-headline-word"), { opacity: 0, y: 80, rotateX: 40 }, { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.12 }, "-=0.3")
                .fromTo($1(".hero-search-bar"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");

            gsap.fromTo($1(".search-body"), { opacity: 0, y: 40 }, {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                scrollTrigger: { trigger: $1(".search-body"), start: "top 85%" },
            });
        },
        { scope: mainRef },
    );

    /* ── Filter sidebar select helper ── */
    function FilterSelect({ label, icon, options, value, onChange }: { label: string; icon: string; options: string[]; value: string; onChange: (v: string) => void }) {
        return (
            <div className="mb-5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/50 flex items-center gap-1.5 mb-2">
                    <i className={`${icon} text-xs`}></i>{label}
                </label>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="select select-bordered w-full text-sm bg-base-100"
                >
                    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        );
    }

    return (
        <main ref={mainRef} className="overflow-hidden bg-base-100 min-h-screen">
            {/* ════════════════════ HERO ════════════════════ */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-magnifying-glass mr-2"></i>Search &amp; Filters
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                            <span className="hero-headline-word inline-block opacity-0">Find</span>{" "}
                            <span className="hero-headline-word inline-block opacity-0 text-primary">the&nbsp;right</span>{" "}
                            <span className="hero-headline-word inline-block opacity-0">roles.</span>
                        </h1>
                    </div>

                    {/* ── Search Bar ── */}
                    <div className="hero-search-bar max-w-3xl mt-8 opacity-0">
                        <div className="flex bg-neutral-content/10 border border-neutral-content/10">
                            <div className="flex items-center pl-5 pr-3">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-neutral-content/40"></i>
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search jobs, companies, skills..."
                                className="flex-1 bg-transparent py-4 pr-4 text-neutral-content placeholder:text-neutral-content/30 outline-none text-lg"
                            />
                            <button className="btn btn-primary px-6 m-1.5 text-xs font-bold uppercase tracking-wider">
                                Search
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {["React", "Remote", "Senior", "Design", "AI/ML"].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setQuery(suggestion)}
                                    className="text-[10px] uppercase tracking-wider text-neutral-content/40 hover:text-primary transition-colors px-2 py-1 border border-neutral-content/10 hover:border-primary/30"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/5 hidden lg:block" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
            </section>

            {/* ════════════════════ SEARCH BODY ════════════════════ */}
            <div className="search-body container mx-auto px-6 lg:px-12 py-12 opacity-0">
                {/* ── Results toolbar ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <p className="text-lg font-black tracking-tight">
                            <span className="text-primary">{results.length}</span>{" "}
                            {results.length === 1 ? "result" : "results"}
                        </p>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-ghost btn-sm gap-1.5 text-xs"
                        >
                            <i className="fa-duotone fa-regular fa-sliders text-xs"></i>
                            {showFilters ? "Hide Filters" : "Show Filters"}
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="select select-bordered select-sm text-xs"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* View toggle */}
                        <div className="flex border border-base-300">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-content" : "text-base-content/40 hover:text-base-content"}`}
                            >
                                <i className="fa-duotone fa-regular fa-list text-xs"></i>
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-content" : "text-base-content/40 hover:text-base-content"}`}
                            >
                                <i className="fa-duotone fa-regular fa-grid-2 text-xs"></i>
                            </button>
                        </div>

                        {/* Save search */}
                        <button
                            onClick={() => setSavedSearch(!savedSearch)}
                            className={`btn btn-sm btn-ghost gap-1.5 text-xs ${savedSearch ? "text-primary" : ""}`}
                        >
                            <i className={`fa-${savedSearch ? "solid" : "duotone fa-regular"} fa-bell text-xs`}></i>
                            {savedSearch ? "Saved" : "Save Search"}
                        </button>
                    </div>
                </div>

                {/* ── Active Filters ── */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-base-200">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/30 mr-1">Active:</span>
                        {activeFilters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => clearFilter(f.key)}
                                className="group flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-error/10 hover:text-error transition-colors"
                            >
                                <span className="text-base-content/40">{f.label}:</span>
                                <span>{f.value}</span>
                                <i className="fa-duotone fa-regular fa-xmark text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </button>
                        ))}
                        <button onClick={clearAll} className="text-[10px] text-base-content/30 hover:text-error transition-colors underline ml-2">
                            Clear all
                        </button>
                    </div>
                )}

                {/* ── Main layout: sidebar + results ── */}
                <div className="flex gap-8">
                    {/* ── Filter Sidebar ── */}
                    {showFilters && (
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                <div className="border-2 border-base-300 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-wider">Filters</h3>
                                        <button onClick={clearAll} className="text-[10px] text-base-content/30 hover:text-primary transition-colors">Reset</button>
                                    </div>

                                    <FilterSelect label="Department" icon="fa-duotone fa-regular fa-building" options={departments} value={department} onChange={setDepartment} />
                                    <FilterSelect label="Level" icon="fa-duotone fa-regular fa-signal" options={levels} value={level} onChange={setLevel} />
                                    <FilterSelect label="Type" icon="fa-duotone fa-regular fa-clock" options={types} value={type} onChange={setType} />
                                    <FilterSelect label="Location" icon="fa-duotone fa-regular fa-location-dot" options={locationOptions} value={location} onChange={setLocation} />

                                    {/* Salary Range */}
                                    <div className="mb-5">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/50 flex items-center gap-1.5 mb-2">
                                            <i className="fa-duotone fa-regular fa-dollar-sign text-xs"></i>Salary Range
                                        </label>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-base-content/40">${salaryRange[0]}k</span>
                                            <span className="text-xs text-base-content/20">&ndash;</span>
                                            <span className="text-xs text-base-content/40">${salaryRange[1]}k</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={400}
                                            step={10}
                                            value={salaryRange[0]}
                                            onChange={(e) => setSalaryRange([Math.min(Number(e.target.value), salaryRange[1] - 10), salaryRange[1]])}
                                            className="range range-primary range-xs w-full mb-1"
                                        />
                                        <input
                                            type="range"
                                            min={0}
                                            max={400}
                                            step={10}
                                            value={salaryRange[1]}
                                            onChange={(e) => setSalaryRange([salaryRange[0], Math.max(Number(e.target.value), salaryRange[0] + 10)])}
                                            className="range range-primary range-xs w-full"
                                        />
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="border-t border-base-200 pt-5 mt-2">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/30 mb-3">Quick Stats</p>
                                        <div className="space-y-2">
                                            {[
                                                { label: "Remote roles", count: allJobs.filter((j) => j.type === "remote").length },
                                                { label: "Senior+", count: allJobs.filter((j) => j.level === "Senior" || j.level === "Executive" || j.level === "Lead").length },
                                                { label: "$150k+", count: allJobs.filter((j) => j.salaryNum >= 150).length },
                                            ].map((stat) => (
                                                <div key={stat.label} className="flex items-center justify-between text-xs">
                                                    <span className="text-base-content/50">{stat.label}</span>
                                                    <span className="font-bold text-primary">{stat.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* ── Results ── */}
                    <div className="flex-1 min-w-0">
                        {results.length === 0 ? (
                            /* ── Empty state ── */
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-base-200 flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-3xl text-base-content/20"></i>
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-2">No results found</h3>
                                <p className="text-sm text-base-content/40 mb-6 max-w-md mx-auto">
                                    Try adjusting your filters or search terms to find more roles.
                                </p>
                                <button onClick={clearAll} className="btn btn-primary btn-sm text-xs font-bold uppercase tracking-wider">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : viewMode === "list" ? (
                            /* ── List View ── */
                            <div className="space-y-3">
                                {results.map((job) => (
                                    <div key={job.id} className="group border-2 border-base-300 hover:border-primary/30 transition-colors cursor-pointer">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                                            {/* Left: Avatar + Info */}
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <img src={job.avatar} alt={job.recruiter} className="w-10 h-10 object-cover flex-shrink-0 hidden sm:block" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-base font-black tracking-tight leading-tight group-hover:text-primary transition-colors truncate">{job.title}</h3>
                                                        {job.daysAgo === 0 && (
                                                            <span className="text-[8px] font-bold uppercase tracking-wider bg-success/20 text-success px-1.5 py-0.5 flex-shrink-0">New</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-base-content/50 truncate">{job.company} &middot; {job.location}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {job.tags.map((tag, i) => (
                                                            <span key={i} className="text-[8px] uppercase tracking-wider bg-base-200 text-base-content/40 px-2 py-0.5">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Salary + Meta */}
                                            <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-1 flex-shrink-0">
                                                <span className="text-base font-black text-primary tracking-tight">{job.salary}</span>
                                                <div className="flex items-center gap-3 text-[10px] text-base-content/30">
                                                    <span className="capitalize">{job.type}</span>
                                                    <span className="capitalize">{job.level}</span>
                                                    <span>{job.posted}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-base-content/30">
                                                    <span><i className="fa-duotone fa-regular fa-users mr-0.5"></i>{job.applicants}</span>
                                                    <span className="text-secondary font-bold">{job.splitFee} split</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* ── Grid View ── */
                            <div className="grid md:grid-cols-2 gap-4">
                                {results.map((job) => (
                                    <div key={job.id} className="group border-2 border-base-300 hover:border-primary/30 transition-colors cursor-pointer p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] uppercase tracking-wider text-base-content/30 capitalize">{job.type}</span>
                                                {job.daysAgo === 0 && (
                                                    <span className="text-[8px] font-bold uppercase tracking-wider bg-success/20 text-success px-1.5 py-0.5">New</span>
                                                )}
                                            </div>
                                            <span className="text-secondary text-[10px] font-bold">{job.splitFee} split</span>
                                        </div>
                                        <h3 className="text-lg font-black tracking-tight leading-tight mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                                        <p className="text-sm text-base-content/50 mb-1">{job.company}</p>
                                        <p className="text-xs text-base-content/30 mb-3"><i className="fa-duotone fa-regular fa-location-dot mr-1"></i>{job.location}</p>
                                        <p className="text-base font-black text-primary tracking-tight mb-3">{job.salary}</p>
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {job.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="text-[8px] uppercase tracking-wider bg-base-200 text-base-content/40 px-2 py-0.5">{tag}</span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-base-content/40 line-clamp-2 mb-4">{job.description}</p>
                                        <div className="flex items-center justify-between pt-3 border-t border-base-200">
                                            <div className="flex items-center gap-2">
                                                <img src={job.avatar} alt={job.recruiter} className="w-5 h-5 object-cover" />
                                                <span className="text-[10px] text-base-content/40">{job.recruiter}</span>
                                            </div>
                                            <span className="text-[10px] text-base-content/30"><i className="fa-duotone fa-regular fa-users mr-0.5"></i>{job.applicants}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Pagination ── */}
                        {results.length > 0 && (
                            <div className="flex items-center justify-between pt-8 mt-8 border-t border-base-200">
                                <p className="text-xs text-base-content/30">
                                    Showing <span className="font-bold text-base-content">{results.length}</span> of <span className="font-bold text-base-content">{allJobs.length}</span> roles
                                </p>
                                <div className="flex gap-1">
                                    <button className="w-8 h-8 flex items-center justify-center border border-base-300 text-base-content/30 hover:text-base-content transition-colors" disabled>
                                        <i className="fa-duotone fa-regular fa-chevron-left text-xs"></i>
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center bg-primary text-primary-content text-xs font-bold">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center border border-base-300 text-xs text-base-content/40 hover:text-base-content transition-colors">2</button>
                                    <button className="w-8 h-8 flex items-center justify-center border border-base-300 text-xs text-base-content/40 hover:text-base-content transition-colors">3</button>
                                    <button className="w-8 h-8 flex items-center justify-center border border-base-300 text-base-content/30 hover:text-base-content transition-colors">
                                        <i className="fa-duotone fa-regular fa-chevron-right text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ════════════════════ MOBILE FILTER DRAWER ════════════════════ */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-primary shadow-lg gap-2 px-6"
                >
                    <i className="fa-duotone fa-regular fa-sliders"></i>
                    Filters
                    {activeFilters.length > 0 && (
                        <span className="badge badge-sm bg-primary-content text-primary">{activeFilters.length}</span>
                    )}
                </button>
            </div>
        </main>
    );
}
