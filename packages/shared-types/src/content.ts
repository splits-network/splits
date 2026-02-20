/**
 * Content CMS Block Types
 *
 * Discriminated union of composable page blocks used by the content-service
 * and the BaselArticleRenderer. Each page is an ordered array of these blocks.
 */

/* ─── Shared sub-types ──────────────────────────────────────────────────── */

export interface ContentButton {
    label: string;
    href: string;
    icon?: string;
    variant: 'primary' | 'secondary' | 'accent' | 'warning' | 'outline' | 'ghost';
}

export interface ContentMetaItem {
    icon?: string;
    label: string;
}

/* ─── Block types ───────────────────────────────────────────────────────── */

export interface HeroBlock {
    type: 'hero';
    kicker?: string;
    kickerIcon?: string;
    headlineWords: { text: string; accent?: boolean }[];
    subtitle?: string;
    image?: string;
    imageAlt?: string;
    meta?: ContentMetaItem[];
    buttons?: ContentButton[];
}

export interface FullBleedImageBlock {
    type: 'full-bleed-image';
    image: string;
    imageAlt: string;
    caption?: string;
    overlayText?: string;
    overlayAccentText?: string;
    height?: string;
}

export interface ArticleBodyBlock {
    type: 'article-body';
    sectionNumber?: string;
    kicker?: string;
    kickerColor?: string;
    heading: string;
    paragraphs: string[];
    bg?: 'base-100' | 'base-200';
}

export interface SplitEditorialBlock {
    type: 'split-editorial';
    sectionNumber?: string;
    kicker?: string;
    kickerColor?: string;
    heading: string;
    paragraphs?: string[];
    items?: { icon?: string; title: string; body: string }[];
    image: string;
    imageAlt: string;
    imageOverlayColor?: string;
    layout: 'text-left' | 'text-right';
    bg?: 'base-100' | 'base-200';
}

export interface PullQuoteBlock {
    type: 'pull-quote';
    quote: string;
    citation?: string;
    bg?: 'neutral' | 'primary' | 'secondary' | 'base-100' | 'base-200';
    style?: 'left-border' | 'centered';
}

export interface StatsBarBlock {
    type: 'stats-bar';
    stats: { value: string; label: string; borderColor?: string }[];
    bg?: 'neutral' | 'base-100' | 'base-200';
}

export interface InlineImageBlock {
    type: 'inline-image';
    image: string;
    imageAlt: string;
    caption?: string;
    height?: string;
}

export interface CtaBlock {
    type: 'cta';
    heading: string;
    subtitle?: string;
    buttons: ContentButton[];
    contactEmail?: string;
    bg?: 'primary' | 'secondary' | 'neutral' | 'base-100';
}

export interface FeatureGridBlock {
    type: 'feature-grid';
    heading?: string;
    kicker?: string;
    subtitle?: string;
    columns?: 2 | 3 | 4;
    items: {
        icon?: string;
        iconColor?: string;
        badge?: string;
        title: string;
        description: string;
        stats?: string;
    }[];
    bg?: 'base-100' | 'base-200';
}

export interface TimelineBlock {
    type: 'timeline';
    heading?: string;
    kicker?: string;
    subtitle?: string;
    steps: {
        number?: number;
        title: string;
        description: string;
        icon?: string;
    }[];
    bg?: 'base-100' | 'base-200';
}

export interface FaqBlock {
    type: 'faq';
    heading?: string;
    kicker?: string;
    subtitle?: string;
    items: { question: string; answer: string }[];
    bg?: 'neutral' | 'base-100' | 'base-200';
}

export interface BenefitsCardsBlock {
    type: 'benefits-cards';
    heading?: string;
    kicker?: string;
    subtitle?: string;
    cards: {
        icon?: string;
        title: string;
        description: string;
        metric?: string;
        metricLabel?: string;
    }[];
    bg?: 'base-100' | 'base-200';
}

/* ─── Union type ────────────────────────────────────────────────────────── */

export type ContentBlock =
    | HeroBlock
    | FullBleedImageBlock
    | ArticleBodyBlock
    | SplitEditorialBlock
    | PullQuoteBlock
    | StatsBarBlock
    | InlineImageBlock
    | CtaBlock
    | FeatureGridBlock
    | TimelineBlock
    | FaqBlock
    | BenefitsCardsBlock;

export type ContentBlockType = ContentBlock['type'];

export const VALID_BLOCK_TYPES: ContentBlockType[] = [
    'hero',
    'full-bleed-image',
    'article-body',
    'split-editorial',
    'pull-quote',
    'stats-bar',
    'inline-image',
    'cta',
    'feature-grid',
    'timeline',
    'faq',
    'benefits-cards',
];

/* ─── Navigation types ─────────────────────────────────────────────────── */

export interface NavSubItem {
    icon: string;
    label: string;
    desc: string;
    href: string;
}

export interface NavItem {
    label: string;
    icon?: string;
    href?: string | null;
    subItems?: NavSubItem[];
}

export interface HeaderNavConfig {
    items: NavItem[];
}

export interface FooterLinkItem {
    label: string;
    href: string;
    external?: boolean;
}

export interface FooterSection {
    title: string;
    links: FooterLinkItem[];
}

export interface FooterSocialLink {
    icon: string;
    href: string;
    label: string;
}

export interface FooterTrustStat {
    value: string;
    label: string;
}

export interface FooterNavConfig {
    sections: FooterSection[];
    socialLinks: FooterSocialLink[];
    trustStats: FooterTrustStat[];
    legalLinks: FooterLinkItem[];
}

export interface ContentNavigation {
    id: string;
    app: ContentApp;
    location: 'header' | 'footer';
    config: HeaderNavConfig | FooterNavConfig;
    updated_at: string;
}

/* ─── Page-level types ──────────────────────────────────────────────────── */

export type ContentApp = 'portal' | 'candidate' | 'corporate';
export type ContentPageStatus = 'draft' | 'published' | 'archived';

export interface ContentPage {
    id: string;
    slug: string;
    app: ContentApp;
    title: string;
    description?: string;
    og_image?: string;
    category?: string;
    status: ContentPageStatus;
    published_at?: string;
    author?: string;
    read_time?: string;
    blocks: ContentBlock[];
    meta?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}
