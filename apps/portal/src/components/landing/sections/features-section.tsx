'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { duration, easing, stagger } from '../shared/animation-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: 'fa-duotone fa-regular fa-handshake',
    title: 'Split-first by design',
    description: 'Built for split placements from day one, not retrofitted onto a traditional ATS.',
    color: 'primary',
  },
  {
    icon: 'fa-duotone fa-regular fa-sitemap',
    title: 'Built-in ATS',
    description: 'Jobs, candidates, stages, and notes all in one place. No integrations needed.',
    color: 'secondary',
  },
  {
    icon: 'fa-duotone fa-regular fa-chart-line',
    title: 'Real-time pipelines',
    description: 'Everyone sees where each candidate stands in the process, instantly.',
    color: 'accent',
  },
  {
    icon: 'fa-duotone fa-regular fa-file-invoice-dollar',
    title: 'Transparent fee splits',
    description: 'Clear view of fee percentage, recruiter share, and platform share. No mystery math.',
    color: 'primary',
  },
  {
    icon: 'fa-duotone fa-regular fa-users',
    title: 'Recruiter network',
    description: 'Assign roles to recruiters and control who sees which opportunities.',
    color: 'secondary',
  },
  {
    icon: 'fa-duotone fa-regular fa-bell',
    title: 'Smart notifications',
    description: 'Email alerts for key events: new submissions, stage changes, and placements.',
    color: 'accent',
  },
];

const colorClasses = {
  primary: 'text-primary bg-primary/10',
  secondary: 'text-secondary bg-secondary/10',
  accent: 'text-accent bg-accent/10',
};

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

    // Feature cards stagger in
    const cards = gridRef.current?.querySelectorAll('.feature-card');
    if (cards) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: duration.normal,
          ease: easing.smooth,
          stagger: stagger.tight,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 75%',
          },
        }
      );
    }
  }, { scope: sectionRef });

  // Hover animation handler
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.feature-icon');

    gsap.to(card, {
      y: -4,
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
      duration: duration.fast,
      ease: easing.smooth,
    });

    if (icon) {
      gsap.to(icon, {
        scale: 1.1,
        rotation: 5,
        duration: duration.fast,
        ease: easing.bounce,
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.feature-icon');

    gsap.to(card, {
      y: 0,
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
      duration: duration.fast,
      ease: easing.smooth,
    });

    if (icon) {
      gsap.to(icon, {
        scale: 1,
        rotation: 0,
        duration: duration.fast,
        ease: easing.smooth,
      });
    }
  };

  return (
    <section ref={sectionRef} className="py-24 bg-base-200">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16 opacity-0">
          <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            A complete platform for managing split placements, from first submission to final payout.
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card card bg-base-100 shadow cursor-default opacity-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div
                    className={`feature-icon w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                  >
                    <i className={`${feature.icon} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-base-content/70 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
