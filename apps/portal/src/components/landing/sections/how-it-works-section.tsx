'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { duration, easing, stagger } from '../shared/animation-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const recruiterSteps = [
  {
    number: 1,
    icon: 'fa-duotone fa-regular fa-user-plus',
    title: 'Join the network',
    description: 'Sign up, set your specialties, and browse roles that match your expertise.',
  },
  {
    number: 2,
    icon: 'fa-duotone fa-regular fa-paper-plane',
    title: 'Submit candidates',
    description: 'Found the right fit? Submit them directly into the hiring pipeline.',
  },
  {
    number: 3,
    icon: 'fa-duotone fa-regular fa-money-bill-wave',
    title: 'Get paid your split',
    description: 'Candidate hired? You receive your share. Tracked transparently.',
  },
];

const companySteps = [
  {
    number: 1,
    icon: 'fa-duotone fa-regular fa-briefcase',
    title: 'Post your roles',
    description: 'List positions with clear requirements, fees, and timelines.',
  },
  {
    number: 2,
    icon: 'fa-duotone fa-regular fa-users',
    title: 'Tap the network',
    description: 'Specialized recruiters see your roles and start sourcing candidates.',
  },
  {
    number: 3,
    icon: 'fa-duotone fa-regular fa-handshake',
    title: 'Pay only on hire',
    description: 'No retainers. Pay the agreed split only when someone starts.',
  },
];

interface TimelineStepProps {
  number: number;
  icon: string;
  title: string;
  description: string;
  color: 'primary' | 'secondary';
  isLast: boolean;
  align: 'left' | 'right';
}

function TimelineStep({ number, icon, title, description, color, isLast, align }: TimelineStepProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary',
      text: 'text-primary',
      line: 'bg-primary/30',
      glow: 'shadow-primary/20',
    },
    secondary: {
      bg: 'bg-secondary',
      text: 'text-secondary',
      line: 'bg-secondary/30',
      glow: 'shadow-secondary/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`timeline-step relative flex items-start gap-6 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {/* Timeline node and line */}
      <div className="flex flex-col items-center">
        {/* Number circle */}
        <div
          className={`step-node relative z-10 w-16 h-16 rounded-full ${colors.bg} text-white flex items-center justify-center shadow-lg ${colors.glow} shadow-xl`}
        >
          <span className="text-2xl font-bold">{number}</span>
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div className={`timeline-line w-0.5 h-24 ${colors.line} mt-2`}></div>
        )}
      </div>

      {/* Content */}
      <div className="step-content flex-1 pt-2 pb-8">
        <div className={`inline-flex items-center gap-2 mb-2 ${colors.text}`}>
          <i className={`${icon} text-xl`}></i>
          <h4 className="font-bold text-xl text-base-content">{title}</h4>
        </div>
        <p className="text-base-content/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const recruiterTrackRef = useRef<HTMLDivElement>(null);
  const companyTrackRef = useRef<HTMLDivElement>(null);
  const convergenceRef = useRef<HTMLDivElement>(null);
  const bgPathsRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Background paths draw animation
    if (bgPathsRef.current) {
      const paths = bgPathsRef.current.querySelectorAll('.path-line');
      paths.forEach((path) => {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
          },
        });
      });
    }

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

    // Recruiter track - slides and fades
    if (recruiterTrackRef.current) {
      const recruiterSteps = recruiterTrackRef.current.querySelectorAll('.timeline-step');
      const recruiterNodes = recruiterTrackRef.current.querySelectorAll('.step-node');
      const recruiterLines = recruiterTrackRef.current.querySelectorAll('.timeline-line');
      const recruiterContent = recruiterTrackRef.current.querySelectorAll('.step-content');

      // Nodes pop in
      gsap.fromTo(
        recruiterNodes,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: duration.fast,
          ease: easing.bounce,
          stagger: stagger.loose,
          scrollTrigger: {
            trigger: recruiterTrackRef.current,
            start: 'top 75%',
          },
        }
      );

      // Lines grow down
      gsap.fromTo(
        recruiterLines,
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: duration.normal,
          ease: easing.smooth,
          stagger: stagger.loose,
          delay: 0.2,
          scrollTrigger: {
            trigger: recruiterTrackRef.current,
            start: 'top 75%',
          },
        }
      );

      // Content slides in from left
      gsap.fromTo(
        recruiterContent,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: duration.normal,
          ease: easing.smooth,
          stagger: stagger.loose,
          delay: 0.1,
          scrollTrigger: {
            trigger: recruiterTrackRef.current,
            start: 'top 75%',
          },
        }
      );
    }

    // Company track - slides and fades
    if (companyTrackRef.current) {
      const companyNodes = companyTrackRef.current.querySelectorAll('.step-node');
      const companyLines = companyTrackRef.current.querySelectorAll('.timeline-line');
      const companyContent = companyTrackRef.current.querySelectorAll('.step-content');

      // Nodes pop in
      gsap.fromTo(
        companyNodes,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: duration.fast,
          ease: easing.bounce,
          stagger: stagger.loose,
          scrollTrigger: {
            trigger: companyTrackRef.current,
            start: 'top 75%',
          },
        }
      );

      // Lines grow down
      gsap.fromTo(
        companyLines,
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: duration.normal,
          ease: easing.smooth,
          stagger: stagger.loose,
          delay: 0.2,
          scrollTrigger: {
            trigger: companyTrackRef.current,
            start: 'top 75%',
          },
        }
      );

      // Content slides in from right
      gsap.fromTo(
        companyContent,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: duration.normal,
          ease: easing.smooth,
          stagger: stagger.loose,
          delay: 0.1,
          scrollTrigger: {
            trigger: companyTrackRef.current,
            start: 'top 75%',
          },
        }
      );
    }

    // Convergence point animation
    if (convergenceRef.current) {
      gsap.fromTo(
        convergenceRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: duration.hero,
          ease: easing.bounce,
          scrollTrigger: {
            trigger: convergenceRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 bg-base-200 text-base-content overflow-hidden relative">
      {/* Background Pattern - Converging Paths */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          ref={bgPathsRef}
          className="absolute w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left path (primary color) - curves from top-left toward center-bottom */}
          <path
            d="M0 100 Q300 200 400 400 T600 700"
            fill="none"
            stroke="oklch(var(--color-primary))"
            strokeWidth="2"
            strokeOpacity="0.08"
            className="path-line"
          />
          <path
            d="M-50 200 Q250 300 350 450 T550 750"
            fill="none"
            stroke="oklch(var(--color-primary))"
            strokeWidth="1.5"
            strokeOpacity="0.05"
            className="path-line"
          />

          {/* Right path (secondary color) - curves from top-right toward center-bottom */}
          <path
            d="M1200 100 Q900 200 800 400 T600 700"
            fill="none"
            stroke="oklch(var(--color-secondary))"
            strokeWidth="2"
            strokeOpacity="0.08"
            className="path-line"
          />
          <path
            d="M1250 200 Q950 300 850 450 T650 750"
            fill="none"
            stroke="oklch(var(--color-secondary))"
            strokeWidth="1.5"
            strokeOpacity="0.05"
            className="path-line"
          />

          {/* Subtle grid dots */}
          <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="currentColor" fillOpacity="0.05" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />

          {/* Convergence point glow */}
          <circle cx="600" cy="700" r="100" fill="url(#convergenceGlow)" />
          <defs>
            <radialGradient id="convergenceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(var(--color-primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="oklch(var(--color-primary))" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-20 opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Two paths, one platform</h2>
          <p className="text-lg opacity-70 max-w-2xl mx-auto">
            Whether you're sourcing candidates or hiring them, the journey is simple.
          </p>
        </div>

        {/* Dual Timeline */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto mb-16">
          {/* Recruiter Timeline */}
          <div ref={recruiterTrackRef}>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="fa-duotone fa-regular fa-user-tie text-primary"></i>
              </div>
              <h3 className="text-2xl font-bold">For Recruiters</h3>
            </div>
            <div className="pl-2">
              {recruiterSteps.map((step, index) => (
                <TimelineStep
                  key={step.number}
                  {...step}
                  color="primary"
                  isLast={index === recruiterSteps.length - 1}
                  align="left"
                />
              ))}
            </div>
          </div>

          {/* Company Timeline */}
          <div ref={companyTrackRef}>
            <div className="flex items-center gap-3 mb-10 lg:justify-end">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <i className="fa-duotone fa-regular fa-building text-secondary"></i>
              </div>
              <h3 className="text-2xl font-bold">For Companies</h3>
            </div>
            <div className="lg:pr-2">
              {companySteps.map((step, index) => (
                <TimelineStep
                  key={step.number}
                  {...step}
                  color="secondary"
                  isLast={index === companySteps.length - 1}
                  align="left"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Convergence Point */}
        <div ref={convergenceRef} className="text-center opacity-0">
          <div className="inline-flex items-center gap-4 px-8 py-6 rounded-2xl bg-base-100 shadow-lg border border-base-300">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
              <i className="fa-duotone fa-regular fa-user-tie text-white text-lg"></i>
            </div>
            <div className="flex flex-col items-center gap-1">
              <i className="fa-duotone fa-regular fa-arrows-to-circle text-2xl text-base-content/40"></i>
              <span className="text-sm font-medium text-base-content/70">Successful placement</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-md">
              <i className="fa-duotone fa-regular fa-building text-white text-lg"></i>
            </div>
          </div>
          <p className="mt-6 text-base-content/50 text-sm">
            Both paths lead to the same destination: a hire that works for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}
