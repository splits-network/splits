'use client';

/**
 * Basel Article Animated
 *
 * Client wrapper that renders blocks through BaselArticleRenderer
 * and activates GSAP scroll animations via useArticleAnimations.
 */

import { useRef } from 'react';
import type { ContentBlock } from '@splits-network/shared-types';
import { BaselArticleRenderer } from './basel-article-renderer';
import { useArticleAnimations } from './animations/use-article-animations';

export interface BaselArticleAnimatedProps {
    blocks: ContentBlock[];
}

export function BaselArticleAnimated({ blocks }: BaselArticleAnimatedProps) {
    const mainRef = useRef<HTMLElement>(null);
    useArticleAnimations(mainRef);

    return (
        <main ref={mainRef} className="overflow-hidden">
            <BaselArticleRenderer blocks={blocks} />
        </main>
    );
}
