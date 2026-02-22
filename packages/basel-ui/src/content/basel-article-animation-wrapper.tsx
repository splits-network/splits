'use client';

/**
 * Basel Article Animation Wrapper
 *
 * Client wrapper that adds GSAP scroll animations as progressive enhancement.
 * Content is rendered server-side by BaselArticleRenderer (children),
 * ensuring crawlers see fully visible HTML.
 */

import { useRef } from 'react';
import { useArticleAnimations } from './animations/use-article-animations';

export interface BaselArticleAnimationWrapperProps {
    children: React.ReactNode;
}

export function BaselArticleAnimationWrapper({ children }: BaselArticleAnimationWrapperProps) {
    const mainRef = useRef<HTMLElement>(null);
    useArticleAnimations(mainRef);

    return (
        <main ref={mainRef} className="overflow-hidden">
            {children}
        </main>
    );
}