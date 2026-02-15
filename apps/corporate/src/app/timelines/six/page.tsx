'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/*  Memphis Timeline Patterns                                          */
/* ------------------------------------------------------------------ */

const COLORS = {
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  purple: '#A78BFA',
  dark: '#1A1A2E',
  cream: '#F5F0EB',
};

interface TimelineEvent {
  id: number;
  icon: string;
  color: string;
  title: string;
  description: string;
  time: string;
  type: string;
  expandable?: string;
}

const VERTICAL_EVENTS: TimelineEvent[] = [
  { id: 1, icon: 'fa-briefcase', color: COLORS.teal, title: 'Job Posted', description: 'Senior React Developer position published to marketplace.', time: 'Feb 14, 2026 — 9:00 AM', type: 'job' },
  { id: 2, icon: 'fa-user-plus', color: COLORS.purple, title: 'Candidate Applied', description: 'Sarah Chen submitted application with portfolio.', time: 'Feb 14, 2026 — 11:30 AM', type: 'application', expandable: 'Resume includes 5 years of React experience, TypeScript proficiency, and prior work at two Fortune 500 companies. Portfolio link verified.' },
  { id: 3, icon: 'fa-handshake', color: COLORS.coral, title: 'Split Proposal Sent', description: 'Network recruiter proposed 60/40 split on placement.', time: 'Feb 14, 2026 — 2:15 PM', type: 'proposal' },
  { id: 4, icon: 'fa-video', color: COLORS.yellow, title: 'Interview Scheduled', description: 'Technical interview set for Feb 18 at 10:00 AM EST.', time: 'Feb 15, 2026 — 8:45 AM', type: 'interview', expandable: 'Panel interview with CTO and two senior engineers. Focus areas: system design, React patterns, and TypeScript expertise. Duration: 60 minutes.' },
  { id: 5, icon: 'fa-circle-check', color: COLORS.teal, title: 'Interview Completed', description: 'Candidate rated 4.5/5 by interview panel.', time: 'Feb 18, 2026 — 11:15 AM', type: 'interview' },
  { id: 6, icon: 'fa-file-signature', color: COLORS.purple, title: 'Offer Extended', description: '$145K base + equity package sent to candidate.', time: 'Feb 19, 2026 — 3:00 PM', type: 'offer' },
  { id: 7, icon: 'fa-trophy', color: COLORS.coral, title: 'Placement Confirmed', description: 'Candidate accepted. Split payout initiated to both parties.', time: 'Feb 21, 2026 — 10:00 AM', type: 'placement' },
];

const HORIZONTAL_MILESTONES = [
  { label: 'Discovery', icon: 'fa-magnifying-glass', color: COLORS.teal, date: 'Week 1' },
  { label: 'Design', icon: 'fa-pen-ruler', color: COLORS.yellow, date: 'Week 2-3' },
  { label: 'Development', icon: 'fa-code', color: COLORS.coral, date: 'Week 4-8' },
  { label: 'Testing', icon: 'fa-vial', color: COLORS.purple, date: 'Week 9-10' },
  { label: 'Launch', icon: 'fa-rocket', color: COLORS.teal, date: 'Week 11' },
  { label: 'Review', icon: 'fa-chart-line', color: COLORS.yellow, date: 'Week 12' },
];

/* ---------- Vertical Timeline Item ---------- */
function VerticalItem({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: isLeft ? -40 : 40 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: 'top 85%' } },
    );
  }, [isLeft]);

  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        height: expanded ? 'auto' : 0,
        opacity: expanded ? 1 : 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [expanded]);

  return (
    <div className={`flex items-start gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      {/* card */}
      <div ref={ref} className="flex-1">
        <div
          style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
          className="p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
              style={{ background: event.color, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}
            >
              {event.type}
            </span>
            <span className="text-xs font-bold" style={{ color: '#999' }}>{event.time}</span>
          </div>
          <h3 className="font-black text-base uppercase" style={{ color: COLORS.dark }}>{event.title}</h3>
          <p className="text-sm font-medium mt-1" style={{ color: COLORS.dark }}>{event.description}</p>

          {event.expandable && (
            <>
              <div ref={contentRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
                <p className="text-sm font-medium mt-3 p-3" style={{ background: COLORS.cream, color: COLORS.dark, border: `2px solid ${COLORS.dark}30`, borderRadius: 0 }}>
                  {event.expandable}
                </p>
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs font-black uppercase tracking-wider hover:underline"
                style={{ color: COLORS.teal }}
              >
                {expanded ? 'Show Less' : 'Show More'}
                <i className={`fa-duotone fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} ml-1`} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* center dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-12 h-12 flex items-center justify-center"
          style={{ background: event.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
        >
          <i className={`fa-duotone fa-solid ${event.icon} text-lg`} style={{ color: COLORS.dark }} />
        </div>
        {index < VERTICAL_EVENTS.length - 1 && (
          <div className="w-1 h-16 md:h-12" style={{ background: COLORS.dark }} />
        )}
      </div>

      {/* spacer for the other side */}
      <div className="flex-1 hidden md:block" />
    </div>
  );
}

/* ---------- Horizontal Timeline ---------- */
function HorizontalTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('[data-milestone]');
    gsap.fromTo(items, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.5, ease: 'back.out(1.2)' });
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-x-auto pb-4">
      {/* track line */}
      <div className="absolute top-14 left-8 right-8 h-1" style={{ background: COLORS.dark }} />
      <div className="flex gap-0 min-w-[700px]">
        {HORIZONTAL_MILESTONES.map((m, i) => (
          <div key={m.label} data-milestone className="flex-1 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase mb-2" style={{ color: '#999' }}>{m.date}</span>
            <div
              className="w-14 h-14 flex items-center justify-center z-10"
              style={{ background: m.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
            >
              <i className={`fa-duotone fa-solid ${m.icon} text-lg`} style={{ color: COLORS.dark }} />
            </div>
            <span className="mt-3 font-black text-sm uppercase tracking-wider" style={{ color: COLORS.dark }}>
              {m.label}
            </span>
            {i <= 2 && (
              <span className="mt-1 px-2 py-0.5 text-[10px] font-black uppercase" style={{ background: COLORS.teal, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
                Complete
              </span>
            )}
            {i === 3 && (
              <span className="mt-1 px-2 py-0.5 text-[10px] font-black uppercase" style={{ background: COLORS.yellow, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
                In Progress
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function TimelinesSixPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out' });
  }, []);

  return (
    <div style={{ background: COLORS.cream }} className="min-h-screen">
      {/* ===================== HERO ===================== */}
      <section ref={heroRef} style={{ background: COLORS.dark }} className="relative overflow-hidden py-28 px-6 text-center">
        <div style={{ background: COLORS.teal, width: 90, height: 90, border: `4px solid ${COLORS.cream}`, borderRadius: 0 }} className="absolute top-10 right-16 rotate-45 opacity-25" />
        <div style={{ background: COLORS.coral, width: 60, height: 60, borderRadius: '50%' }} className="absolute bottom-16 left-20 opacity-20" />
        <div style={{ background: COLORS.yellow, width: 40, height: 110, borderRadius: 0 }} className="absolute top-1/4 left-[12%] -rotate-12 opacity-15" />

        <h1 data-anim className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          Time<span style={{ color: COLORS.teal }}>lines</span>
        </h1>
        <p data-anim className="mt-4 text-lg font-bold uppercase tracking-widest" style={{ color: COLORS.coral }}>
          Activity Feeds &bull; Process Flows &bull; Project Milestones
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-24">
        {/* ---- Vertical Timeline ---- */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 mb-10" style={{ color: COLORS.dark }}>
            <i className="fa-duotone fa-solid fa-timeline" style={{ color: COLORS.coral }} />
            Placement Activity Feed
          </h2>
          <div className="space-y-0">
            {VERTICAL_EVENTS.map((e, i) => (
              <VerticalItem key={e.id} event={e} index={i} />
            ))}
          </div>
        </section>

        {/* ---- Horizontal Timeline ---- */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 mb-10" style={{ color: COLORS.dark }}>
            <i className="fa-duotone fa-solid fa-bars-progress" style={{ color: COLORS.teal }} />
            Project Milestones
          </h2>
          <div
            style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}
            className="p-8"
          >
            <HorizontalTimeline />
          </div>
        </section>

        {/* ---- Status Legend ---- */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 mb-6" style={{ color: COLORS.dark }}>
            <i className="fa-duotone fa-solid fa-circle-half-stroke" style={{ color: COLORS.purple }} />
            Event Type Legend
          </h2>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Job', color: COLORS.teal, icon: 'fa-briefcase' },
              { label: 'Application', color: COLORS.purple, icon: 'fa-user-plus' },
              { label: 'Proposal', color: COLORS.coral, icon: 'fa-handshake' },
              { label: 'Interview', color: COLORS.yellow, icon: 'fa-video' },
              { label: 'Offer', color: COLORS.purple, icon: 'fa-file-signature' },
              { label: 'Placement', color: COLORS.coral, icon: 'fa-trophy' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2"
                style={{ background: item.color, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
              >
                <i className={`fa-duotone fa-solid ${item.icon} text-sm`} />
                <span className="font-black text-xs uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ background: COLORS.dark }} className="py-12 text-center">
        <p className="font-black text-xs uppercase tracking-[0.3em]" style={{ color: COLORS.teal }}>
          Splits Network &mdash; Memphis Design System &mdash; Timelines
        </p>
      </footer>
    </div>
  );
}
