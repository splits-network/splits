'use client';

import { useRef } from 'react';
import type { ContentBlock } from '@splits-network/shared-types';
import { BaselArticleRenderer } from './basel-article-renderer';
import { useScrollReveal } from '../animations/use-scroll-reveal';

export interface BaselArticleAnimatedProps {
    blocks: ContentBlock[];
}

export function BaselArticleAnimated({ blocks }: BaselArticleAnimatedProps) {
    const mainRef = useRef<HTMLElement>(null);
    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="overflow-hidden">
            <BaselArticleRenderer blocks={blocks} />
        </main>
    );
}
