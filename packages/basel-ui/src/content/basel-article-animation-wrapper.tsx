'use client';

import { useRef } from 'react';
import { useScrollReveal } from '../animations/use-scroll-reveal';

export interface BaselArticleAnimationWrapperProps {
    children: React.ReactNode;
}

export function BaselArticleAnimationWrapper({ children }: BaselArticleAnimationWrapperProps) {
    const mainRef = useRef<HTMLElement>(null);
    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="overflow-hidden">
            {children}
        </main>
    );
}