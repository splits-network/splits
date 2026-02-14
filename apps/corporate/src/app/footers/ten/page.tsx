"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── footer nav columns ─── */

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "#" },
      { label: "Job Marketplace", href: "#" },
      { label: "Split Agreements", href: "#" },
      { label: "Candidate Pool", href: "#" },
      { label: "Analytics", href: "#" },
      { label: "API Access", href: "#" },
    ],
  },
  {
    title: "Network",
    links: [
      { label: "Find Recruiters", href: "#" },
      { label: "Company Directory", href: "#" },
      { label: "Partnerships", href: "#" },
      { label: "Referral Program", href: "#" },
      { label: "Success Stories", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Webinars", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

/* ─── social links ─── */

const socialLinks = [
  { icon: "fa-linkedin-in", label: "LinkedIn", href: "#" },
  { icon: "fa-x-twitter", label: "X", href: "#" },
  { icon: "fa-github", label: "GitHub", href: "#" },
  { icon: "fa-youtube", label: "YouTube", href: "#" },
  { icon: "fa-discord", label: "Discord", href: "#" },
];

/* ─── system metrics ─── */

const systemMetrics = [
  { label: "Uptime", value: "99.97%", icon: "fa-signal" },
  { label: "Latency", value: "42ms", icon: "fa-gauge-high" },
  { label: "Active Users", value: "2.4K", icon: "fa-users" },
  { label: "Placements/mo", value: "312", icon: "fa-handshake" },
];

/* ─── sample content above footer ─── */

const testimonials = [
  {
    quote: "Splits Network transformed our recruiting process. We filled 3 VP-level roles in under 30 days through split-fee partnerships.",
    name: "Rachel Torres",
    role: "Head of Talent, TechCorp",
    initials: "RT",
  },
  {
    quote: "The split model lets us tap into specialized recruiters we'd never have access to otherwise. Our time-to-fill dropped by 40%.",
    name: "David Chen",
    role: "VP People, StreamFlow",
    initials: "DC",
  },
  {
    quote: "As an independent recruiter, this platform opened up enterprise clients that were previously out of reach. Revenue doubled in 6 months.",
    name: "Marcus Webb",
    role: "Senior Recruiter, Elite Search",
    initials: "MW",
  },
];

const stats = [
  { value: "2,400+", label: "Active Recruiters" },
  { value: "$18M+", label: "Fees Processed" },
  { value: "89", label: "Partner Companies" },
  { value: "18 days", label: "Avg. Time-to-Fill" },
];

/* ─── component ─── */

export default function FootersTen() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  /* ─── GSAP ─── */
  useGSAP(
    () => {
      if (!mainRef.current) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      gsap.fromTo(
        ".testimonial-card",
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ".testimonials-grid", start: "top 85%" },
        }
      );

      gsap.fromTo(
        ".stat-block",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ".stats-row", start: "top 85%" },
        }
      );

      gsap.fromTo(
        ".footer-scanline",
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: ".footer-main", start: "top 90%" },
        }
      );

      gsap.fromTo(
        ".footer-col",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ".footer-columns", start: "top 85%" },
        }
      );

      gsap.fromTo(
        ".footer-metric",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "power2.out",
          scrollTrigger: { trigger: ".footer-metrics", start: "top 90%" },
        }
      );

      gsap.fromTo(
        ".social-link",
        { opacity: 0, y: 10 },
        {
          opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power2.out",
          scrollTrigger: { trigger: ".social-row", start: "top 95%" },
        }
      );

      gsap.fromTo(
        ".footer-status-dot",
        { scale: 0.7, opacity: 0.4 },
        { scale: 1, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    },
    { scope: mainRef }
  );

  return (
    <div ref={mainRef} className="min-h-screen bg-base-300 text-base-content">
      {/* ═══ SAMPLE CONTENT ABOVE FOOTER ═══ */}

      {/* Hero context */}
      <section className="relative px-6 pt-16 pb-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] bg-primary w-24" />
          </div>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3 opacity-80">
            sys.network &gt; footer_showcase v2.0
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-3">
            <span>Footer </span>
            <span className="text-primary">Showcase</span>
          </h1>
          <p className="text-base-content/40 font-mono text-sm max-w-lg">
            Mission Control footer design. Scroll down to see the full footer with system metrics, navigation, and newsletter signup.
          </p>
        </div>
        <div className="absolute top-12 right-6 w-10 h-10 border-r-2 border-t-2 border-primary/20" />
      </section>

      {/* Testimonials */}
      <section className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary mb-2">// network.voices</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">What They Say</h2>
          </div>
          <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card p-6 bg-base-200 border border-base-content/5 hover:border-primary/15 transition-colors">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star text-[10px] text-warning/60" />
                  ))}
                </div>
                <p className="font-mono text-xs leading-relaxed text-base-content/50 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-base-content/5">
                  <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-base-content/70">{t.name}</p>
                    <p className="font-mono text-[10px] text-base-content/30">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 py-10">
        <div className="stats-row max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-block p-6 bg-base-200 border border-base-content/5 text-center">
              <p className="font-mono text-3xl font-black text-primary tracking-tight">{s.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-base-200 border border-base-content/5 p-10 md:p-16 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative z-10">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary mb-4">// ready.to.launch</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Join the <span className="text-primary">Network</span>
              </h2>
              <p className="font-mono text-sm text-base-content/40 max-w-md mx-auto mb-8">
                Connect with top recruiters, access premium job listings, and accelerate your placements through split-fee partnerships.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button className="px-8 py-3 bg-primary text-primary-content font-mono text-xs uppercase tracking-wider hover:opacity-80 transition-opacity">
                  <i className="fa-duotone fa-regular fa-rocket mr-2" />
                  Get Started Free
                </button>
                <button className="px-8 py-3 bg-base-300 border border-base-content/10 text-base-content/50 font-mono text-xs uppercase tracking-wider hover:border-primary/30 hover:text-base-content/70 transition-colors">
                  <i className="fa-duotone fa-regular fa-play mr-2" />
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/15" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/15" />
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer-main relative bg-base-200 border-t border-base-content/5">
        {/* Scanline accent */}
        <div className="footer-scanline h-[2px] bg-primary/30 origin-left" />

        {/* System metrics bar */}
        <div className="border-b border-base-content/[0.03]">
          <div className="footer-metrics max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="footer-status-dot w-2 h-2 rounded-full bg-success" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/25">
                System Status: Operational
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {systemMetrics.map((m) => (
                <div key={m.label} className="footer-metric flex items-center gap-2">
                  <i className={`fa-duotone fa-regular ${m.icon} text-[10px] text-base-content/15`} />
                  <span className="font-mono text-[10px] text-base-content/20 uppercase tracking-wider">{m.label}:</span>
                  <span className="font-mono text-[10px] font-bold text-base-content/40">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="footer-columns grid grid-cols-1 md:grid-cols-6 gap-10 md:gap-8">
            {/* Brand column */}
            <div className="footer-col md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                  <i className="fa-duotone fa-regular fa-terminal text-sm" />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold tracking-tight">Splits Network</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">Mission Control</p>
                </div>
              </div>
              <p className="font-mono text-xs text-base-content/30 leading-relaxed mb-6 max-w-xs">
                The split-fee recruiting marketplace connecting recruiters, companies, and candidates. Faster placements through network collaboration.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/20 mb-3">// subscribe.to.updates</p>
                {subscribed ? (
                  <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20">
                    <i className="fa-duotone fa-regular fa-check-circle text-success text-sm" />
                    <span className="font-mono text-xs text-success/80">Signal received. You&apos;re in.</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="operator@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                      className="flex-1 bg-base-300 border border-base-content/5 px-3 py-2.5 font-mono text-xs text-base-content placeholder:text-base-content/15 focus:outline-none focus:border-primary/30 transition-colors min-w-0"
                    />
                    <button
                      onClick={handleSubscribe}
                      className="px-4 py-2.5 bg-primary text-primary-content font-mono text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity flex-shrink-0"
                    >
                      <i className="fa-duotone fa-regular fa-satellite-dish mr-1.5" />
                      Subscribe
                    </button>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="social-row flex items-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    onClick={(e) => e.preventDefault()}
                    aria-label={s.label}
                    className="social-link w-9 h-9 flex items-center justify-center bg-base-300/50 border border-base-content/5 text-base-content/20 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all"
                  >
                    <i className={`fa-brands ${s.icon} text-sm`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {footerColumns.map((col) => (
              <div key={col.title} className="footer-col">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-4">
                  // {col.title.toLowerCase()}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => e.preventDefault()}
                        className="font-mono text-xs text-base-content/30 hover:text-base-content/60 hover:pl-1 transition-all duration-200 inline-block"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-base-content/[0.03]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-center md:text-left">
              <span className="font-mono text-[10px] text-base-content/20">
                &copy; {new Date().getFullYear()} Splits Network
              </span>
              <span className="text-base-content/10 hidden sm:inline">|</span>
              <span className="font-mono text-[10px] text-base-content/15">
                Employment Networks, Inc.
              </span>
              <span className="text-base-content/10 hidden sm:inline">|</span>
              <span className="font-mono text-[10px] text-base-content/15">
                All rights reserved
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-base-content/15 uppercase tracking-wider">
                Build v2.4.0
              </span>
              <span className="text-base-content/10">|</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="font-mono text-[10px] text-base-content/20 uppercase tracking-wider">
                  All Systems Go
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 right-6 w-6 h-6 border-r-2 border-t-2 border-primary/10" />
        <div className="absolute bottom-4 left-6 w-6 h-6 border-l-2 border-b-2 border-primary/10" />
      </footer>
    </div>
  );
}
