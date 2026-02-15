"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── data ─── */

const statusIndicators = [
  { label: "Active Recruiters", value: "2,847", status: "online" },
  { label: "Open Positions", value: "14,392", status: "online" },
  { label: "Placements Today", value: "186", status: "online" },
  { label: "Network Uptime", value: "99.97%", status: "online" },
];

const operationPanels = [
  {
    icon: "fa-radar",
    title: "Talent Radar",
    description:
      "Scan the entire candidate network in real time. AI-powered matching surfaces top-fit candidates before your competitors even know they exist.",
    metric: "12ms",
    metricLabel: "avg match time",
  },
  {
    icon: "fa-split",
    title: "Split Operations",
    description:
      "Negotiate, structure, and execute split-fee agreements from a single command interface. Every term tracked, every payout automated.",
    metric: "3,200+",
    metricLabel: "active splits",
  },
  {
    icon: "fa-chart-network",
    title: "Network Intelligence",
    description:
      "Map recruiter specializations, placement histories, and collaboration patterns. Identify the right partner for every search.",
    metric: "48K",
    metricLabel: "connections mapped",
  },
  {
    icon: "fa-shield-check",
    title: "Compliance Monitor",
    description:
      "Automated fee verification, contract enforcement, and audit trails. Every transaction is transparent, every payment is on time.",
    metric: "100%",
    metricLabel: "fee accuracy",
  },
];

const systemModules = [
  {
    icon: "fa-magnifying-glass-chart",
    title: "Job Command",
    items: [
      "Post positions across the network",
      "Set split terms and recruiter requirements",
      "Track pipeline velocity in real time",
    ],
  },
  {
    icon: "fa-users-gear",
    title: "Recruiter Ops",
    items: [
      "Browse and vet network partners",
      "Monitor assignment progress",
      "Rate and review collaborators",
    ],
  },
  {
    icon: "fa-money-check-dollar",
    title: "Billing Core",
    items: [
      "Automated split-fee calculations",
      "Stripe-powered instant payouts",
      "Full invoice and audit history",
    ],
  },
];

const deploymentPhases = [
  {
    phase: "01",
    title: "Initialize",
    description: "Create your organization and configure your recruiting profile. Set specializations, regions, and split preferences.",
    icon: "fa-power-off",
  },
  {
    phase: "02",
    title: "Connect",
    description: "The network scans for compatible partners. Accept or propose splits on active job orders that match your expertise.",
    icon: "fa-link",
  },
  {
    phase: "03",
    title: "Execute",
    description: "Work candidates through the pipeline. Every stage is tracked, every handoff is logged, every milestone triggers the next action.",
    icon: "fa-terminal",
  },
  {
    phase: "04",
    title: "Collect",
    description: "Placement confirmed. Fees calculated automatically, payouts distributed on schedule. No chasing invoices.",
    icon: "fa-vault",
  },
];

/* ─── component ─── */

export default function LandingPageTen() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!mainRef.current) return;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      /* ── hero boot sequence ── */
      const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
      heroTl
        .fromTo(
          ".hero-scanline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6 }
        )
        .fromTo(
          ".hero-title span",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          "-=0.2"
        )
        .fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.1"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.4 },
          "-=0.2"
        );

      /* ── status indicators pulse ── */
      gsap.fromTo(
        ".status-dot",
        { scale: 0.6, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          stagger: 0.3,
          ease: "sine.inOut",
        }
      );

      /* ── status cards stagger ── */
      gsap.fromTo(
        ".status-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".status-bar",
            start: "top 85%",
          },
        }
      );

      /* ── operation panels power on ── */
      gsap.fromTo(
        ".op-panel",
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".ops-grid",
            start: "top 80%",
          },
        }
      );

      /* ── panel border glow on hover (set initial) ── */
      gsap.set(".op-panel", { "--glow": "0" });

      /* ── system modules slide in ── */
      gsap.fromTo(
        ".sys-module",
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".sys-section",
            start: "top 80%",
          },
        }
      );

      /* ── deployment phases ── */
      gsap.fromTo(
        ".deploy-phase",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.18,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".deploy-section",
            start: "top 80%",
          },
        }
      );

      /* ── image reveal ── */
      gsap.fromTo(
        ".img-reveal",
        { opacity: 0, scale: 1.05 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".img-reveal",
            start: "top 85%",
          },
        }
      );

      /* ── CTA final section ── */
      gsap.fromTo(
        ".cta-final",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-final",
            start: "top 85%",
          },
        }
      );
    },
    { scope: mainRef }
  );

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
    >
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6">
        {/* Background grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Scanline accent */}
          <div className="hero-scanline h-[2px] bg-primary w-48 mx-auto mb-10 origin-left" />

          <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-6 opacity-80">
            sys.init &gt; splits_network v2.0
          </p>

          <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8">
            <span className="block">Mission</span>
            <span className="block text-primary">Control</span>
            <span className="block text-base-content/60 text-3xl md:text-4xl lg:text-5xl mt-2 font-light tracking-wide">
              for Recruiting
            </span>
          </h1>

          <p className="hero-subtitle max-w-2xl mx-auto text-lg md:text-xl text-base-content/50 font-light leading-relaxed mb-10">
            A unified command center for split-fee recruiting. Monitor your
            network, execute placements, and collect fees — all from one
            operational dashboard.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-primary btn-lg font-mono uppercase tracking-wider text-sm">
              <i className="fa-duotone fa-regular fa-power-off mr-2" />
              Initialize System
            </button>
            <button className="btn btn-outline btn-lg font-mono uppercase tracking-wider text-sm">
              <i className="fa-duotone fa-regular fa-play mr-2" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30" />
        <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30" />
      </section>

      {/* ═══ STATUS BAR ═══ */}
      <section className="status-bar py-8 px-6 border-y border-base-content/10 bg-base-200">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusIndicators.map((item) => (
            <div
              key={item.label}
              className="status-card flex items-center gap-4 p-4 bg-base-300 border border-base-content/5"
            >
              <div className="status-dot w-2.5 h-2.5 rounded-full bg-success flex-shrink-0" />
              <div>
                <p className="font-mono text-2xl font-bold text-base-content">
                  {item.value}
                </p>
                <p className="text-xs font-mono uppercase tracking-wider text-base-content/40">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ OPERATIONS GRID ═══ */}
      <section className="ops-grid py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
              // core.operations
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Systems Online
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {operationPanels.map((panel, idx) => (
              <div
                key={panel.title}
                className={`op-panel group relative p-8 bg-base-200 border border-base-content/5 hover:border-primary/30 transition-colors duration-300 ${
                  idx === 0 ? "md:row-span-2" : ""
                }`}
              >
                {/* Panel index */}
                <span className="absolute top-4 right-4 font-mono text-xs text-base-content/20">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                    <i
                      className={`fa-duotone fa-regular ${panel.icon} text-xl`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {panel.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-success">
                        operational
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-base-content/50 leading-relaxed mb-6">
                  {panel.description}
                </p>

                <div className="pt-4 border-t border-base-content/5">
                  <span className="font-mono text-3xl font-black text-primary">
                    {panel.metric}
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mt-1">
                    {panel.metricLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ IMAGE BREAK ═══ */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="img-reveal relative overflow-hidden aspect-[21/9]">
            <img
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1800&q=80&auto=format&fit=crop"
              alt="Dark collaborative tech workspace"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-base-300/40" />
            {/* HUD overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-mono text-xs tracking-[0.4em] uppercase text-primary/80 mb-2">
                  [ live feed ]
                </p>
                <p className="font-mono text-sm text-base-content/60">
                  Network operations running across 12 regions
                </p>
              </div>
            </div>
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-primary/50" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-primary/50" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-primary/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-primary/50" />
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM MODULES ═══ */}
      <section className="sys-section py-24 px-6 bg-base-200 border-y border-base-content/10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
              // system.modules
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Every Module, One Interface
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {systemModules.map((mod) => (
              <div
                key={mod.title}
                className="sys-module p-8 bg-base-300 border border-base-content/5"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 mb-6">
                  <i
                    className={`fa-duotone fa-regular ${mod.icon} text-lg`}
                  />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-4">
                  {mod.title}
                </h3>
                <ul className="space-y-3">
                  {mod.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-base-content/50"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEPLOYMENT PHASES ═══ */}
      <section className="deploy-section py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
              // deployment.sequence
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Four-Phase Deployment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deploymentPhases.map((phase) => (
              <div
                key={phase.phase}
                className="deploy-phase relative p-8 bg-base-200 border border-base-content/5 group hover:border-primary/20 transition-colors duration-300"
              >
                <span className="font-mono text-6xl font-black text-base-content/[0.04] absolute top-4 right-4 leading-none">
                  {phase.phase}
                </span>
                <div className="relative z-10">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 mb-6">
                    <i
                      className={`fa-duotone fa-regular ${phase.icon} text-lg`}
                    />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-3">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-base-content/40 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
                {/* Connection line */}
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-base-content/10 last:hidden" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECOND IMAGE BREAK ═══ */}
      <section className="relative py-24 px-6 bg-base-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
              // real_time.dashboard
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
              See Everything. Miss Nothing.
            </h2>
            <p className="text-base-content/50 leading-relaxed mb-8">
              Your recruiting operation generates thousands of data points
              daily. Mission Control aggregates pipeline activity, partner
              performance, and financial metrics into a single, real-time
              view. No tab-switching. No spreadsheet wrangling. Just signal.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "340ms", label: "Refresh Rate" },
                { val: "24/7", label: "Monitoring" },
                { val: "Zero", label: "Blind Spots" },
                { val: "Live", label: "Candidate Feed" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 bg-base-300 border border-base-content/5"
                >
                  <p className="font-mono text-xl font-bold text-primary">
                    {stat.val}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="img-reveal relative overflow-hidden aspect-square">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80&auto=format&fit=crop"
              alt="Dark tech operations environment"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-base-300/30" />
            <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-primary/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-primary/50" />
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIAL / SIGNAL ═══ */}
      <section className="py-24 px-6 border-t border-base-content/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-[2px] bg-primary mx-auto mb-10" />
          <blockquote className="text-2xl md:text-3xl font-light leading-relaxed text-base-content/70 mb-8">
            &ldquo;We went from managing splits across emails, spreadsheets,
            and phone calls to having a single command center. Our placement
            velocity doubled in the first quarter.&rdquo;
          </blockquote>
          <div>
            <p className="font-mono text-sm font-bold tracking-wide">
              Director of Recruiting Operations
            </p>
            <p className="font-mono text-xs text-base-content/30 mt-1 uppercase tracking-wider">
              National Staffing Firm // 200+ Recruiters
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="cta-final py-32 px-6 bg-base-200 border-t border-base-content/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-6">
            // ready_to_deploy
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Your Network Awaits
          </h2>
          <p className="text-lg text-base-content/40 max-w-xl mx-auto mb-10">
            Stop operating in the dark. Initialize your command center and
            take control of every split, every placement, every dollar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-primary btn-lg font-mono uppercase tracking-wider text-sm">
              <i className="fa-duotone fa-regular fa-rocket-launch mr-2" />
              Deploy Now
            </button>
            <button className="btn btn-outline btn-lg font-mono uppercase tracking-wider text-sm">
              <i className="fa-duotone fa-regular fa-headset mr-2" />
              Request Briefing
            </button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-base-content/20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                All Systems Operational
              </span>
            </div>
            <span className="text-base-content/10">|</span>
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Splits Network // Employment Networks
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
