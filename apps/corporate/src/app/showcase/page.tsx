'use client';

import Link from 'next/link';
import { ACCENT_HEX } from '@splits-network/memphis-ui';

type AccentKey = 'coral' | 'teal' | 'yellow' | 'purple';
const ACCENT_CYCLE: AccentKey[] = ['coral', 'teal', 'yellow', 'purple'];

const VARIANT_NAMES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'] as const;

interface ShowcaseCategory {
    title: string;
    slug: string;
    description: string;
    icon: string;
    /** Which numbered variants exist (e.g. ['one','two',...,'ten']) */
    variants: string[];
    accent: AccentKey;
}

function variants(count: number): string[] {
    return VARIANT_NAMES.slice(0, count) as unknown as string[];
}

const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
    // ── Layout & Navigation ──────────────────────────────────────
    {
        title: 'Headers',
        slug: 'headers',
        description: 'Navigation bars, mega menus, search toggles, mobile hamburgers',
        icon: 'fa-browser',
        variants: variants(10),
        accent: 'coral',
    },
    {
        title: 'Footers',
        slug: 'footers',
        description: 'Site footers, link columns, newsletters, social links',
        icon: 'fa-rectangle-wide',
        variants: variants(10),
        accent: 'teal',
    },
    {
        title: 'Menus',
        slug: 'menus',
        description: 'Dropdowns, context menus, filters, search bars, selects',
        icon: 'fa-bars-staggered',
        variants: ['six'],
        accent: 'yellow',
    },
    {
        title: 'Tabs',
        slug: 'tabs',
        description: 'Tabbed interfaces, segmented controls, underline tabs',
        icon: 'fa-window-restore',
        variants: ['six'],
        accent: 'purple',
    },

    // ── Data Display ─────────────────────────────────────────────
    {
        title: 'Dashboards',
        slug: 'dashboards',
        description: 'Analytics layouts, stat cards, KPIs, chart grids',
        icon: 'fa-gauge-high',
        variants: variants(10),
        accent: 'coral',
    },
    {
        title: 'Lists',
        slug: 'lists',
        description: 'Data lists, filtered views, list items, pagination',
        icon: 'fa-list',
        variants: variants(10),
        accent: 'teal',
    },
    {
        title: 'Tables',
        slug: 'tables',
        description: 'Data tables, sortable columns, row actions, bulk select',
        icon: 'fa-table',
        variants: variants(9),
        accent: 'yellow',
    },
    {
        title: 'Cards',
        slug: 'cards',
        description: 'Card grids, stat cards, feature cards, pricing cards',
        icon: 'fa-cards-blank',
        variants: variants(10),
        accent: 'purple',
    },
    {
        title: 'Details',
        slug: 'details',
        description: 'Detail pages, single-record views, entity profiles',
        icon: 'fa-file-lines',
        variants: variants(10),
        accent: 'coral',
    },
    {
        title: 'Profiles',
        slug: 'profiles',
        description: 'User profiles, team members, avatar layouts',
        icon: 'fa-user',
        variants: variants(9),
        accent: 'teal',
    },

    // ── Forms & Input ────────────────────────────────────────────
    {
        title: 'Forms',
        slug: 'forms',
        description: 'Input forms, multi-step wizards, validation patterns',
        icon: 'fa-input-text',
        variants: variants(10),
        accent: 'yellow',
    },
    {
        title: 'Buttons',
        slug: 'buttons',
        description: 'Button variants, sizes, states, groups, icons, loading',
        icon: 'fa-hand-pointer',
        variants: ['six'],
        accent: 'purple',
    },
    {
        title: 'Search',
        slug: 'search',
        description: 'Search pages, results layouts, autocomplete, filters',
        icon: 'fa-magnifying-glass',
        variants: variants(10),
        accent: 'coral',
    },
    {
        title: 'Modals',
        slug: 'modals',
        description: 'Dialogs, confirmations, form modals, drawers',
        icon: 'fa-window-maximize',
        variants: variants(10),
        accent: 'teal',
    },

    // ── Content ──────────────────────────────────────────────────
    {
        title: 'Landing Pages',
        slug: 'landing',
        description: 'Hero sections, feature blocks, CTAs, marketing layouts',
        icon: 'fa-rocket-launch',
        variants: variants(10),
        accent: 'yellow',
    },
    {
        title: 'Articles',
        slug: 'articles',
        description: 'Blog posts, long-form content, pull quotes, media',
        icon: 'fa-newspaper',
        variants: variants(10),
        accent: 'purple',
    },
    {
        title: 'Pricing',
        slug: 'pricing',
        description: 'Pricing tables, plan comparisons, feature matrices',
        icon: 'fa-tags',
        variants: variants(9),
        accent: 'coral',
    },
    {
        title: 'Testimonials',
        slug: 'testimonials',
        description: 'Reviews, quotes, social proof, rating displays',
        icon: 'fa-quote-right',
        variants: ['six'],
        accent: 'teal',
    },
    {
        title: 'FAQs',
        slug: 'faqs',
        description: 'Accordion FAQs, knowledge base, help sections',
        icon: 'fa-circle-question',
        variants: ['six'],
        accent: 'yellow',
    },

    // ── Communication ────────────────────────────────────────────
    {
        title: 'Messages',
        slug: 'messages',
        description: 'Chat interfaces, conversation threads, message bubbles',
        icon: 'fa-comments',
        variants: variants(10),
        accent: 'purple',
    },
    {
        title: 'Notifications',
        slug: 'notifications',
        description: 'Notification feeds, alert banners, toast patterns',
        icon: 'fa-bell',
        variants: variants(9),
        accent: 'coral',
    },
    {
        title: 'Notifications UI',
        slug: 'notifications-ui',
        description: 'Notification badges, indicators, dot patterns',
        icon: 'fa-bell-on',
        variants: ['six'],
        accent: 'teal',
    },

    // ── Flows & States ───────────────────────────────────────────
    {
        title: 'Auth',
        slug: 'auth',
        description: 'Login, signup, forgot password, verification flows',
        icon: 'fa-lock',
        variants: variants(9),
        accent: 'yellow',
    },
    {
        title: 'Onboarding',
        slug: 'onboarding',
        description: 'Welcome flows, setup wizards, progress indicators',
        icon: 'fa-flag-checkered',
        variants: variants(9),
        accent: 'purple',
    },
    {
        title: 'Empty States',
        slug: 'empty',
        description: 'Zero-data views, first-run experiences, placeholder UIs',
        icon: 'fa-ghost',
        variants: variants(10),
        accent: 'coral',
    },
    {
        title: 'Settings',
        slug: 'settings',
        description: 'Preference panels, account settings, toggle groups',
        icon: 'fa-gear',
        variants: variants(9),
        accent: 'teal',
    },

    // ── Timeline & Calendar ──────────────────────────────────────
    {
        title: 'Timelines',
        slug: 'timelines',
        description: 'Activity feeds, history views, progress trackers',
        icon: 'fa-timeline',
        variants: ['six'],
        accent: 'yellow',
    },
    {
        title: 'Calendars',
        slug: 'calendars',
        description: 'Calendar views, date pickers, event scheduling',
        icon: 'fa-calendar',
        variants: ['six'],
        accent: 'purple',
    },

    // ── Typography ───────────────────────────────────────────────
    {
        title: 'Typography',
        slug: 'typography-six',
        description: 'Headlines, body, labels, data, accent patterns, color matrix',
        icon: 'fa-font-case',
        variants: [],
        accent: 'coral',
    },
];

// Group categories for visual sections
const SECTIONS = [
    { label: 'Layout & Navigation', start: 0, end: 4 },
    { label: 'Data Display', start: 4, end: 10 },
    { label: 'Forms & Input', start: 10, end: 14 },
    { label: 'Content', start: 14, end: 19 },
    { label: 'Communication', start: 19, end: 22 },
    { label: 'Flows & States', start: 22, end: 26 },
    { label: 'Timeline & Calendar', start: 26, end: 28 },
    { label: 'Typography', start: 28, end: 29 },
];

function getVariantHref(slug: string, variant: string): string {
    return `/showcase/${slug}/${variant}`;
}

function getCategoryHref(cat: ShowcaseCategory): string {
    // Typography has page.tsx directly in its folder
    if (cat.variants.length === 0) return `/showcase/${cat.slug}`;
    // Single variant — link straight to it
    if (cat.variants.length === 1) return getVariantHref(cat.slug, cat.variants[0]);
    // Multi-variant — link to the "six" variant as default
    return getVariantHref(cat.slug, 'six');
}

export default function ShowcaseIndexPage() {
    const totalPages = SHOWCASE_CATEGORIES.reduce(
        (sum, c) => sum + Math.max(c.variants.length, 1),
        0,
    );

    return (
        <div className="min-h-screen bg-dark">
            {/* Hero */}
            <div className="relative overflow-hidden border-b-4 border-coral">
                <div className="max-w-6xl mx-auto px-8 py-16">
                    {/* Geometric decorations */}
                    <div className="absolute top-8 right-12 w-16 h-16 border-4 border-coral rotate-12 opacity-20" />
                    <div className="absolute bottom-12 right-32 w-8 h-8 rotate-45 opacity-30 bg-teal" />
                    <div className="absolute top-20 right-48 w-6 h-6 rounded-full opacity-20 bg-yellow" />
                    <div className="absolute top-12 right-80 w-10 h-10 border-4 border-purple opacity-15 rotate-45" />

                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-coral mb-4">
                        Designer Six
                    </p>
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-cream mb-4">
                        Memphis<br />Design System
                    </h1>
                    <p className="text-sm text-cream/40 max-w-md mb-6">
                        The definitive reference for every component, pattern, and rule in the Memphis design language.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/20">
                            {SHOWCASE_CATEGORIES.length} categories
                        </span>
                        <span className="text-cream/10">|</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/20">
                            {totalPages} pages
                        </span>
                    </div>
                </div>

                {/* Bottom accent bar */}
                <div className="flex">
                    <div className="h-1 flex-1 bg-coral" />
                    <div className="h-1 flex-1 bg-teal" />
                    <div className="h-1 flex-1 bg-yellow" />
                    <div className="h-1 flex-1 bg-purple" />
                </div>
            </div>

            {/* Showcase Grid — grouped by section */}
            <div className="max-w-6xl mx-auto px-8 py-12">
                {SECTIONS.map((section, sectionIdx) => (
                    <div key={section.label} className={sectionIdx > 0 ? 'mt-12' : ''}>
                        {/* Section label */}
                        <div className="flex items-center gap-3 mb-6">
                            <span
                                className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
                                style={{
                                    backgroundColor: ACCENT_HEX[ACCENT_CYCLE[sectionIdx % 4]],
                                    color: ['yellow', 'teal'].includes(ACCENT_CYCLE[sectionIdx % 4]) ? '#1A1A2E' : '#FFFFFF',
                                }}
                            >
                                {section.label}
                            </span>
                            <div className="flex-1 h-[2px] bg-cream/10" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {SHOWCASE_CATEGORIES.slice(section.start, section.end).map((cat) => (
                                <div
                                    key={cat.slug}
                                    className="border-4 p-5"
                                    style={{ borderColor: ACCENT_HEX[cat.accent] }}
                                >
                                    {/* Category header — links to primary variant */}
                                    <Link
                                        href={getCategoryHref(cat)}
                                        className="group flex items-center gap-3 mb-3"
                                    >
                                        <div
                                            className="w-8 h-8 border-4 flex items-center justify-center flex-shrink-0"
                                            style={{ borderColor: ACCENT_HEX[cat.accent] }}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${cat.icon} text-xs`}
                                                style={{ color: ACCENT_HEX[cat.accent] }}
                                            />
                                        </div>
                                        <h2
                                            className="text-xs font-black uppercase tracking-wide group-hover:translate-x-1 transition-transform"
                                            style={{ color: ACCENT_HEX[cat.accent] }}
                                        >
                                            {cat.title}
                                        </h2>
                                    </Link>

                                    <p className="text-[11px] text-cream/40 leading-relaxed mb-3">
                                        {cat.description}
                                    </p>

                                    {/* Variant links */}
                                    {cat.variants.length > 1 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {cat.variants.map((v) => (
                                                <Link
                                                    key={v}
                                                    href={getVariantHref(cat.slug, v)}
                                                    className="w-7 h-7 border-4 flex items-center justify-center text-[9px] font-black uppercase text-cream/30 hover:text-cream transition-colors"
                                                    style={{ borderColor: `${ACCENT_HEX[cat.accent]}40` }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.borderColor = ACCENT_HEX[cat.accent];
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT_HEX[cat.accent]}40`;
                                                    }}
                                                >
                                                    {cat.variants.indexOf(v) + 1}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <Link
                                            href={getCategoryHref(cat)}
                                            className="group/link flex items-center gap-2"
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-wide text-cream/20 group-hover/link:text-cream/50 transition-colors">
                                                View
                                            </span>
                                            <i className="fa-solid fa-arrow-right text-[7px] text-cream/20 group-hover/link:text-cream/50 group-hover/link:translate-x-1 transition-all" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom accent bar */}
            <div className="flex">
                <div className="h-2 flex-1 bg-coral" />
                <div className="h-2 flex-1 bg-teal" />
                <div className="h-2 flex-1 bg-yellow" />
                <div className="h-2 flex-1 bg-purple" />
            </div>
        </div>
    );
}
