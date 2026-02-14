"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Empty State Scenarios ─── */

const emptyStates = [
  {
    id: "no-results",
    tag: "// search.empty",
    title: "No Results Found",
    scenario: "No Search Results",
    icon: "fa-magnifying-glass-minus",
    iconBg: "bg-base-content/5",
    iconBorder: "border-base-content/10",
    iconColor: "text-base-content/20",
    heading: "No Matches in the Network",
    description: "Your search for \"Senior Quantum Engineer\" in \"Antarctica\" returned zero results. The network is vast, but not that vast.",
    suggestions: [
      "Try broadening your search terms",
      "Remove some filters to widen results",
      "Check spelling of keywords",
      "Search by skill instead of exact title",
    ],
    primaryAction: { label: "Clear Filters", icon: "fa-filter-circle-xmark" },
    secondaryAction: { label: "Browse All Jobs", icon: "fa-grid-2" },
    decoration: "search",
  },
  {
    id: "first-time",
    tag: "// system.initialize",
    title: "First-Time User",
    scenario: "No Data Yet",
    icon: "fa-rocket-launch",
    iconBg: "bg-primary/10",
    iconBorder: "border-primary/20",
    iconColor: "text-primary",
    heading: "Ready for Launch",
    description: "Your command center is initialized and all systems are standing by. Deploy your first job order to activate the recruiting network and start receiving candidates.",
    suggestions: [
      "Create your organization profile",
      "Set your recruiting specializations",
      "Configure split-fee preferences",
      "Deploy your first job listing",
    ],
    primaryAction: { label: "Deploy First Job", icon: "fa-plus" },
    secondaryAction: { label: "Take the Tour", icon: "fa-compass" },
    decoration: "launch",
  },
  {
    id: "error",
    tag: "// system.error",
    title: "Error State",
    scenario: "Something Went Wrong",
    icon: "fa-triangle-exclamation",
    iconBg: "bg-error/10",
    iconBorder: "border-error/20",
    iconColor: "text-error",
    heading: "System Malfunction Detected",
    description: "The data pipeline encountered an unexpected fault while loading your dashboard. Our monitoring systems have already flagged the incident for the engineering team.",
    suggestions: [
      "Check your network connection",
      "Wait a moment and refresh the page",
      "Clear browser cache if the issue persists",
      "Contact support if the problem continues",
    ],
    primaryAction: { label: "Retry Connection", icon: "fa-rotate-right" },
    secondaryAction: { label: "Report Issue", icon: "fa-flag" },
    decoration: "error",
  },
  {
    id: "access-denied",
    tag: "// auth.denied",
    title: "Access Denied",
    scenario: "Permissions Required",
    icon: "fa-lock",
    iconBg: "bg-warning/10",
    iconBorder: "border-warning/20",
    iconColor: "text-warning",
    heading: "Clearance Level Insufficient",
    description: "You do not have the required permissions to access the Billing Core module. This area is restricted to Organization Admins and Finance operators.",
    suggestions: [
      "Verify your account role and permissions",
      "Request elevated access from your admin",
      "Check if you are in the correct organization",
      "Contact your organization admin for help",
    ],
    primaryAction: { label: "Request Access", icon: "fa-paper-plane" },
    secondaryAction: { label: "Go to Dashboard", icon: "fa-grid-2" },
    decoration: "lock",
  },
];

/* ─── Decorative Elements ─── */

function EmptyDecoration({ type }: { type: string }) {
  if (type === "search") {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Radar sweep */}
        <div className="absolute inset-0 border-2 border-base-content/5 rounded-full" />
        <div className="absolute inset-3 border border-base-content/5 rounded-full" />
        <div className="absolute inset-6 border border-dashed border-base-content/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-base-content/10" />
        {/* Cross hairs */}
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-base-content/5" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-base-content/5" />
      </div>
    );
  }

  if (type === "launch") {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Launch pad */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-primary/20" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-[1px] bg-primary/10" />
        {/* Rocket path dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 space-y-2 flex flex-col items-center">
          <div className="w-1 h-1 rounded-full bg-primary/10" />
          <div className="w-1 h-1 rounded-full bg-primary/15" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary/40" />
        </div>
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-l border-t border-primary/20" />
        <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-primary/20" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-primary/20" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-primary/20" />
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Broken circuit */}
        <div className="absolute top-1/2 left-4 w-8 h-[1px] bg-error/20" />
        <div className="absolute top-1/2 right-4 w-8 h-[1px] bg-error/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-dashed border-error/20 rotate-45" />
        {/* Warning stripes */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-2 h-[3px] bg-error/15" />
          <div className="w-2 h-[3px] bg-error/25" />
          <div className="w-2 h-[3px] bg-error/15" />
          <div className="w-2 h-[3px] bg-error/25" />
          <div className="w-2 h-[3px] bg-error/15" />
        </div>
      </div>
    );
  }

  if (type === "lock") {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Shield outline */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-20 border-2 border-warning/15 rounded-t-full" />
        {/* Horizontal lines (redacted) */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 space-y-1.5">
          <div className="w-12 h-[2px] bg-warning/10" />
          <div className="w-8 h-[2px] bg-warning/10" />
          <div className="w-10 h-[2px] bg-warning/10" />
        </div>
        {/* Corner markers */}
        <div className="absolute top-0 left-2 w-4 h-4 border-l border-t border-warning/15" />
        <div className="absolute top-0 right-2 w-4 h-4 border-r border-t border-warning/15" />
      </div>
    );
  }

  return null;
}

/* ─── Page Component ─── */

export default function EmptyStatesShowcaseTen() {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!mainRef.current) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.fromTo(".page-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.6 })
        .fromTo(".page-title span", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.2")
        .fromTo(".page-subtitle", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.1");

      gsap.fromTo(".empty-card", { opacity: 0, y: 40, scale: 0.97 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: ".empty-grid", start: "top 85%" },
      });

      gsap.fromTo(".status-pulse", { scale: 0.6, opacity: 0.4 }, {
        scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut",
      });
    },
    { scope: mainRef }
  );

  return (
    <main ref={mainRef} className="min-h-screen bg-base-300 text-base-content overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-primary/30 pointer-events-none z-10" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-primary/30 pointer-events-none z-10" />

      {/* Hero */}
      <section className="relative flex items-center justify-center px-6 pt-28 pb-12">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="page-scanline h-[2px] bg-primary w-48 mx-auto mb-8 origin-left" />
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-4 opacity-80">
            sys.ui &gt; empty_states v2.0
          </p>
          <h1 className="page-title text-4xl md:text-6xl font-black tracking-tight leading-[0.95] mb-6">
            <span className="block">Empty</span>
            <span className="block text-primary">States</span>
          </h1>
          <p className="page-subtitle max-w-xl mx-auto text-base-content/50 font-light leading-relaxed">
            Graceful handling for zero-data scenarios. Every void in the interface becomes
            an opportunity to guide the operator toward their next action.
          </p>
        </div>
      </section>

      {/* Empty States Grid */}
      <section className="empty-grid px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">// state.scenarios</p>
            <h2 className="text-2xl font-black tracking-tight">Scenario Library</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emptyStates.map((state, idx) => (
              <div key={state.id} className="empty-card bg-base-200 border border-base-content/5 overflow-hidden">
                {/* Scenario Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-base-content/5 bg-base-300/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">{state.tag}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/20">
                    {String(idx + 1).padStart(2, "0")} // {state.scenario}
                  </span>
                </div>

                {/* Empty State Content */}
                <div className="p-8 text-center">
                  <EmptyDecoration type={state.decoration} />

                  {/* Icon */}
                  <div className={`w-16 h-16 flex items-center justify-center ${state.iconBg} ${state.iconColor} border ${state.iconBorder} mx-auto mb-5`}>
                    <i className={`fa-duotone fa-regular ${state.icon} text-2xl`} />
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-black tracking-tight mb-2">{state.heading}</h3>
                  <p className="text-sm text-base-content/40 leading-relaxed max-w-sm mx-auto mb-6">
                    {state.description}
                  </p>

                  {/* Suggestions */}
                  <div className="text-left max-w-xs mx-auto mb-6">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/25 mb-2.5">
                      Suggested Actions
                    </p>
                    <ul className="space-y-2">
                      {state.suggestions.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-xs text-base-content/40">
                          <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-center">
                    <button className={`btn btn-sm font-mono uppercase tracking-wider text-[10px] ${
                      state.id === "error" ? "btn-error" :
                      state.id === "access-denied" ? "btn-warning" :
                      "btn-primary"
                    }`}>
                      <i className={`fa-duotone fa-regular ${state.primaryAction.icon} mr-1`} />
                      {state.primaryAction.label}
                    </button>
                    <button className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]">
                      <i className={`fa-duotone fa-regular ${state.secondaryAction.icon} mr-1`} />
                      {state.secondaryAction.label}
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-5 py-2 border-t border-base-content/5 bg-base-300/30">
                  <div className="flex items-center gap-2">
                    <span className={`status-pulse w-1.5 h-1.5 rounded-full ${
                      state.id === "error" ? "bg-error" :
                      state.id === "access-denied" ? "bg-warning" :
                      state.id === "no-results" ? "bg-base-content/20" :
                      "bg-success"
                    }`} />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-base-content/20">
                      {state.id === "error" ? "Fault Detected" :
                       state.id === "access-denied" ? "Access Restricted" :
                       state.id === "no-results" ? "Zero Results" :
                       "Awaiting Input"}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-base-content/15">
                    {state.id === "error" ? "ERR_500" :
                     state.id === "access-denied" ? "ERR_403" :
                     state.id === "no-results" ? "RES_0" :
                     "SYS_INIT"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spec Section */}
      <section className="px-6 pb-24 pt-8 border-t border-base-content/10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">// empty_state.anatomy</p>
            <h2 className="text-2xl font-black tracking-tight">Component Anatomy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Decorative Visual", detail: "Custom SVG/CSS illustration matching the scenario context", icon: "fa-palette" },
              { title: "Icon + Heading", detail: "Color-coded icon and bold descriptive heading", icon: "fa-heading" },
              { title: "Description", detail: "Concise explanation of what happened and why", icon: "fa-align-left" },
              { title: "Action Buttons", detail: "Primary CTA + secondary alternative, context-appropriate", icon: "fa-hand-pointer" },
            ].map((spec) => (
              <div key={spec.title} className="p-5 bg-base-200 border border-base-content/5">
                <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 mb-4">
                  <i className={`fa-duotone fa-regular ${spec.icon} text-sm`} />
                </div>
                <h3 className="text-sm font-bold tracking-tight mb-1.5">{spec.title}</h3>
                <p className="text-xs text-base-content/40 leading-relaxed">{spec.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
          <div className="flex items-center gap-2">
            <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
            <span className="font-mono text-[10px] uppercase tracking-wider">Empty State System Operational</span>
          </div>
          <span className="text-base-content/10">|</span>
          <span className="font-mono text-[10px] uppercase tracking-wider">Splits Network // Component Showcase</span>
        </div>
      </section>
    </main>
  );
}
