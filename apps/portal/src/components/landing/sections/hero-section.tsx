'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { duration, easing, stagger } from '../shared/animation-utils';

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // ==========================================================================
    // ENTRANCE ANIMATION - Staggered reveal on page load
    // ==========================================================================
    const entranceTl = gsap.timeline({ delay: 0.2 });

    // Headline - fade up with slight scale
    entranceTl.fromTo(
      headlineRef.current,
      { opacity: 0, y: 50, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: duration.hero, ease: easing.smooth }
    );

    // Subtitle - fade up
    entranceTl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth },
      '-=0.6' // Overlap with headline
    );

    // CTAs - stagger in
    entranceTl.fromTo(
      ctaRef.current?.children || [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth, stagger: stagger.normal },
      '-=0.4'
    );

    // Tagline - fade in last
    entranceTl.fromTo(
      taglineRef.current,
      { opacity: 0 },
      { opacity: 1, duration: duration.normal, ease: easing.smooth },
      '-=0.3'
    );

    // ==========================================================================
    // SCROLL ANIMATION - Video fades out, content has parallax
    // ==========================================================================

    // Video fades out as user scrolls
    gsap.to(videoRef.current, {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '80% top',
        scrub: true,
      },
    });

    // Content moves up slower than scroll (subtle parallax)
    gsap.to(contentRef.current, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="hero min-h-[90vh] relative overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      >
        <source src="/ads.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-base-100/75"></div>

      {/* Content */}
      <div
        ref={contentRef}
        className="hero-content text-center max-w-5xl relative z-10 py-20"
      >
        <div className="space-y-8">
          {/* Headline with emphasis on "everyone wins" */}
          <h1
            ref={headlineRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight opacity-0"
          >
            A recruiting network where
            <br />
            <span className="text-secondary">everyone wins</span> on the placement
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto leading-relaxed opacity-0"
          >
            Companies post roles. Recruiters bring candidates. When someone gets hired, everyone gets their split.
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link href="/sign-up" className="btn btn-primary btn-lg opacity-0">
              <i className="fa-duotone fa-regular fa-user-tie"></i>
              Join as a Recruiter
            </Link>
            <Link href="#for-companies" className="btn btn-outline btn-lg opacity-0">
              <i className="fa-duotone fa-regular fa-building"></i>
              Post Roles as a Company
            </Link>
          </div>

          {/* Tagline */}
          <div
            ref={taglineRef}
            className="text-sm text-base-content/60 pt-4 opacity-0"
          >
            Built by recruiters. Designed for transparent splits.
          </div>
        </div>
      </div>
    </section>
  );
}
