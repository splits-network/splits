'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/*  Memphis Testimonials                                               */
/* ------------------------------------------------------------------ */

const COLORS = {
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  purple: '#A78BFA',
  dark: '#1A1A2E',
  cream: '#F5F0EB',
};

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  color: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'VP of Talent',
    company: 'TechForward Inc.',
    avatar: 'SC',
    quote: 'Splits Network transformed our hiring pipeline. We filled 12 senior roles in under 60 days using the split-fee model. The quality of network recruiters is outstanding.',
    rating: 5,
    color: COLORS.teal,
  },
  {
    id: 2,
    name: 'Marcus Williams',
    role: 'Independent Recruiter',
    company: 'Williams Search',
    avatar: 'MW',
    quote: 'I doubled my placement revenue by tapping into the marketplace. The split proposals are fair and the platform handles all the paperwork automatically.',
    rating: 5,
    color: COLORS.coral,
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Head of HR',
    company: 'ScaleUp Labs',
    avatar: 'ER',
    quote: 'The AI matching is incredibly accurate. We get pre-qualified candidates from network recruiters who actually understand our tech stack and culture fit requirements.',
    rating: 4,
    color: COLORS.yellow,
  },
  {
    id: 4,
    name: 'James Park',
    role: 'Recruiting Director',
    company: 'Horizon Staffing',
    avatar: 'JP',
    quote: 'We moved our entire agency onto Splits Network. The analytics dashboard alone saved us 15 hours per week in reporting. Revenue is up 40% year-over-year.',
    rating: 5,
    color: COLORS.purple,
  },
  {
    id: 5,
    name: 'Aisha Khan',
    role: 'COO',
    company: 'NexGen Solutions',
    avatar: 'AK',
    quote: 'The transparency in fee splits and automated payouts eliminated the disputes we used to have with third-party recruiters. Everything is clean and documented.',
    rating: 5,
    color: COLORS.teal,
  },
  {
    id: 6,
    name: 'David Morrison',
    role: 'Solo Recruiter',
    company: 'Morrison Talent',
    avatar: 'DM',
    quote: 'As an independent recruiter, accessing enterprise-level job orders through the marketplace changed my business model completely. Best platform in the industry.',
    rating: 4,
    color: COLORS.coral,
  },
];

const FEATURED = TESTIMONIALS[0];

const COMPANY_LOGOS = [
  { name: 'TechForward', color: COLORS.teal },
  { name: 'ScaleUp Labs', color: COLORS.coral },
  { name: 'Horizon', color: COLORS.purple },
  { name: 'NexGen', color: COLORS.yellow },
  { name: 'Morrison', color: COLORS.teal },
  { name: 'Apex HR', color: COLORS.coral },
];

/* ---------- Star Rating ---------- */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <i
          key={i}
          className={`fa-${i < rating ? 'solid' : 'regular'} fa-star text-sm`}
          style={{ color: i < rating ? COLORS.yellow : '#ccc' }}
        />
      ))}
    </div>
  );
}

/* ---------- Avatar ---------- */
function Avatar({ initials, color, size = 'md' }: { initials: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-xl' };
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center font-black uppercase`}
      style={{ background: color, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
    >
      {initials}
    </div>
  );
}

/* ---------- Testimonial Card ---------- */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: 'top 85%' } });
  }, []);

  return (
    <div
      ref={ref}
      className="p-6 flex flex-col transition-all hover:opacity-90"
      style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
    >
      {/* quote icon */}
      <i className="fa-duotone fa-solid fa-quote-left text-3xl mb-4" style={{ color: testimonial.color }} />

      {/* quote text */}
      <p className="text-sm font-medium flex-1 leading-relaxed" style={{ color: COLORS.dark }}>
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* rating */}
      <div className="mt-4 mb-4">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* author */}
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: `3px solid ${COLORS.dark}20` }}>
        <Avatar initials={testimonial.avatar} color={testimonial.color} size="sm" />
        <div>
          <p className="font-black text-sm uppercase" style={{ color: COLORS.dark }}>{testimonial.name}</p>
          <p className="text-xs font-bold" style={{ color: '#999' }}>{testimonial.role}, {testimonial.company}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Carousel ---------- */
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  const next = () => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    if (!slideRef.current) return;
    gsap.fromTo(slideRef.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
  }, [current]);

  const t = TESTIMONIALS[current];

  return (
    <div
      className="p-8"
      style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
    >
      <div ref={slideRef} className="text-center">
        <div className="flex justify-center mb-6">
          <Avatar initials={t.avatar} color={t.color} size="lg" />
        </div>
        <i className="fa-duotone fa-solid fa-quote-left text-4xl mb-4 block" style={{ color: t.color }} />
        <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: COLORS.dark }}>
          &ldquo;{t.quote}&rdquo;
        </p>
        <div className="mt-6 flex justify-center">
          <StarRating rating={t.rating} />
        </div>
        <p className="mt-4 font-black text-base uppercase" style={{ color: COLORS.dark }}>{t.name}</p>
        <p className="text-sm font-bold" style={{ color: '#999' }}>{t.role}, {t.company}</p>
      </div>

      {/* controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
          style={{ background: COLORS.teal, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
        >
          <i className="fa-duotone fa-solid fa-chevron-left" />
        </button>

        {/* dots */}
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-4 h-4 transition-all"
              style={{
                background: i === current ? COLORS.coral : '#ddd',
                border: `2px solid ${COLORS.dark}`,
                borderRadius: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
          style={{ background: COLORS.teal, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
        >
          <i className="fa-duotone fa-solid fa-chevron-right" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Featured Testimonial ---------- */
function FeaturedTestimonial() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col md:flex-row gap-8 p-8"
      style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0 }}
    >
      {/* left */}
      <div className="flex flex-col items-center justify-center md:w-1/3">
        <Avatar initials={FEATURED.avatar} color={FEATURED.color} size="lg" />
        <p className="mt-4 font-black text-lg uppercase text-white">{FEATURED.name}</p>
        <p className="text-sm font-bold" style={{ color: COLORS.teal }}>{FEATURED.role}</p>
        <p className="text-xs font-bold mt-1" style={{ color: '#999' }}>{FEATURED.company}</p>
        <div className="mt-3">
          <StarRating rating={FEATURED.rating} />
        </div>
      </div>

      {/* right */}
      <div className="flex-1 flex flex-col justify-center">
        <i className="fa-duotone fa-solid fa-quote-left text-5xl mb-4" style={{ color: COLORS.teal }} />
        <p className="text-xl font-medium leading-relaxed text-white">
          &ldquo;{FEATURED.quote}&rdquo;
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-1 flex-1" style={{ background: COLORS.teal }} />
          <span className="font-black text-xs uppercase tracking-widest" style={{ color: COLORS.teal }}>Featured Review</span>
          <div className="h-1 flex-1" style={{ background: COLORS.teal }} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function TestimonialsSixPage() {
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
        <div style={{ background: COLORS.purple, width: 100, height: 100, borderRadius: 0, border: `4px solid ${COLORS.cream}` }} className="absolute top-10 left-16 rotate-12 opacity-25" />
        <div style={{ background: COLORS.yellow, width: 70, height: 70, borderRadius: '50%' }} className="absolute bottom-16 right-20 opacity-20" />
        <div style={{ background: COLORS.teal, width: 50, height: 120, borderRadius: 0 }} className="absolute top-1/3 right-[10%] -rotate-6 opacity-15" />

        <h1 data-anim className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          Testi<span style={{ color: COLORS.purple }}>monials</span>
        </h1>
        <p data-anim className="mt-4 text-lg font-bold uppercase tracking-widest" style={{ color: COLORS.teal }}>
          Cards &bull; Carousel &bull; Featured &bull; Ratings
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-24">
        {/* ---- Featured ---- */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 mb-8" style={{ color: COLORS.dark }}>
            <i className="fa-duotone fa-solid fa-star" style={{ color: COLORS.yellow }} />
            Featured Testimonial
          </h2>
          <FeaturedTestimonial />
        </section>

        {/* ---- Grid ---- */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 mb-8" style={{ color: COLORS.dark }}>
            <i className="fa-duotone fa-solid fa-grid-2-plus" style={{ color: COLORS.coral }} />
            Testimonial Grid
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </section>

        {/* ---- Carousel ---- */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 mb-8" style={{ color: COLORS.dark }}>
            <i className="fa-duotone fa-solid fa-slideshow" style={{ color: COLORS.teal }} />
            Testimonial Carousel
          </h2>
          <TestimonialCarousel />
        </section>

        {/* ---- Company Logos ---- */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3 mb-8" style={{ color: COLORS.dark }}>
            <i className="fa-duotone fa-solid fa-buildings" style={{ color: COLORS.purple }} />
            Trusted By
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {COMPANY_LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="px-8 py-4 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
                style={{ background: logo.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
              >
                <i className="fa-duotone fa-solid fa-building mr-2" />
                {logo.name}
              </div>
            ))}
          </div>
        </section>

        {/* ---- Stats ---- */}
        <section>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Placements', value: '2,400+', icon: 'fa-trophy', color: COLORS.coral },
              { label: 'Avg Rating', value: '4.8/5', icon: 'fa-star', color: COLORS.yellow },
              { label: 'Recruiters', value: '850+', icon: 'fa-users', color: COLORS.teal },
              { label: 'Companies', value: '320+', icon: 'fa-buildings', color: COLORS.purple },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 text-center"
                style={{ background: stat.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}
              >
                <i className={`fa-duotone fa-solid ${stat.icon} text-3xl mb-3`} style={{ color: COLORS.dark }} />
                <p className="text-3xl font-black" style={{ color: COLORS.dark }}>{stat.value}</p>
                <p className="font-black text-xs uppercase tracking-widest mt-1" style={{ color: COLORS.dark }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ background: COLORS.dark }} className="py-12 text-center">
        <p className="font-black text-xs uppercase tracking-[0.3em]" style={{ color: COLORS.purple }}>
          Splits Network &mdash; Memphis Design System &mdash; Testimonials
        </p>
      </footer>
    </div>
  );
}
