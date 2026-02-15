'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/*  Memphis FAQ Accordion                                              */
/* ------------------------------------------------------------------ */

const COLORS = {
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  purple: '#A78BFA',
  dark: '#1A1A2E',
  cream: '#F5F0EB',
};

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'fa-grid-2', color: COLORS.dark },
  { key: 'general', label: 'General', icon: 'fa-circle-info', color: COLORS.teal },
  { key: 'billing', label: 'Billing', icon: 'fa-credit-card', color: COLORS.coral },
  { key: 'platform', label: 'Platform', icon: 'fa-desktop', color: COLORS.purple },
  { key: 'splits', label: 'Splits', icon: 'fa-handshake', color: COLORS.yellow },
];

const FAQS: FAQ[] = [
  { id: 1, category: 'general', question: 'What is Splits Network?', answer: 'Splits Network is a split-fee recruiting marketplace that connects recruiters, hiring companies, and candidates. It enables agencies and independent recruiters to collaborate on placements through transparent fee-splitting arrangements.' },
  { id: 2, category: 'general', question: 'Who can use the platform?', answer: 'Recruiting agencies, independent recruiters, and hiring companies. Whether you have job orders to share or candidates to place, the marketplace connects you with the right partners automatically.' },
  { id: 3, category: 'general', question: 'Is Splits Network free to join?', answer: 'We offer a free tier for individual recruiters with limited features. Professional and Enterprise plans unlock advanced AI matching, analytics dashboards, and unlimited split proposals.' },
  { id: 4, category: 'billing', question: 'How does the split-fee billing work?', answer: 'When a placement is confirmed, the platform automatically calculates the agreed split (e.g., 60/40 or 50/50) and initiates payouts to both parties through Stripe. No manual invoicing required.' },
  { id: 5, category: 'billing', question: 'What payment methods are accepted?', answer: 'We process all payments through Stripe, supporting major credit cards, ACH bank transfers, and wire transfers. International payments are supported in 40+ currencies.' },
  { id: 6, category: 'billing', question: 'Are there any hidden fees?', answer: 'No hidden fees. Our platform fee is a transparent percentage of each placement, clearly shown before you agree to any split. You only pay when a successful placement is made.' },
  { id: 7, category: 'platform', question: 'How does AI matching work?', answer: 'Our AI analyzes job requirements, candidate profiles, and recruiter specializations to suggest optimal matches. It considers skills, experience, industry focus, and historical placement success rates.' },
  { id: 8, category: 'platform', question: 'Can I integrate with my existing ATS?', answer: 'Yes, we offer API integrations with major ATS platforms including Bullhorn, Greenhouse, Lever, and Workday. Custom integrations are available on Enterprise plans.' },
  { id: 9, category: 'platform', question: 'Is my data secure?', answer: 'Absolutely. We use enterprise-grade encryption, SOC 2 Type II compliance, and role-based access controls. All data is stored in secure, geo-redundant cloud infrastructure.' },
  { id: 10, category: 'splits', question: 'How do I propose a split?', answer: 'Browse available job orders in the marketplace, click "Propose Split," and submit your candidate along with your proposed fee split. The hiring company reviews and accepts, counters, or declines.' },
  { id: 11, category: 'splits', question: 'What is the typical split ratio?', answer: 'Common splits range from 50/50 to 60/40, depending on who sourced the candidate vs. who holds the job order. The platform suggests fair splits based on market data and contribution levels.' },
  { id: 12, category: 'splits', question: 'Can I negotiate the split?', answer: 'Yes. Split proposals are fully negotiable. Both parties can counter-offer until an agreement is reached. The platform tracks all negotiations for transparency.' },
];

/* ---------- Accordion Item ---------- */
function AccordionItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: isOpen ? 180 : 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isOpen]);

  const cat = CATEGORIES.find((c) => c.key === faq.category);

  return (
    <div
      style={{
        background: '#fff',
        border: `4px solid ${COLORS.dark}`,
        borderRadius: 0,
      }}
      className=""
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors"
        style={{ background: isOpen ? COLORS.dark : '#fff', borderRadius: 0 }}
      >
        <span
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{ background: cat?.color || COLORS.teal, border: `3px solid ${isOpen ? '#fff' : COLORS.dark}`, borderRadius: 0 }}
        >
          <i className={`fa-duotone fa-solid ${cat?.icon || 'fa-circle'} text-xs`} style={{ color: COLORS.dark }} />
        </span>
        <span className="flex-1 font-black text-sm uppercase tracking-wide" style={{ color: isOpen ? '#fff' : COLORS.dark }}>
          {faq.question}
        </span>
        <i
          ref={iconRef as React.RefObject<HTMLElement>}
          className="fa-duotone fa-solid fa-chevron-down text-sm"
          style={{ color: isOpen ? COLORS.yellow : COLORS.dark }}
        />
      </button>
      <div ref={contentRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
        <div className="p-5" style={{ borderTop: `3px solid ${COLORS.dark}` }}>
          <p className="text-sm font-medium leading-relaxed" style={{ color: COLORS.dark }}>
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function FaqsSixPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out' });
  }, []);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ background: COLORS.cream }} className="min-h-screen">
      {/* ===================== HERO ===================== */}
      <section ref={heroRef} style={{ background: COLORS.dark }} className="relative overflow-hidden py-28 px-6 text-center">
        <div style={{ background: COLORS.yellow, width: 110, height: 110, borderRadius: 0, border: `4px solid ${COLORS.cream}` }} className="absolute top-10 right-16 rotate-12 opacity-25" />
        <div style={{ background: COLORS.coral, width: 60, height: 60, borderRadius: '50%' }} className="absolute bottom-14 left-20 opacity-20" />
        <div style={{ background: COLORS.teal, width: 45, height: 100, borderRadius: 0 }} className="absolute top-1/4 left-[10%] -rotate-12 opacity-15" />

        <h1 data-anim className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          F<span style={{ color: COLORS.yellow }}>A</span>Q<span style={{ color: COLORS.coral }}>s</span>
        </h1>
        <p data-anim className="mt-4 text-lg font-bold uppercase tracking-widest" style={{ color: COLORS.teal }}>
          Frequently Asked Questions
        </p>
        <p data-anim className="mt-4 max-w-lg mx-auto text-base" style={{ color: '#ccc' }}>
          Everything you need to know about Splits Network. Can&apos;t find what you&apos;re looking for? Reach out to our support team.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* ---- Search ---- */}
        <div
          className="flex items-center gap-3 p-4"
          style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
        >
          <i className="fa-duotone fa-solid fa-magnifying-glass text-lg" style={{ color: COLORS.teal }} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none font-bold text-sm placeholder:font-bold"
            style={{ color: COLORS.dark, borderRadius: 0 }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="font-black text-lg hover:opacity-60"
              style={{ color: COLORS.dark }}
            >
              &times;
            </button>
          )}
        </div>

        {/* ---- Category Filters ---- */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setOpenId(null); }}
              className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{
                background: activeCategory === cat.key ? cat.color : '#fff',
                color: activeCategory === cat.key && cat.key !== 'all' ? COLORS.dark : COLORS.dark,
                border: `3px solid ${COLORS.dark}`,
                borderRadius: 0,
              }}
            >
              <i className={`fa-duotone fa-solid ${cat.icon} mr-2`} />
              {cat.label}
              <span
                className="ml-2 px-1.5 py-0.5 text-[10px]"
                style={{ background: COLORS.dark, color: '#fff', borderRadius: 0 }}
              >
                {cat.key === 'all' ? FAQS.length : FAQS.filter((f) => f.category === cat.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* ---- FAQ List ---- */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa-duotone fa-solid fa-face-thinking text-5xl mb-4" style={{ color: '#ccc' }} />
              <p className="font-black text-lg uppercase" style={{ color: '#999' }}>No FAQs match your search</p>
              <p className="font-bold text-sm mt-1" style={{ color: '#bbb' }}>Try different keywords or clear the filter.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => toggleFaq(faq.id)}
              />
            ))
          )}
        </div>

        {/* ---- Still Need Help CTA ---- */}
        <section
          className="p-8 text-center"
          style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0 }}
        >
          <i className="fa-duotone fa-solid fa-headset text-5xl mb-4" style={{ color: COLORS.teal }} />
          <h3 className="text-2xl font-black uppercase tracking-tight text-white">
            Still Need <span style={{ color: COLORS.coral }}>Help</span>?
          </h3>
          <p className="mt-2 text-sm font-medium max-w-md mx-auto" style={{ color: '#ccc' }}>
            Our support team is available Monday through Friday, 9 AM &ndash; 6 PM EST. We typically respond within 2 hours.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <button
              className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: COLORS.teal, border: `4px solid ${COLORS.teal}`, borderRadius: 0, color: COLORS.dark }}
            >
              <i className="fa-duotone fa-solid fa-envelope mr-2" />
              Email Support
            </button>
            <button
              className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: COLORS.coral, border: `4px solid ${COLORS.coral}`, borderRadius: 0, color: COLORS.dark }}
            >
              <i className="fa-duotone fa-solid fa-comments mr-2" />
              Live Chat
            </button>
            <button
              className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: COLORS.purple, border: `4px solid ${COLORS.purple}`, borderRadius: 0, color: COLORS.dark }}
            >
              <i className="fa-duotone fa-solid fa-book mr-2" />
              Documentation
            </button>
          </div>
        </section>

        {/* ---- Quick Stats ---- */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Average Response', value: '< 2 hrs', icon: 'fa-clock', color: COLORS.teal },
            { label: 'Satisfaction Rate', value: '98.5%', icon: 'fa-face-smile', color: COLORS.yellow },
            { label: 'Knowledge Base', value: '200+ Articles', icon: 'fa-books', color: COLORS.coral },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 text-center"
              style={{ background: stat.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
            >
              <i className={`fa-duotone fa-solid ${stat.icon} text-2xl mb-2`} style={{ color: COLORS.dark }} />
              <p className="text-2xl font-black" style={{ color: COLORS.dark }}>{stat.value}</p>
              <p className="font-black text-xs uppercase tracking-widest" style={{ color: COLORS.dark }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background: COLORS.dark }} className="py-12 text-center">
        <p className="font-black text-xs uppercase tracking-[0.3em]" style={{ color: COLORS.yellow }}>
          Splits Network &mdash; Memphis Design System &mdash; FAQs
        </p>
      </footer>
    </div>
  );
}
