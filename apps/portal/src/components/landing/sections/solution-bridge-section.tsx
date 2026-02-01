'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { duration, easing, stagger } from '../shared/animation-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const promises = [
  {
    icon: 'fa-duotone fa-regular fa-grid-2',
    title: 'One platform',
    description: 'All your split deals in one place',
  },
  {
    icon: 'fa-duotone fa-regular fa-handshake',
    title: 'Transparent terms',
    description: 'Everyone sees the same numbers',
  },
  {
    icon: 'fa-duotone fa-regular fa-chart-line',
    title: 'Real-time visibility',
    description: 'Know where every candidate stands',
  },
];

export function SolutionBridgeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const promisesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Main heading - fade up with emphasis
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: duration.hero,
        ease: easing.smooth,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    );

    // Promise items stagger in
    const items = promisesRef.current?.querySelectorAll('.promise-item');
    if (items) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: duration.normal,
          ease: easing.smooth,
          stagger: stagger.loose,
          scrollTrigger: {
            trigger: promisesRef.current,
            start: 'top 75%',
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-base-100">
      <div className="container mx-auto px-4 text-center">
        {/* Main headline */}
        <h2
          ref={headingRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-16 opacity-0"
        >
          What if split placements
          <br />
          <span className="text-secondary">just worked?</span>
        </h2>

        {/* Three promises */}
        <div
          ref={promisesRef}
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {promises.map((promise, index) => (
            <div key={index} className="promise-item opacity-0">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <i className={`${promise.icon} text-2xl text-secondary`}></i>
              </div>
              <h3 className="text-xl font-bold mb-2">{promise.title}</h3>
              <p className="text-base-content/70">{promise.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
