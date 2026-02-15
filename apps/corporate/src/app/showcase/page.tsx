'use client';

import Link from 'next/link';
import { ACCENT_HEX } from '@splits-network/memphis-ui';

type AccentKey = 'coral' | 'teal' | 'yellow' | 'purple';
const ACCENT_CYCLE: AccentKey[] = ['coral', 'teal', 'yellow', 'purple'];

// ─── Designer Six: Domain Pages ────────────────────────────────────────────
// These are the primary showcase pages — full list views for each portal section

interface DomainPage {
    title: string;
    slug: string;
    description: string;
    icon: string;
    accent: AccentKey;
    href: string;
}

const DOMAIN_PAGES: DomainPage[] = [
    {
        title: 'Roles',
        slug: 'lists',
        description: 'Job listings with table, grid, and browse views',
        icon: 'fa-briefcase',
        accent: 'teal',
        href: '/showcase/lists/six',
    },
    {
        title: 'Applications',
        slug: 'applications',
        description: 'Candidate-role pipeline with match scores and stages',
        icon: 'fa-file-lines',
        accent: 'coral',
        href: '/showcase/applications',
    },
    {
        title: 'Candidates',
        slug: 'candidates',
        description: 'Talent pool with availability, skills, and salary data',
        icon: 'fa-users',
        accent: 'yellow',
        href: '/showcase/candidates',
    },
    {
        title: 'Recruiters',
        slug: 'recruiters',
        description: 'Marketplace for finding split-fee partners',
        icon: 'fa-user-tie',
        accent: 'purple',
        href: '/showcase/recruiters',
    },
    {
        title: 'Placements',
        slug: 'placements',
        description: 'Filled roles with fees, guarantees, and invoices',
        icon: 'fa-handshake',
        accent: 'coral',
        href: '/showcase/placements',
    },
    {
        title: 'Billing',
        slug: 'billing',
        description: 'Invoices, payments, subscriptions, and revenue',
        icon: 'fa-receipt',
        accent: 'teal',
        href: '/showcase/billing',
    },
    {
        title: 'Company',
        slug: 'company',
        description: 'Company settings, details, billing, and team management',
        icon: 'fa-building',
        accent: 'yellow',
        href: '/showcase/company',
    },
    {
        title: 'Integrations',
        slug: 'integrations',
        description: 'Third-party system connections and sync status',
        icon: 'fa-puzzle-piece',
        accent: 'purple',
        href: '/showcase/integrations',
    },
    {
        title: 'Candidate Invitations',
        slug: 'candidate-invitations',
        description: 'Recruiter invitations sent to candidates',
        icon: 'fa-envelope-open-text',
        accent: 'coral',
        href: '/showcase/candidate-invitations',
    },
    {
        title: 'Company Invitations',
        slug: 'company-invitations',
        description: 'Recruiter invitations sent to companies',
        icon: 'fa-paper-plane',
        accent: 'teal',
        href: '/showcase/company-invitations',
    },
    {
        title: 'Recruiter Teams',
        slug: 'recruiter-teams',
        description: 'Recruiter team structure and performance',
        icon: 'fa-people-group',
        accent: 'yellow',
        href: '/showcase/recruiter-teams',
    },
    {
        title: 'Company Teams',
        slug: 'company-teams',
        description: 'Company hiring team management',
        icon: 'fa-sitemap',
        accent: 'purple',
        href: '/showcase/company-teams',
    },
    {
        title: 'Referral Codes',
        slug: 'referral-codes',
        description: 'Referral code management and tracking',
        icon: 'fa-ticket',
        accent: 'coral',
        href: '/showcase/referral-codes',
    },
];

// ─── Designer Six: UI Components ───────────────────────────────────────────
// These are the component pattern showcase pages (the "six" variant)

interface UIComponentPage {
    title: string;
    slug: string;
    description: string;
    icon: string;
    accent: AccentKey;
    href: string;
}

const UI_COMPONENT_SECTIONS: { label: string; pages: UIComponentPage[] }[] = [
    {
        label: 'Layout & Navigation',
        pages: [
            { title: 'Headers', slug: 'headers', description: 'Navigation bars, mega menus, mobile', icon: 'fa-browser', accent: 'coral', href: '/showcase/headers/six' },
            { title: 'Footers', slug: 'footers', description: 'Site footers, link columns, newsletters', icon: 'fa-rectangle-wide', accent: 'teal', href: '/showcase/footers/six' },
            { title: 'Menus', slug: 'menus', description: 'Dropdowns, filters, search bars', icon: 'fa-bars-staggered', accent: 'yellow', href: '/showcase/menus/six' },
            { title: 'Tabs', slug: 'tabs', description: 'Tabbed interfaces, segmented controls', icon: 'fa-window-restore', accent: 'purple', href: '/showcase/tabs/six' },
        ],
    },
    {
        label: 'Data Display',
        pages: [
            { title: 'Dashboards', slug: 'dashboards', description: 'Analytics, KPIs, chart grids', icon: 'fa-gauge-high', accent: 'coral', href: '/showcase/dashboards/six' },
            { title: 'Tables', slug: 'tables', description: 'Data tables, sortable columns', icon: 'fa-table', accent: 'yellow', href: '/showcase/tables/six' },
            { title: 'Cards', slug: 'cards', description: 'Card grids, stat cards, feature cards', icon: 'fa-cards-blank', accent: 'purple', href: '/showcase/cards/six' },
            { title: 'Details', slug: 'details', description: 'Single-record views, entity profiles', icon: 'fa-file-lines', accent: 'coral', href: '/showcase/details/six' },
            { title: 'Profiles', slug: 'profiles', description: 'User profiles, avatar layouts', icon: 'fa-user', accent: 'teal', href: '/showcase/profiles/six' },
        ],
    },
    {
        label: 'Forms & Input',
        pages: [
            { title: 'Forms', slug: 'forms', description: 'Input forms, wizards, validation', icon: 'fa-input-text', accent: 'yellow', href: '/showcase/forms/six' },
            { title: 'Buttons', slug: 'buttons', description: 'Variants, sizes, states, groups', icon: 'fa-hand-pointer', accent: 'purple', href: '/showcase/buttons/six' },
            { title: 'Search', slug: 'search', description: 'Search results, autocomplete', icon: 'fa-magnifying-glass', accent: 'coral', href: '/showcase/search/six' },
            { title: 'Modals', slug: 'modals', description: 'Dialogs, confirmations, drawers', icon: 'fa-window-maximize', accent: 'teal', href: '/showcase/modals/six' },
        ],
    },
    {
        label: 'Content',
        pages: [
            { title: 'Landing Pages', slug: 'landing', description: 'Hero sections, CTAs, marketing', icon: 'fa-rocket-launch', accent: 'yellow', href: '/showcase/landing/six' },
            { title: 'Articles', slug: 'articles', description: 'Blog posts, long-form content', icon: 'fa-newspaper', accent: 'purple', href: '/showcase/articles/six' },
            { title: 'Pricing', slug: 'pricing', description: 'Pricing tables, plan comparisons', icon: 'fa-tags', accent: 'coral', href: '/showcase/pricing/six' },
            { title: 'Testimonials', slug: 'testimonials', description: 'Reviews, social proof, ratings', icon: 'fa-quote-right', accent: 'teal', href: '/showcase/testimonials/six' },
            { title: 'FAQs', slug: 'faqs', description: 'Accordion FAQs, knowledge base', icon: 'fa-circle-question', accent: 'yellow', href: '/showcase/faqs/six' },
        ],
    },
    {
        label: 'Communication',
        pages: [
            { title: 'Messages', slug: 'messages', description: 'Chat interfaces, threads', icon: 'fa-comments', accent: 'purple', href: '/showcase/messages/six' },
            { title: 'Notifications', slug: 'notifications', description: 'Notification feeds, alerts', icon: 'fa-bell', accent: 'coral', href: '/showcase/notifications/six' },
            { title: 'Notifications UI', slug: 'notifications-ui', description: 'Badges, indicators, dots', icon: 'fa-bell-on', accent: 'teal', href: '/showcase/notifications-ui/six' },
        ],
    },
    {
        label: 'Flows & States',
        pages: [
            { title: 'Auth', slug: 'auth', description: 'Login, signup, verification', icon: 'fa-lock', accent: 'yellow', href: '/showcase/auth/six' },
            { title: 'Onboarding', slug: 'onboarding', description: 'Welcome flows, setup wizards', icon: 'fa-flag-checkered', accent: 'purple', href: '/showcase/onboarding/six' },
            { title: 'Empty States', slug: 'empty', description: 'Zero-data views, placeholders', icon: 'fa-ghost', accent: 'coral', href: '/showcase/empty/six' },
            { title: 'Settings', slug: 'settings', description: 'Preference panels, toggles', icon: 'fa-gear', accent: 'teal', href: '/showcase/settings/six' },
        ],
    },
    {
        label: 'Timeline & Calendar',
        pages: [
            { title: 'Timelines', slug: 'timelines', description: 'Activity feeds, history views', icon: 'fa-timeline', accent: 'yellow', href: '/showcase/timelines/six' },
            { title: 'Calendars', slug: 'calendars', description: 'Calendar views, scheduling', icon: 'fa-calendar', accent: 'purple', href: '/showcase/calendars/six' },
        ],
    },
    {
        label: 'Typography',
        pages: [
            { title: 'Typography', slug: 'typography-six', description: 'Headlines, body, labels, colors', icon: 'fa-font-case', accent: 'coral', href: '/showcase/typography-six' },
        ],
    },
];

// ─── Archived: Variant 1-10 (excluding 6) ─────────────────────────────────

const VARIANT_NAMES = ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine', 'ten'] as const;

interface ArchivedCategory {
    title: string;
    slug: string;
    icon: string;
    variants: string[];
    accent: AccentKey;
}

const ARCHIVED_CATEGORIES: ArchivedCategory[] = [
    { title: 'Headers', slug: 'headers', icon: 'fa-browser', variants: [...VARIANT_NAMES], accent: 'coral' },
    { title: 'Footers', slug: 'footers', icon: 'fa-rectangle-wide', variants: [...VARIANT_NAMES], accent: 'teal' },
    { title: 'Dashboards', slug: 'dashboards', icon: 'fa-gauge-high', variants: [...VARIANT_NAMES], accent: 'coral' },
    { title: 'Lists', slug: 'lists', icon: 'fa-list', variants: [...VARIANT_NAMES], accent: 'teal' },
    { title: 'Tables', slug: 'tables', icon: 'fa-table', variants: ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine'], accent: 'yellow' },
    { title: 'Cards', slug: 'cards', icon: 'fa-cards-blank', variants: [...VARIANT_NAMES], accent: 'purple' },
    { title: 'Details', slug: 'details', icon: 'fa-file-lines', variants: [...VARIANT_NAMES], accent: 'coral' },
    { title: 'Profiles', slug: 'profiles', icon: 'fa-user', variants: ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine'], accent: 'teal' },
    { title: 'Forms', slug: 'forms', icon: 'fa-input-text', variants: [...VARIANT_NAMES], accent: 'yellow' },
    { title: 'Search', slug: 'search', icon: 'fa-magnifying-glass', variants: [...VARIANT_NAMES], accent: 'coral' },
    { title: 'Modals', slug: 'modals', icon: 'fa-window-maximize', variants: [...VARIANT_NAMES], accent: 'teal' },
    { title: 'Landing Pages', slug: 'landing', icon: 'fa-rocket-launch', variants: [...VARIANT_NAMES], accent: 'yellow' },
    { title: 'Articles', slug: 'articles', icon: 'fa-newspaper', variants: [...VARIANT_NAMES], accent: 'purple' },
    { title: 'Pricing', slug: 'pricing', icon: 'fa-tags', variants: ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine'], accent: 'coral' },
    { title: 'Messages', slug: 'messages', icon: 'fa-comments', variants: [...VARIANT_NAMES], accent: 'purple' },
    { title: 'Notifications', slug: 'notifications', icon: 'fa-bell', variants: ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine'], accent: 'coral' },
    { title: 'Auth', slug: 'auth', icon: 'fa-lock', variants: ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine'], accent: 'yellow' },
    { title: 'Onboarding', slug: 'onboarding', icon: 'fa-flag-checkered', variants: ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine'], accent: 'purple' },
    { title: 'Empty States', slug: 'empty', icon: 'fa-ghost', variants: [...VARIANT_NAMES], accent: 'coral' },
    { title: 'Settings', slug: 'settings', icon: 'fa-gear', variants: ['one', 'two', 'three', 'four', 'five', 'seven', 'eight', 'nine'], accent: 'teal' },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ShowcaseIndexPage() {
    const domainCount = DOMAIN_PAGES.length;
    const uiCount = UI_COMPONENT_SECTIONS.reduce((sum, s) => sum + s.pages.length, 0);
    const archivedCount = ARCHIVED_CATEGORIES.reduce((sum, c) => sum + c.variants.length, 0);

    return (
        <div className="min-h-screen bg-dark">
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
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
                            {domainCount} domain pages
                        </span>
                        <span className="text-cream/10">|</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/20">
                            {uiCount} UI components
                        </span>
                        <span className="text-cream/10">|</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/20">
                            {archivedCount} archived
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

            <div className="max-w-6xl mx-auto px-8 py-12">
                {/* ══════════════════════════════════════════════════════════════
                    DOMAIN PAGES — Primary showcase for portal sections
                   ══════════════════════════════════════════════════════════════ */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] bg-coral text-cream">
                            Domain Pages
                        </span>
                        <div className="flex-1 h-[2px] bg-cream/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/20">
                            Portal Section Showcases
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {DOMAIN_PAGES.map((page) => (
                            <Link
                                key={page.slug}
                                href={page.href}
                                className="group border-4 p-5 transition-transform hover:-translate-y-1"
                                style={{ borderColor: ACCENT_HEX[page.accent] }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: ACCENT_HEX[page.accent] }}
                                    >
                                        <i
                                            className={`fa-duotone fa-regular ${page.icon} text-sm`}
                                            style={{ color: page.accent === 'yellow' ? '#1A1A2E' : '#FFFFFF' }}
                                        />
                                    </div>
                                    <h2
                                        className="text-sm font-black uppercase tracking-wide group-hover:translate-x-1 transition-transform"
                                        style={{ color: ACCENT_HEX[page.accent] }}
                                    >
                                        {page.title}
                                    </h2>
                                </div>
                                <p className="text-[11px] text-cream/40 leading-relaxed mb-3">
                                    {page.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-wide text-cream/20 group-hover:text-cream/50 transition-colors">
                                        Open
                                    </span>
                                    <i className="fa-solid fa-arrow-right text-[7px] text-cream/20 group-hover:text-cream/50 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    UI COMPONENTS — Component pattern showcases
                   ══════════════════════════════════════════════════════════════ */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] bg-teal text-dark">
                            UI Components
                        </span>
                        <div className="flex-1 h-[2px] bg-cream/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/20">
                            Designer Six Patterns
                        </span>
                    </div>

                    {UI_COMPONENT_SECTIONS.map((section, sectionIdx) => (
                        <div key={section.label} className={sectionIdx > 0 ? 'mt-8' : ''}>
                            <div className="flex items-center gap-3 mb-4">
                                <span
                                    className="px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] border-2"
                                    style={{
                                        borderColor: ACCENT_HEX[ACCENT_CYCLE[sectionIdx % 4]],
                                        color: ACCENT_HEX[ACCENT_CYCLE[sectionIdx % 4]],
                                    }}
                                >
                                    {section.label}
                                </span>
                                <div className="flex-1 h-px bg-cream/5" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {section.pages.map((page) => (
                                    <Link
                                        key={page.slug}
                                        href={page.href}
                                        className="group border-2 p-3 transition-transform hover:-translate-y-0.5"
                                        style={{ borderColor: `${ACCENT_HEX[page.accent]}40` }}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <i
                                                className={`fa-duotone fa-regular ${page.icon} text-xs`}
                                                style={{ color: ACCENT_HEX[page.accent] }}
                                            />
                                            <span
                                                className="text-[11px] font-black uppercase tracking-wide group-hover:translate-x-0.5 transition-transform"
                                                style={{ color: ACCENT_HEX[page.accent] }}
                                            >
                                                {page.title}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-cream/30 leading-relaxed">
                                            {page.description}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    ARCHIVED — Variants 1-10 (excluding 6)
                   ══════════════════════════════════════════════════════════════ */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] bg-cream/10 text-cream/30">
                            Archived
                        </span>
                        <div className="flex-1 h-[2px] bg-cream/5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/15">
                            Variants 1-10 (excluding Designer Six)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {ARCHIVED_CATEGORIES.map((cat) => (
                            <div
                                key={cat.slug}
                                className="border-2 p-4"
                                style={{ borderColor: `${ACCENT_HEX[cat.accent]}20` }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <i
                                        className={`fa-duotone fa-regular ${cat.icon} text-xs`}
                                        style={{ color: `${ACCENT_HEX[cat.accent]}60` }}
                                    />
                                    <span
                                        className="text-[11px] font-black uppercase tracking-wide"
                                        style={{ color: `${ACCENT_HEX[cat.accent]}60` }}
                                    >
                                        {cat.title}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {cat.variants.map((v, i) => {
                                        const num = ['one','two','three','four','five','seven','eight','nine','ten'].indexOf(v);
                                        const display = num < 5 ? num + 1 : num + 2; // skip 6
                                        return (
                                            <Link
                                                key={v}
                                                href={`/showcase/${cat.slug}/${v}`}
                                                className="w-6 h-6 border-2 flex items-center justify-center text-[8px] font-bold text-cream/20 hover:text-cream/60 transition-colors"
                                                style={{ borderColor: `${ACCENT_HEX[cat.accent]}15` }}
                                            >
                                                {display}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom accent bar */}
            <div className="flex mt-12">
                <div className="h-2 flex-1 bg-coral" />
                <div className="h-2 flex-1 bg-teal" />
                <div className="h-2 flex-1 bg-yellow" />
                <div className="h-2 flex-1 bg-purple" />
            </div>
        </div>
    );
}
