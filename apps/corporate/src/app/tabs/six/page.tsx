'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/*  Memphis Tab Navigation Patterns                                    */
/* ------------------------------------------------------------------ */

const COLORS = {
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  purple: '#A78BFA',
  dark: '#1A1A2E',
  cream: '#F5F0EB',
};

/* ---------- Horizontal Tabs ---------- */
function HorizontalTabs() {
  const [active, setActive] = useState(0);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = [
    { label: 'Overview', icon: 'fa-grid-2' },
    { label: 'Candidates', icon: 'fa-users' },
    { label: 'Analytics', icon: 'fa-chart-mixed' },
    { label: 'Settings', icon: 'fa-gear' },
  ];

  useEffect(() => {
    const btn = tabRefs.current[active];
    if (btn && indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: btn.offsetLeft,
        width: btn.offsetWidth,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  }, [active]);

  return (
    <div>
      <div
        className="relative flex overflow-hidden"
        style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}
      >
        <div
          ref={indicatorRef}
          className="absolute bottom-0 h-1"
          style={{ background: COLORS.coral, borderRadius: 0 }}
        />
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={(el) => { tabRefs.current[i] = el; }}
            onClick={() => setActive(i)}
            className="flex-1 px-6 py-4 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            style={{
              color: active === i ? COLORS.coral : COLORS.dark,
              background: active === i ? '#fff' : 'transparent',
              borderRight: i < tabs.length - 1 ? `2px solid ${COLORS.dark}20` : 'none',
              borderRadius: 0,
            }}
          >
            <i className={`fa-duotone fa-solid ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>
      <TabPanel index={active} tabs={tabs} />
    </div>
  );
}

function TabPanel({ index, tabs }: { index: number; tabs: { label: string; icon: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, [index]);

  return (
    <div
      ref={ref}
      style={{ border: `4px solid ${COLORS.dark}`, borderTop: 'none', borderRadius: 0, background: '#fff' }}
      className="p-6"
    >
      <p className="font-bold" style={{ color: COLORS.dark }}>
        <i className={`fa-duotone fa-solid ${tabs[index].icon} mr-2`} style={{ color: COLORS.teal }} />
        Content for <span style={{ color: COLORS.coral }}>{tabs[index].label}</span> tab. This panel transitions smoothly with GSAP when tabs switch.
      </p>
    </div>
  );
}

/* ---------- Vertical Tabs ---------- */
function VerticalTabs() {
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { label: 'Profile', icon: 'fa-user', content: 'Manage your recruiter profile, bio, specializations, and contact information.' },
    { label: 'Billing', icon: 'fa-credit-card', content: 'View invoices, update payment methods, and manage subscription plans.' },
    { label: 'Team', icon: 'fa-people-group', content: 'Invite team members, set permissions, and manage organizational roles.' },
    { label: 'API Keys', icon: 'fa-key', content: 'Generate and manage API keys for third-party integrations.' },
  ];

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.3 });
    }
  }, [active]);

  return (
    <div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
      <div className="w-48 shrink-0" style={{ borderRight: `4px solid ${COLORS.dark}` }}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className="w-full px-5 py-4 text-left font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
            style={{
              background: active === i ? COLORS.teal : 'transparent',
              color: COLORS.dark,
              borderBottom: i < tabs.length - 1 ? `2px solid ${COLORS.dark}20` : 'none',
              borderRadius: 0,
            }}
          >
            <i className={`fa-duotone fa-solid ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>
      <div ref={panelRef} className="flex-1 p-6">
        <h3 className="font-black text-lg uppercase" style={{ color: COLORS.dark }}>
          {tabs[active].label}
        </h3>
        <p className="mt-2 font-medium text-sm" style={{ color: COLORS.dark }}>
          {tabs[active].content}
        </p>
      </div>
    </div>
  );
}

/* ---------- Pill Tabs ---------- */
function PillTabs() {
  const [active, setActive] = useState(0);
  const pills = ['All Jobs', 'Active', 'Paused', 'Closed', 'Draft'];

  return (
    <div className="flex flex-wrap gap-3">
      {pills.map((pill, i) => (
        <button
          key={pill}
          onClick={() => setActive(i)}
          className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
          style={{
            background: active === i ? COLORS.coral : '#fff',
            color: COLORS.dark,
            border: `3px solid ${COLORS.dark}`,
            borderRadius: 0,
          }}
        >
          {pill}
        </button>
      ))}
    </div>
  );
}

/* ---------- Underline Tabs ---------- */
function UnderlineTabs() {
  const [active, setActive] = useState(0);
  const items = ['Recent', 'Popular', 'Trending', 'Saved'];

  return (
    <div className="flex gap-0" style={{ borderBottom: `4px solid ${COLORS.dark}` }}>
      {items.map((item, i) => (
        <button
          key={item}
          onClick={() => setActive(i)}
          className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-colors"
          style={{
            color: active === i ? COLORS.coral : COLORS.dark,
            borderBottom: active === i ? `4px solid ${COLORS.coral}` : '4px solid transparent',
            marginBottom: '-4px',
            borderRadius: 0,
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/* ---------- Tabs with Badges ---------- */
function BadgeTabs() {
  const [active, setActive] = useState(0);
  const items = [
    { label: 'Inbox', count: 24, color: COLORS.coral },
    { label: 'Sent', count: 8, color: COLORS.teal },
    { label: 'Drafts', count: 3, color: COLORS.yellow },
    { label: 'Spam', count: 0, color: COLORS.purple },
  ];

  return (
    <div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
      {items.map((item, i) => (
        <button
          key={item.label}
          onClick={() => setActive(i)}
          className="flex-1 px-4 py-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          style={{
            background: active === i ? COLORS.dark : 'transparent',
            color: active === i ? '#fff' : COLORS.dark,
            borderRight: i < items.length - 1 ? `2px solid ${COLORS.dark}30` : 'none',
            borderRadius: 0,
          }}
        >
          {item.label}
          {item.count > 0 && (
            <span
              className="px-2 py-0.5 text-[10px] font-black"
              style={{ background: item.color, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Nested Tabs ---------- */
function NestedTabs() {
  const [outer, setOuter] = useState(0);
  const [inner, setInner] = useState(0);

  const outerItems = ['Recruiting', 'Marketplace'];
  const innerMap: string[][] = [
    ['Active Splits', 'Proposals', 'History'],
    ['Browse Jobs', 'My Listings', 'Watchlist'],
  ];

  return (
    <div style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
      {/* outer */}
      <div className="flex" style={{ background: COLORS.dark }}>
        {outerItems.map((item, i) => (
          <button
            key={item}
            onClick={() => { setOuter(i); setInner(0); }}
            className="flex-1 px-6 py-4 font-black text-sm uppercase tracking-wider transition-colors"
            style={{
              color: outer === i ? COLORS.yellow : '#999',
              borderBottom: outer === i ? `4px solid ${COLORS.yellow}` : '4px solid transparent',
              borderRadius: 0,
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {/* inner */}
      <div className="flex gap-3 p-4" style={{ borderBottom: `3px solid ${COLORS.dark}20` }}>
        {innerMap[outer].map((item, i) => (
          <button
            key={item}
            onClick={() => setInner(i)}
            className="px-4 py-2 font-black text-xs uppercase tracking-wider"
            style={{
              background: inner === i ? COLORS.teal : 'transparent',
              color: COLORS.dark,
              border: `3px solid ${inner === i ? COLORS.dark : COLORS.dark + '30'}`,
              borderRadius: 0,
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {/* content */}
      <div className="p-6">
        <p className="font-bold text-sm" style={{ color: COLORS.dark }}>
          Viewing <span style={{ color: COLORS.coral }}>{outerItems[outer]}</span> &rarr; <span style={{ color: COLORS.teal }}>{innerMap[outer][inner]}</span>
        </p>
      </div>
    </div>
  );
}

/* ---------- Disabled Tab ---------- */
function DisabledTabDemo() {
  const [active, setActive] = useState(0);
  const items = [
    { label: 'General', disabled: false },
    { label: 'Advanced', disabled: false },
    { label: 'Experimental', disabled: true },
  ];

  return (
    <div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
      {items.map((item, i) => (
        <button
          key={item.label}
          onClick={() => !item.disabled && setActive(i)}
          disabled={item.disabled}
          className="flex-1 px-6 py-4 font-black text-sm uppercase tracking-wider transition-colors"
          style={{
            background: item.disabled ? '#e5e5e5' : active === i ? COLORS.purple : 'transparent',
            color: item.disabled ? '#aaa' : COLORS.dark,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            borderRight: i < items.length - 1 ? `2px solid ${COLORS.dark}30` : 'none',
            borderRadius: 0,
          }}
        >
          {item.label}
          {item.disabled && (
            <i className="fa-duotone fa-solid fa-lock ml-2 text-xs" />
          )}
        </button>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function TabsSixPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out' });
  }, []);

  return (
    <div style={{ background: COLORS.cream }} className="min-h-screen">
      {/* ===================== HERO ===================== */}
      <section
        ref={heroRef}
        style={{ background: COLORS.dark }}
        className="relative overflow-hidden py-28 px-6 text-center"
      >
        <div style={{ background: COLORS.yellow, width: 100, height: 100, border: `4px solid ${COLORS.cream}`, borderRadius: 0 }} className="absolute top-12 left-16 rotate-12 opacity-25" />
        <div style={{ background: COLORS.purple, width: 70, height: 70, borderRadius: '50%' }} className="absolute bottom-12 right-24 opacity-20" />
        <div style={{ background: COLORS.coral, width: 50, height: 120, border: `3px solid ${COLORS.cream}`, borderRadius: 0 }} className="absolute top-1/3 left-[8%] -rotate-12 opacity-15" />

        <h1 data-anim className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          Tab <span style={{ color: COLORS.yellow }}>Navigation</span>
        </h1>
        <p data-anim className="mt-4 text-lg font-bold uppercase tracking-widest" style={{ color: COLORS.teal }}>
          Horizontal &bull; Vertical &bull; Pills &bull; Nested &bull; Underline
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">
        <Section title="Horizontal Tabs" icon="fa-table-columns">
          <HorizontalTabs />
        </Section>

        <Section title="Vertical Tabs" icon="fa-sidebar">
          <VerticalTabs />
        </Section>

        <Section title="Pill Tabs" icon="fa-capsules">
          <PillTabs />
        </Section>

        <Section title="Underline Tabs" icon="fa-underline">
          <UnderlineTabs />
        </Section>

        <Section title="Tabs with Badges" icon="fa-bell-on">
          <BadgeTabs />
        </Section>

        <Section title="Nested Tabs" icon="fa-layer-group">
          <NestedTabs />
        </Section>

        <Section title="Disabled Tab State" icon="fa-lock">
          <DisabledTabDemo />
        </Section>
      </div>

      <footer style={{ background: COLORS.dark }} className="py-12 text-center">
        <p className="font-black text-xs uppercase tracking-[0.3em]" style={{ color: COLORS.yellow }}>
          Splits Network &mdash; Memphis Design System &mdash; Tab Navigation
        </p>
      </footer>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: 'top 85%' } });
  }, []);

  return (
    <div ref={ref}>
      <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 mb-6" style={{ color: COLORS.dark }}>
        <i className={`fa-duotone fa-solid ${icon}`} style={{ color: COLORS.coral }} />
        {title}
      </h2>
      {children}
    </div>
  );
}
