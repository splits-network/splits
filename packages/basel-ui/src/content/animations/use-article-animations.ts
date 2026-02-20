'use client';

/**
 * GSAP animation hook for Basel Article pages.
 *
 * Extracted from apps/corporate/src/app/showcase/articles/one/page.tsx.
 * Targets CSS class names used by the block components.
 */

import { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function useArticleAnimations(containerRef: RefObject<HTMLElement | null>) {
    useGSAP(
        () => {
            if (!containerRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

            if (prefersReducedMotion) {
                containerRef.current
                    .querySelectorAll('.opacity-0')
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = '1';
                    });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ── HERO ────────────────────────────────────────────
            const heroTl = gsap.timeline({
                defaults: { ease: 'power3.out' },
            });

            const heroKicker = $1('.hero-kicker');
            if (heroKicker) {
                heroTl.fromTo(
                    heroKicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 }
                );
            }

            const heroWords = $('.hero-headline-word');
            if (heroWords.length) {
                heroTl.fromTo(
                    heroWords,
                    { opacity: 0, y: 80, rotateX: 40 },
                    { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.12 },
                    '-=0.3'
                );
            }

            const heroSubtitle = $1('.hero-subtitle');
            if (heroSubtitle) {
                heroTl.fromTo(
                    heroSubtitle,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    '-=0.5'
                );
            }

            const heroMetaItems = $('.hero-meta-item');
            if (heroMetaItems.length) {
                heroTl.fromTo(
                    heroMetaItems,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    '-=0.3'
                );
            }

            const heroCtaRow = $1('.hero-cta-row');
            if (heroCtaRow) {
                heroTl.fromTo(
                    heroCtaRow,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    '-=0.2'
                );
            }

            // Hero image
            const heroImgWrap = $1('.hero-img-wrap');
            if (heroImgWrap) {
                gsap.fromTo(
                    heroImgWrap,
                    { opacity: 0, scale: 1.08 },
                    { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out', delay: 0.2 }
                );

                const heroImg = heroImgWrap.querySelector('img');
                const heroSection = $1('.hero-section');
                if (heroImg && heroSection) {
                    gsap.to(heroImg, {
                        yPercent: 12,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: heroSection,
                            start: 'top top',
                            end: 'bottom top',
                            scrub: true,
                        },
                    });
                }
            }

            // ── SECTION REVEALS ─────────────────────────────────
            $('.article-block').forEach((block) => {
                gsap.fromTo(
                    block,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: block, start: 'top 80%' },
                    }
                );
            });

            // ── SPLIT-SCREEN SECTIONS ───────────────────────────
            $('.split-text-left').forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: el, start: 'top 70%' },
                    }
                );
            });

            $('.split-img-right').forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: el, start: 'top 70%' },
                    }
                );
            });

            $('.split-text-right').forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: el, start: 'top 70%' },
                    }
                );
            });

            $('.split-img-left').forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: el, start: 'top 70%' },
                    }
                );
            });

            // ── PULL QUOTES ─────────────────────────────────────
            $('.pull-quote-block').forEach((quote) => {
                gsap.fromTo(
                    quote,
                    { opacity: 0, scale: 0.96 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: quote, start: 'top 80%' },
                    }
                );
            });

            // ── INLINE IMAGES ───────────────────────────────────
            $('.inline-image').forEach((imgEl) => {
                gsap.fromTo(
                    imgEl,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: imgEl, start: 'top 85%' },
                    }
                );

                const innerImg = imgEl.querySelector('img');
                if (innerImg) {
                    gsap.to(innerImg, {
                        yPercent: 10,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: imgEl,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true,
                        },
                    });
                }
            });

            // ── STATS BAR ──────────────────────────────────────
            const statsBar = $1('.stats-bar');
            if (statsBar) {
                gsap.fromTo(
                    $('.stat-item'),
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: statsBar, start: 'top 85%' },
                    }
                );
            }

            // ── FAQ CARDS ───────────────────────────────────────
            $('.faq-card').forEach((card) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: card, start: 'top 85%' },
                    }
                );
            });

            // ── CTA ─────────────────────────────────────────────
            const ctaContent = $1('.final-cta-content');
            const ctaSection = $1('.final-cta');
            if (ctaContent && ctaSection) {
                gsap.fromTo(
                    ctaContent,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: ctaSection, start: 'top 80%' },
                    }
                );
            }
        },
        { scope: containerRef }
    );
}
