"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── article data ─── */

const articleMeta = {
  title: "The Future of Recruiting: How Split-Fee Models Are Changing The Industry",
  subtitle: "An operational analysis of the network-driven recruiting model reshaping talent acquisition",
  author: "Splits Network Intelligence Unit",
  date: "2026-02-14",
  readTime: "11 min read",
  classification: "ANALYSIS // PUBLIC",
};

const sections = [
  {
    id: "section-01",
    tag: "// context.brief",
    heading: "The Legacy System Is Failing",
    paragraphs: [
      "For decades, recruiting operated on a simple model: one firm, one client, one fee. Recruiters built siloed databases, guarded candidate information, and competed against every other firm in their market. The result was an industry plagued by redundant effort, misaligned incentives, and a staggering amount of wasted time.",
      "The numbers tell the story. The average time-to-fill for a professional role sits at 42 days. Recruiters spend 30% of their week on administrative tasks that generate zero revenue. And the candidate experience\u2014the thing that ultimately determines placement success\u2014ranks among the worst of any professional service industry.",
      "This is not a people problem. It is a systems problem. The infrastructure that recruiting was built on was designed for a pre-digital era, and it shows. Fragmented tools, manual processes, and zero-sum competition have created an industry that works against its own participants.",
    ],
  },
  {
    id: "section-02",
    tag: "// system.analysis",
    heading: "Split-Fee: The Network Protocol",
    paragraphs: [
      "Split-fee recruiting inverts the traditional model. Instead of one firm handling every aspect of a placement, two or more firms collaborate\u2014one sourcing candidates, one managing the client relationship\u2014and share the resulting fee. It is not a new concept. Split-fee arrangements have existed for decades in informal networks and handshake agreements.",
      "What has changed is the infrastructure. Modern platforms like Splits Network have transformed split-fee from an informal practice into an operational system. Automated fee calculations, transparent pipeline tracking, real-time collaboration tools, and enforceable digital agreements have removed the friction that historically made splits unreliable.",
      "The economic logic is compelling. A recruiter specializing in software engineering in Austin can now partner with a firm that has deep client relationships in healthcare technology\u2014a vertical they would never penetrate alone. The job order gets filled faster, the client gets a better candidate, and both firms earn revenue they would not have generated independently.",
    ],
  },
  {
    id: "section-03",
    tag: "// performance.metrics",
    heading: "The Data Behind the Shift",
    paragraphs: [
      "Network-model recruiting is not just a philosophical shift. The performance data is decisive. Firms operating within structured split-fee networks report 2.3x higher placement rates compared to firms working exclusively with their own candidate pools. Time-to-fill drops by an average of 34%. And revenue per recruiter increases by 40-60% within the first year of active network participation.",
      "These gains come from a fundamental reallocation of effort. When recruiters stop duplicating work\u2014sourcing the same candidates, pitching the same clients\u2014and instead specialize in what they do best, the entire system becomes more efficient. The network effect compounds: more participants mean more job orders, more candidates, and more successful matches.",
      "The candidate experience improves dramatically as well. Instead of being contacted by five different recruiters about the same role, candidates interact with a single point of contact who has been matched to them based on specialization and track record. The process feels curated, not chaotic.",
    ],
  },
  {
    id: "section-04",
    tag: "// threat.assessment",
    heading: "Barriers and Resistance",
    paragraphs: [
      "Not everyone is ready to adopt the network model. The most common objection is trust. Recruiters have operated in a competitive environment for so long that sharing candidates or job orders feels like handing ammunition to a rival. This instinct is understandable but increasingly counterproductive.",
      "Technology addresses the trust deficit directly. Platform-enforced agreements, automated fee distribution, full audit trails, and reputation systems create accountability that handshake deals never could. When every interaction is logged and every payment is guaranteed by the platform, the risk of bad-faith behavior drops to near zero.",
      "The second barrier is inertia. Firms with established processes and full desks have less immediate incentive to change. But the market is not standing still. As network-model firms grow faster and compete more effectively for both clients and candidates, the cost of staying siloed increases every quarter.",
    ],
  },
  {
    id: "section-05",
    tag: "// projection.forward",
    heading: "The Next Five Years",
    paragraphs: [
      "The trajectory is clear. AI-powered matching will make partner selection nearly instantaneous\u2014identifying the ideal collaborator based on specialization, geography, track record, and current capacity. Smart contracts will automate fee structures that today require manual negotiation. And real-time analytics will give network participants the same operational visibility that was once reserved for enterprise-scale firms.",
      "The firms that thrive in this environment will not be the largest. They will be the most connected. A ten-person agency with deep specialization and strong network partnerships will consistently outperform a fifty-person generalist firm operating in isolation. Size becomes less important than signal\u2014the quality of your connections, the reliability of your placements, the speed of your execution.",
      "This is not a prediction. It is already happening. The recruiting industry is undergoing the same network transformation that reshaped logistics, finance, and media. The only question is whether you are building the infrastructure to participate\u2014or waiting to be disrupted by those who already have.",
    ],
  },
];

const pullQuotes = [
  {
    afterSection: 1,
    text: "The average recruiter spends 30% of their week on tasks that generate zero revenue. The network model eliminates that waste.",
  },
  {
    afterSection: 3,
    text: "When every interaction is logged and every payment is guaranteed by the platform, the risk of bad-faith behavior drops to near zero.",
  },
];

const keyMetrics = [
  { value: "2.3x", label: "Higher placement rate" },
  { value: "34%", label: "Faster time-to-fill" },
  { value: "40-60%", label: "Revenue increase per recruiter" },
  { value: "42 days", label: "Current avg time-to-fill" },
];

/* ─── component ─── */

export default function ArticleTen() {
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
          ".article-scanline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6 }
        )
        .fromTo(
          ".article-classification",
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          "-=0.2"
        )
        .fromTo(
          ".article-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.1"
        )
        .fromTo(
          ".article-subtitle",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        )
        .fromTo(
          ".article-meta-item",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
          "-=0.2"
        );

      /* ── status dots pulse ── */
      gsap.fromTo(
        ".status-pulse",
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

      /* ── section reveals ── */
      gsap.utils.toArray<HTMLElement>(".article-section").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
            },
          }
        );
      });

      /* ── pull quotes ── */
      gsap.utils.toArray<HTMLElement>(".pull-quote").forEach((quote) => {
        gsap.fromTo(
          quote,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: quote,
              start: "top 85%",
            },
          }
        );
      });

      /* ── metrics grid ── */
      gsap.fromTo(
        ".metric-card",
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".metrics-grid",
            start: "top 85%",
          },
        }
      );

      /* ── image reveals ── */
      gsap.utils.toArray<HTMLElement>(".img-reveal").forEach((img) => {
        gsap.fromTo(
          img,
          { opacity: 0, scale: 1.04 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
            },
          }
        );
      });

      /* ── CTA ── */
      gsap.fromTo(
        ".cta-block",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-block",
            start: "top 85%",
          },
        }
      );
    },
    { scope: mainRef }
  );

  /* ── helper: find pull quote after a given section index ── */
  function getPullQuoteAfter(sectionIndex: number) {
    return pullQuotes.find((pq) => pq.afterSection === sectionIndex);
  }

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
    >
      {/* ═══ HERO ═══ */}
      <header className="relative py-24 md:py-32 px-6 border-b border-base-content/10">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Corner brackets */}
        <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-primary/30" />
        <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-primary/30" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="article-scanline h-[2px] bg-primary w-32 mb-8 origin-left" />

          <p className="article-classification font-mono text-[10px] tracking-[0.3em] uppercase text-primary/80 mb-6">
            {articleMeta.classification}
          </p>

          <h1 className="article-title text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            {articleMeta.title}
          </h1>

          <p className="article-subtitle text-lg md:text-xl text-base-content/40 font-light leading-relaxed mb-10">
            {articleMeta.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-base-content/30">
            <div className="article-meta-item flex items-center gap-2">
              <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-mono text-xs">{articleMeta.author}</span>
            </div>
            <div className="article-meta-item font-mono text-xs">
              <i className="fa-duotone fa-regular fa-calendar mr-2 text-primary/50" />
              {articleMeta.date}
            </div>
            <div className="article-meta-item font-mono text-xs">
              <i className="fa-duotone fa-regular fa-clock mr-2 text-primary/50" />
              {articleMeta.readTime}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ HERO IMAGE ═══ */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="img-reveal relative overflow-hidden aspect-[21/9]">
            <img
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1800&q=80&auto=format&fit=crop"
              alt="Dark collaborative tech workspace"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-base-300/30" />
            {/* HUD corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-primary/50" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-primary/50" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-primary/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-primary/50" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary/60">
                [ network operations ]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ARTICLE BODY ═══ */}
      <article className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          {sections.map((section, idx) => (
            <div key={section.id}>
              {/* Section content */}
              <section className="article-section mb-16">
                <div className="mb-8">
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary/60 mb-3">
                    {section.tag}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                    {section.heading}
                  </h2>
                  <div className="h-[2px] bg-primary/20 w-16 mt-4" />
                </div>

                <div className="space-y-5">
                  {section.paragraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-base-content/60 leading-[1.8] text-[15px]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>

              {/* Pull quote after specific sections */}
              {getPullQuoteAfter(idx) && (
                <aside className="pull-quote my-16 pl-8 border-l-2 border-primary relative">
                  <span className="absolute -left-[1px] top-0 w-[2px] h-3 bg-primary" />
                  <p className="text-xl md:text-2xl font-light text-base-content/70 leading-relaxed italic">
                    &ldquo;{getPullQuoteAfter(idx)!.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="status-pulse w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
                      Key Signal
                    </span>
                  </div>
                </aside>
              )}

              {/* Image break after section 2 */}
              {idx === 1 && (
                <div className="img-reveal my-16 relative overflow-hidden aspect-[16/7]">
                  <img
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80&auto=format&fit=crop"
                    alt="Tech operations environment"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-base-300/30" />
                  <div className="absolute top-3 left-3 w-6 h-6 border-l border-t border-primary/40" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r border-b border-primary/40" />
                </div>
              )}

              {/* Metrics panel after section 2 (the data section) */}
              {idx === 2 && (
                <div className="metrics-grid my-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {keyMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="metric-card p-5 bg-base-200 border border-base-content/5"
                    >
                      <p className="font-mono text-2xl font-black text-primary">
                        {metric.value}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/30 mt-2">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Image break after section 3 */}
              {idx === 3 && (
                <div className="img-reveal my-16 relative overflow-hidden aspect-[16/7]">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80&auto=format&fit=crop"
                    alt="Team working in dark tech environment"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-base-300/30" />
                  <div className="absolute top-3 left-3 w-6 h-6 border-l border-t border-primary/40" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r border-b border-primary/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </article>

      {/* ═══ TAGS / CLASSIFICATION ═══ */}
      <section className="px-6 pb-16 border-b border-base-content/10">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-base-content/20 mb-4">
            // tags
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "Split-Fee Recruiting",
              "Network Model",
              "Talent Acquisition",
              "Recruiting Technology",
              "Industry Analysis",
              "Marketplace Platforms",
            ].map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs px-4 py-2 bg-base-200 border border-base-content/5 text-base-content/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AUTHOR CARD ═══ */}
      <section className="px-6 py-16 border-b border-base-content/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-6 p-8 bg-base-200 border border-base-content/5">
            <div className="w-14 h-14 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
              <i className="fa-duotone fa-regular fa-satellite-dish text-xl" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold tracking-wide mb-1">
                {articleMeta.author}
              </p>
              <p className="text-sm text-base-content/40 leading-relaxed">
                The intelligence unit at Splits Network monitors industry
                trends, analyzes network performance data, and publishes
                operational insights for the recruiting community. All
                analysis is derived from anonymized, aggregated platform data.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-success">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-block py-32 px-6 bg-base-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary mb-6">
            // ready_to_deploy
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
            Enter the Network
          </h2>
          <p className="text-base-content/40 max-w-xl mx-auto mb-10 leading-relaxed">
            The split-fee model is not a trend. It is the operating system for
            the next generation of recruiting. Initialize your command center
            and start building the partnerships that will define your firm.
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
