"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ─── data ─── */

const profile = {
  name: "Katherine Reyes",
  title: "Senior Recruiting Partner",
  company: "Apex Recruiting Group",
  location: "San Francisco, CA",
  timezone: "PST (UTC-8)",
  email: "k.reyes@apexrecruiting.com",
  phone: "+1 (415) 555-0142",
  joined: "March 2022",
  bio: "15+ years of technical recruiting experience specializing in senior engineering and leadership placements. Former software engineer turned recruiter with deep technical understanding. Known for high fill rates and strong candidate-company culture matching.",
  specializations: ["Senior Engineering", "Engineering Leadership", "Platform Teams", "AI/ML", "DevOps"],
  regions: ["West Coast", "Pacific Northwest", "Remote-First"],
};

const stats = [
  { label: "Placements", value: "342", icon: "fa-clipboard-check", trend: "+18 this quarter" },
  { label: "Success Rate", value: "94%", icon: "fa-bullseye", trend: "+2.3% YoY" },
  { label: "Avg Fill Time", value: "23d", icon: "fa-clock", trend: "-4d vs industry" },
  { label: "Rating", value: "4.9", icon: "fa-star", trend: "from 186 reviews" },
  { label: "Active Splits", value: "18", icon: "fa-split", trend: "across 6 clients" },
  { label: "Network Score", value: "97", icon: "fa-chart-network", trend: "Top 3% nationally" },
];

const experience = [
  { period: "2022 - Present", role: "Senior Recruiting Partner", company: "Apex Recruiting Group", description: "Leading a team of 8 recruiters focused on senior technical placements. Manage enterprise client relationships and split-fee partnerships.", icon: "fa-briefcase", color: "primary" },
  { period: "2018 - 2022", role: "Technical Recruiter", company: "TechBridge Staffing", description: "Full-cycle technical recruiting for Series B-D startups. Averaged 45 placements per year with 92% retention rate.", icon: "fa-users", color: "primary" },
  { period: "2014 - 2018", role: "Software Engineer", company: "Relay Systems", description: "Full-stack development on enterprise SaaS products. Transitioned to recruiting after discovering passion for connecting talent with opportunity.", icon: "fa-code", color: "primary" },
];

const recentActivity = [
  { action: "Placed Senior Backend Engineer", client: "Nexus Dynamics", time: "2 days ago", icon: "fa-circle-check", color: "success" },
  { action: "Submitted 3 candidates for VP Eng", client: "Cortex AI", time: "4 days ago", icon: "fa-paper-plane", color: "primary" },
  { action: "Accepted split-fee proposal", client: "TechFlow Partners", time: "1 week ago", icon: "fa-handshake", color: "primary" },
  { action: "New client onboarded", client: "DataVault Inc", time: "1 week ago", icon: "fa-building", color: "success" },
  { action: "Received 5-star review", client: "CloudBase", time: "2 weeks ago", icon: "fa-star", color: "warning" },
];

const relatedProfiles = [
  { name: "Marcus Chen", role: "Engineering Recruiter", company: "TechFlow Partners", placements: 198, rating: 4.7 },
  { name: "Sarah Okonkwo", role: "Executive Search", company: "Summit Talent", placements: 87, rating: 4.8 },
  { name: "James Park", role: "Technical Recruiter", company: "Horizon Staffing", placements: 256, rating: 4.9 },
];

/* ─── component ─── */

export default function ProfilesShowcaseTen() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<"about" | "activity" | "reviews">("about");
  const [connected, setConnected] = useState(false);

  useGSAP(() => {
    if (!mainRef.current) return;
    const p = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (p) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(".profile-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.6 })
      .fromTo(".profile-header", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
      .fromTo(".stat-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.2")
      .fromTo(".profile-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");

    gsap.fromTo(".timeline-entry", { opacity: 0, x: -20 }, {
      opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out",
      scrollTrigger: { trigger: ".timeline-section", start: "top 85%" },
    });

    gsap.fromTo(".related-card", { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.4, stagger: 0.1,
      scrollTrigger: { trigger: ".related-section", start: "top 85%" },
    });

    gsap.fromTo(".status-pulse", { scale: 0.6, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: mainRef });

  return (
    <main ref={mainRef} className="min-h-screen bg-base-300 text-base-content overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30 pointer-events-none z-10" />

      {/* Profile Header */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-8">
        <div className="profile-scanline h-[2px] bg-primary w-32 mb-6 origin-left" />

        <div className="profile-header flex flex-col lg:flex-row gap-8">
          {/* Avatar + Info */}
          <div className="flex items-start gap-6 flex-1">
            <div className="w-24 h-24 flex items-center justify-center bg-primary/10 text-primary border-2 border-primary/20 font-mono text-3xl font-black flex-shrink-0">
              KR
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
                <span className="px-2 py-0.5 bg-success/10 border border-success/20 text-success font-mono text-[9px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" /> Online
                </span>
              </div>
              <p className="text-base-content/50 mb-1">{profile.title} at <span className="text-base-content/70">{profile.company}</span></p>
              <div className="flex items-center gap-4 text-xs text-base-content/30 mb-4">
                <span className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-location-dot text-[10px]" /> {profile.location}</span>
                <span className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-clock text-[10px]" /> {profile.timezone}</span>
                <span className="flex items-center gap-1"><i className="fa-duotone fa-regular fa-calendar text-[10px]" /> Joined {profile.joined}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.specializations.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-primary/5 border border-primary/15 text-primary font-mono text-[10px] uppercase">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start gap-2 flex-shrink-0">
            <button onClick={() => setConnected(!connected)} className={`btn btn-sm font-mono uppercase tracking-wider text-[10px] ${connected ? "btn-primary" : "btn-outline"}`}>
              <i className={`fa-duotone fa-regular ${connected ? "fa-check" : "fa-link"} mr-1`} /> {connected ? "Connected" : "Connect"}
            </button>
            <button className="btn btn-outline btn-sm font-mono uppercase tracking-wider text-[10px]">
              <i className="fa-duotone fa-regular fa-envelope mr-1" /> Message
            </button>
            <button className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]">
              <i className="fa-duotone fa-regular fa-share-nodes mr-1" /> Share
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="stat-card p-4 bg-base-200 border border-base-content/5 text-center">
              <i className={`fa-duotone fa-regular ${s.icon} text-primary text-sm mb-2 block`} />
              <p className="font-mono text-2xl font-black text-primary">{s.value}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/30 mb-1">{s.label}</p>
              <p className="font-mono text-[9px] text-base-content/20">{s.trend}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 profile-content space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-base-content/10">
              {(["about", "activity", "reviews"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 -mb-[1px] transition-colors ${
                  activeTab === tab ? "text-primary border-primary bg-primary/5" : "text-base-content/30 border-transparent hover:text-base-content/50"
                }`}>{tab}</button>
              ))}
            </div>

            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Bio */}
                <div className="p-6 bg-base-200 border border-base-content/5">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fa-duotone fa-regular fa-user text-primary text-sm" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// about</span>
                  </div>
                  <p className="text-sm text-base-content/60 leading-relaxed">{profile.bio}</p>
                </div>

                {/* Experience */}
                <div className="timeline-section p-6 bg-base-200 border border-base-content/5">
                  <div className="flex items-center gap-2 mb-6">
                    <i className="fa-duotone fa-regular fa-timeline text-primary text-sm" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// career.history</span>
                  </div>
                  <div className="space-y-0">
                    {experience.map((exp, i) => (
                      <div key={i} className="timeline-entry flex gap-4 relative">
                        {i < experience.length - 1 && <div className="absolute left-[15px] top-9 bottom-0 w-[1px] bg-base-content/10" />}
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                          <i className={`fa-duotone fa-regular ${exp.icon} text-xs`} />
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-mono text-[10px] text-base-content/25 uppercase tracking-wider mb-1">{exp.period}</p>
                          <p className="text-sm font-bold">{exp.role}</p>
                          <p className="text-xs text-base-content/40 mb-2">{exp.company}</p>
                          <p className="text-xs text-base-content/50 leading-relaxed">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regions */}
                <div className="p-6 bg-base-200 border border-base-content/5">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fa-duotone fa-regular fa-globe text-primary text-sm" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// coverage.regions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.regions.map((r) => (
                      <span key={r} className="px-3 py-1 bg-base-300 border border-base-content/10 font-mono text-xs text-base-content/50">{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="p-6 bg-base-200 border border-base-content/5">
                <div className="flex items-center gap-2 mb-6">
                  <i className="fa-duotone fa-regular fa-signal-stream text-primary text-sm" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// recent.activity</span>
                </div>
                <div className="space-y-0">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < recentActivity.length - 1 && <div className="absolute left-[15px] top-9 bottom-0 w-[1px] bg-base-content/10" />}
                      <div className={`w-8 h-8 flex items-center justify-center border flex-shrink-0 ${
                        item.color === "success" ? "bg-success/10 border-success/20 text-success" :
                        item.color === "warning" ? "bg-warning/10 border-warning/20 text-warning" :
                        "bg-primary/10 border-primary/20 text-primary"
                      }`}><i className={`fa-duotone fa-regular ${item.icon} text-xs`} /></div>
                      <div className="flex-1 pb-5">
                        <p className="text-sm text-base-content/70">{item.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-mono text-[10px] text-base-content/30">{item.client}</span>
                          <span className="text-base-content/10">|</span>
                          <span className="font-mono text-[10px] text-base-content/20">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {[
                  { author: "J. Martinez", company: "Nexus Dynamics", rating: 5, text: "Katherine understood our technical requirements perfectly. She delivered a shortlist of 5 candidates, all of whom made it to final rounds. Exceptional quality.", time: "2 weeks ago" },
                  { author: "R. Singh", company: "CloudBase", rating: 5, text: "Fast, professional, and incredibly thorough. Her engineering background means she can actually evaluate technical candidates, not just keyword match.", time: "1 month ago" },
                  { author: "L. Torres", company: "DataVault", rating: 4, text: "Great partnership on a difficult VP Engineering search. Took a bit longer than expected but the final placement was outstanding.", time: "2 months ago" },
                ].map((review, i) => (
                  <div key={i} className="p-5 bg-base-200 border border-base-content/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center bg-base-300 border border-base-content/10 font-mono text-xs font-bold">{review.author.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold">{review.author}</p>
                          <p className="font-mono text-[10px] text-base-content/30">{review.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <i key={j} className="fa-solid fa-star text-warning text-[10px]" />
                        ))}
                        <span className="font-mono text-[10px] text-base-content/20 ml-2">{review.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-base-content/50 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-5 bg-base-200 border border-base-content/5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-duotone fa-regular fa-id-card text-primary text-sm" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// contact</span>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="text-base-content/25 font-mono text-[10px] uppercase block">Email</span><p className="text-base-content/60 font-mono text-xs">{profile.email}</p></div>
                <div><span className="text-base-content/25 font-mono text-[10px] uppercase block">Phone</span><p className="text-base-content/60 font-mono text-xs">{profile.phone}</p></div>
                <div><span className="text-base-content/25 font-mono text-[10px] uppercase block">Company</span><p className="text-base-content/60">{profile.company}</p></div>
              </div>
            </div>

            <div className="p-5 bg-base-200 border border-base-content/5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-duotone fa-regular fa-chart-pie text-primary text-sm" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">// placement.breakdown</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Engineering", pct: 62 },
                  { label: "Leadership", pct: 21 },
                  { label: "Product", pct: 11 },
                  { label: "Other", pct: 6 },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-base-content/40">{b.label}</span>
                      <span className="font-mono text-[10px] text-base-content/25">{b.pct}%</span>
                    </div>
                    <div className="w-full h-1 bg-base-300">
                      <div className="h-full bg-primary" style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Profiles */}
            <div className="related-section">
              <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/25 mb-3">Similar Recruiters</p>
              <div className="space-y-3">
                {relatedProfiles.map((p) => (
                  <div key={p.name} className="related-card p-4 bg-base-200 border border-base-content/5 hover:border-primary/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-mono text-xs font-bold">{p.name.split(" ").map(n => n[0]).join("")}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="font-mono text-[10px] text-base-content/30 truncate">{p.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-primary">{p.placements}</p>
                        <p className="font-mono text-[8px] text-base-content/20">placements</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
          <div className="flex items-center gap-2"><span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" /><span className="font-mono text-[10px] uppercase tracking-wider">Profile System Operational</span></div>
          <span className="text-base-content/10">|</span>
          <span className="font-mono text-[10px] uppercase tracking-wider">Splits Network // Component Showcase</span>
        </div>
      </section>
    </main>
  );
}
