'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { duration, easing, stagger } from '../shared/animation-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const metrics = [
  {
    value: '100%',
    label: 'Fee transparency',
    description: 'Every split is visible to all parties',
    icon: 'fa-duotone fa-regular fa-eye',
  },
  {
    value: 'Zero',
    label: 'Hidden clawbacks',
    description: 'No surprise deductions, ever',
    icon: 'fa-duotone fa-regular fa-shield-check',
  },
  {
    value: 'Real-time',
    label: 'Pipeline visibility',
    description: 'Know where every candidate stands',
    icon: 'fa-duotone fa-regular fa-chart-line',
  },
  {
    value: 'One',
    label: 'Platform for everything',
    description: 'No more spreadsheet chaos',
    icon: 'fa-duotone fa-regular fa-grid-2',
  },
];

export function MetricsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Heading animation
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

    // Metrics cards stagger in with scale
    const cards = metricsRef.current?.querySelectorAll('.metric-card');
    if (cards) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration.normal,
          ease: easing.bounce,
          stagger: stagger.normal,
          scrollTrigger: {
            trigger: metricsRef.current,
            start: 'top 75%',
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-primary text-primary-content">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <h2 className="text-4xl font-bold mb-4">Built on transparency</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            No mystery math. No surprise fees. Just clear terms that everyone can see.
          </p>
        </div>

        {/* Metrics Grid */}
        <div
          ref={metricsRef}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="metric-card card bg-base-100 text-base-content shadow-lg opacity-0"
            >
              <div className="card-body text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <i className={`${metric.icon} text-xl text-primary`}></i>
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{metric.value}</div>
                <div className="font-semibold text-lg">{metric.label}</div>
                <p className="text-sm text-base-content/60 mt-1">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
