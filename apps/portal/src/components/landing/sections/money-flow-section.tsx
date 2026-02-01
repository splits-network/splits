'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { duration, easing, stagger } from '../shared/animation-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const flowSteps = [
  {
    icon: 'fa-duotone fa-regular fa-building',
    title: 'Company',
    description: 'Pays placement fee',
    color: 'primary',
    bgClass: 'bg-primary',
    textClass: 'text-primary-content',
  },
  {
    icon: 'fa-duotone fa-regular fa-handshake',
    title: 'Splits Network',
    description: 'Platform share (25%)',
    color: 'secondary',
    bgClass: 'bg-secondary',
    textClass: 'text-secondary-content',
  },
  {
    icon: 'fa-duotone fa-regular fa-user-tie',
    title: 'Recruiter',
    description: 'Recruiter share (75%)',
    color: 'accent',
    bgClass: 'bg-accent',
    textClass: 'text-accent-content',
  },
];

const exampleBreakdown = [
  { value: 120000, label: 'Candidate Salary', color: 'text-primary', prefix: '$' },
  { value: 24000, label: 'Placement Fee (20%)', color: 'text-secondary', prefix: '$' },
  { value: 18000, label: 'Recruiter Share (75%)', color: 'text-accent', prefix: '$' },
];

export function MoneyFlowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const arrow1Ref = useRef<SVGSVGElement>(null);
  const arrow2Ref = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Heading fade in
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: duration.normal,
        ease: easing.smooth,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      }
    );

    // Flow cards scale in sequentially
    const flowCards = flowRef.current?.querySelectorAll('.flow-card');
    if (flowCards) {
      gsap.fromTo(
        flowCards,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: duration.normal,
          ease: easing.bounce,
          stagger: stagger.loose,
          scrollTrigger: {
            trigger: flowRef.current,
            start: 'top 75%',
          },
        }
      );
    }

    // Arrow 1 draw animation
    if (arrow1Ref.current) {
      const path = arrow1Ref.current.querySelector('.arrow-path');
      if (path) {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.4,
          scrollTrigger: {
            trigger: flowRef.current,
            start: 'top 75%',
          },
        });
      }
    }

    // Arrow 2 draw animation
    if (arrow2Ref.current) {
      const path = arrow2Ref.current.querySelector('.arrow-path');
      if (path) {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.7,
          scrollTrigger: {
            trigger: flowRef.current,
            start: 'top 75%',
          },
        });
      }
    }

    // Breakdown card slide in
    gsap.fromTo(
      breakdownRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: duration.normal,
        ease: easing.smooth,
        scrollTrigger: {
          trigger: breakdownRef.current,
          start: 'top 85%',
        },
      }
    );

    // Animated counters for breakdown values
    const counterElements = breakdownRef.current?.querySelectorAll('.counter-value');
    if (counterElements) {
      counterElements.forEach((el, index) => {
        const target = exampleBreakdown[index].value;
        gsap.fromTo(
          { value: 0 },
          { value: target },
          {
            duration: 1.5,
            ease: 'power2.out',
            delay: 0.3 + index * 0.2,
            scrollTrigger: {
              trigger: breakdownRef.current,
              start: 'top 85%',
            },
            onUpdate: function () {
              if (el) {
                el.textContent = `$${Math.floor(this.targets()[0].value).toLocaleString()}`;
              }
            },
          }
        );
      });
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-base-100 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Follow the money</h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            See exactly where every dollar goes. Clear terms, no surprise clawbacks.
          </p>
        </div>

        {/* Flow Diagram */}
        <div ref={flowRef} className="max-w-5xl mx-auto mb-16">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
            {/* Company Card */}
            <div className="flow-card card bg-primary text-primary-content shadow-xl w-full lg:w-56 opacity-0">
              <div className="card-body items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <i className="fa-duotone fa-regular fa-building text-3xl"></i>
                </div>
                <h3 className="card-title text-lg">Company</h3>
                <p className="text-sm opacity-80">Pays placement fee</p>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden lg:flex items-center justify-center w-20">
              <svg ref={arrow1Ref} className="w-full h-8" viewBox="0 0 80 32">
                <path
                  className="arrow-path"
                  d="M0 16 L60 16 L50 6 M60 16 L50 26"
                  fill="none"
                  stroke="oklch(var(--color-primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="lg:hidden flex items-center justify-center h-12">
              <i className="fa-duotone fa-regular fa-arrow-down text-3xl text-primary"></i>
            </div>

            {/* Platform Card */}
            <div className="flow-card card bg-secondary text-secondary-content shadow-xl w-full lg:w-56 opacity-0">
              <div className="card-body items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <i className="fa-duotone fa-regular fa-handshake text-3xl"></i>
                </div>
                <h3 className="card-title text-lg">Splits Network</h3>
                <p className="text-sm opacity-80">Platform share (25%)</p>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden lg:flex items-center justify-center w-20">
              <svg ref={arrow2Ref} className="w-full h-8" viewBox="0 0 80 32">
                <path
                  className="arrow-path"
                  d="M0 16 L60 16 L50 6 M60 16 L50 26"
                  fill="none"
                  stroke="oklch(var(--color-secondary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="lg:hidden flex items-center justify-center h-12">
              <i className="fa-duotone fa-regular fa-arrow-down text-3xl text-secondary"></i>
            </div>

            {/* Recruiter Card */}
            <div className="flow-card card bg-accent text-accent-content shadow-xl w-full lg:w-56 opacity-0">
              <div className="card-body items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <i className="fa-duotone fa-regular fa-user-tie text-3xl"></i>
                </div>
                <h3 className="card-title text-lg">Recruiter</h3>
                <p className="text-sm opacity-80">Recruiter share (75%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Example Breakdown */}
        <div ref={breakdownRef} className="max-w-4xl mx-auto opacity-0">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h3 className="text-xl font-bold text-center mb-6">Example Placement</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {exampleBreakdown.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`counter-value text-4xl font-bold ${item.color} mb-2`}>$0</div>
                    <div className="text-sm text-base-content/70">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="divider my-4"></div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-base-content/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span>Platform share: $6,000 (25%)</span>
                </div>
                <div className="hidden sm:block">•</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span>Recruiter receives: $18,000 (75%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
