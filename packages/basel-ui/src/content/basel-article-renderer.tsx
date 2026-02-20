/**
 * Basel Article Renderer
 *
 * Server component that maps a blocks array to Basel block components.
 * Use BaselArticleAnimated for client-side GSAP scroll animations.
 */

import type { ContentBlock } from '@splits-network/shared-types';
import { HeroBlockComponent } from './blocks/hero-block';
import { FullBleedImageBlockComponent } from './blocks/full-bleed-image-block';
import { ArticleBodyBlockComponent } from './blocks/article-body-block';
import { SplitEditorialBlockComponent } from './blocks/split-editorial-block';
import { PullQuoteBlockComponent } from './blocks/pull-quote-block';
import { StatsBarBlockComponent } from './blocks/stats-bar-block';
import { InlineImageBlockComponent } from './blocks/inline-image-block';
import { CtaBlockComponent } from './blocks/cta-block';
import { FeatureGridBlockComponent } from './blocks/feature-grid-block';
import { TimelineBlockComponent } from './blocks/timeline-block';
import { FaqBlockComponent } from './blocks/faq-block';
import { BenefitsCardsBlockComponent } from './blocks/benefits-cards-block';

const BLOCK_COMPONENTS: Record<string, React.ComponentType<{ block: any; index: number }>> = {
    'hero': HeroBlockComponent,
    'full-bleed-image': FullBleedImageBlockComponent,
    'article-body': ArticleBodyBlockComponent,
    'split-editorial': SplitEditorialBlockComponent,
    'pull-quote': PullQuoteBlockComponent,
    'stats-bar': StatsBarBlockComponent,
    'inline-image': InlineImageBlockComponent,
    'cta': CtaBlockComponent,
    'feature-grid': FeatureGridBlockComponent,
    'timeline': TimelineBlockComponent,
    'faq': FaqBlockComponent,
    'benefits-cards': BenefitsCardsBlockComponent,
};

export interface BaselArticleRendererProps {
    blocks: ContentBlock[];
    className?: string;
}

export function BaselArticleRenderer({ blocks, className }: BaselArticleRendererProps) {
    return (
        <div className={className}>
            {blocks.map((block, index) => {
                const Component = BLOCK_COMPONENTS[block.type];
                if (!Component) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Unknown block type: ${block.type}`);
                    }
                    return null;
                }
                return <Component key={index} block={block as any} index={index} />;
            })}
        </div>
    );
}
