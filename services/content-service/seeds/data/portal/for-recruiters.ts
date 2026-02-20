import type { ContentBlock } from '@splits-network/shared-types';

const blocks: ContentBlock[] = [
    {
        type: 'hero',
        kicker: 'FOR RECRUITERS',
        kickerIcon: 'fa-duotone fa-regular fa-user-tie',
        headlineWords: [
            { text: 'Grow' },
            { text: 'Your' },
            { text: 'Recruiting', accent: true },
            { text: 'Business' },
        ],
        subtitle:
            'Access premium roles from top companies, split fees transparently, and scale your placements with powerful tools.',
        image: '/images/content/recruiter-hero.jpg',
        imageAlt: 'Recruiter reviewing candidate profiles on laptop',
        buttons: [
            { label: 'Join Free', href: '/sign-up', variant: 'primary', icon: 'fa-duotone fa-regular fa-rocket' },
            { label: 'See How It Works', href: '#how-it-works', variant: 'outline' },
        ],
    },
    {
        type: 'stats-bar',
        stats: [
            { value: '3,200+', label: 'Active Recruiters' },
            { value: '$2.4M', label: 'Paid Out Monthly' },
            { value: '500+', label: 'Companies' },
            { value: '40%', label: 'Higher Avg. Fee', borderColor: 'border-accent' },
        ],
        bg: 'neutral',
    },
    {
        type: 'article-body',
        sectionNumber: '01',
        kicker: 'THE OPPORTUNITY',
        kickerColor: 'primary',
        heading: 'A Better Way to Recruit',
        paragraphs: [
            'Traditional recruiting is broken. Independent recruiters struggle to access quality roles, while agencies take a massive cut of every placement fee. The split-fee model changes everything.',
            'On Splits Network, you connect directly with hiring companies. <strong>No middlemen, no hidden fees.</strong> Every commission split is agreed upon upfront and tracked transparently on the platform.',
        ],
        bg: 'base-100',
    },
    {
        type: 'split-editorial',
        sectionNumber: '02',
        kicker: 'MARKETPLACE',
        heading: 'Access Exclusive Roles',
        paragraphs: [
            'Browse hundreds of open roles from verified companies across industries. Filter by specialty, location, fee structure, and more.',
        ],
        items: [
            { icon: 'fa-duotone fa-regular fa-filter', title: 'Smart Filters', body: 'Find roles that match your expertise and candidate pool.' },
            { icon: 'fa-duotone fa-regular fa-bell', title: 'Instant Alerts', body: 'Get notified when new roles match your preferences.' },
            { icon: 'fa-duotone fa-regular fa-shield-check', title: 'Verified Companies', body: 'Every company on the platform is vetted. No ghost jobs.' },
        ],
        image: '/images/content/marketplace.jpg',
        imageAlt: 'Role marketplace interface showing available positions',
        layout: 'text-left',
        bg: 'base-200',
    },
    {
        type: 'pull-quote',
        quote: 'I tripled my placements in the first quarter. The marketplace gives me access to roles I could never find on my own.',
        citation: 'Jennifer Park, Independent Recruiter',
        bg: 'base-100',
        style: 'left-border',
    },
    {
        type: 'feature-grid',
        kicker: 'YOUR TOOLKIT',
        heading: 'Built for Recruiters',
        columns: 3,
        items: [
            { icon: 'fa-duotone fa-regular fa-robot', title: 'AI Matching', description: 'Our AI suggests the best candidates for each role based on skills, experience, and preferences.', stats: '95% accuracy' },
            { icon: 'fa-duotone fa-regular fa-messages', title: 'Direct Messaging', description: 'Chat with hiring managers and candidates in one place. No phone tag required.' },
            { icon: 'fa-duotone fa-regular fa-chart-mixed', title: 'Performance Analytics', description: 'Track your placement rate, earnings, pipeline health, and time-to-fill.' },
            { icon: 'fa-duotone fa-regular fa-table-columns', title: 'Pipeline Management', description: 'Organize candidates across roles with our built-in pipeline tools.' },
            { icon: 'fa-duotone fa-regular fa-file-invoice-dollar', title: 'Automated Payouts', description: 'When a placement is confirmed, your fee is calculated and paid via Stripe.' },
            { icon: 'fa-duotone fa-regular fa-people-group', title: 'Candidate Database', description: 'Build and manage your candidate network across all roles and submissions.' },
        ],
        bg: 'base-200',
    },
    {
        type: 'timeline',
        kicker: 'HOW IT WORKS',
        heading: 'Start Placing in 4 Steps',
        steps: [
            { number: 1, title: 'Create Your Profile', description: 'Sign up free and showcase your recruiting specialties, industries, and track record.', icon: 'fa-duotone fa-regular fa-user-plus' },
            { number: 2, title: 'Browse the Marketplace', description: 'Find roles that match your expertise and candidate network.', icon: 'fa-duotone fa-regular fa-magnifying-glass' },
            { number: 3, title: 'Submit Candidates', description: 'Present your best candidates directly to hiring companies with one-click submissions.', icon: 'fa-duotone fa-regular fa-paper-plane' },
            { number: 4, title: 'Earn Your Split', description: 'Get paid transparently when your candidate is hired. Fees processed automatically.', icon: 'fa-duotone fa-regular fa-money-bill-wave' },
        ],
        bg: 'base-100',
    },
    {
        type: 'faq',
        kicker: 'FAQ',
        heading: 'Recruiter Questions',
        items: [
            { question: 'Is it free to join as a recruiter?', answer: 'Yes! Our Starter plan is completely free. You can browse roles, submit candidates, and earn placement fees at no cost. Premium plans offer additional features like AI matching and priority support.' },
            { question: 'How are fees split?', answer: 'Fee splits are set by the hiring company when they post a role. Typical splits range from 50/50 to 70/30 in favor of the placing recruiter. All terms are visible before you engage.' },
            { question: 'Can I use Splits Network alongside my existing business?', answer: 'Absolutely. Most recruiters use Splits Network as an additional channel alongside their existing client relationships. It\'s incremental revenue, not a replacement.' },
            { question: 'How do payouts work?', answer: 'When a placement is confirmed and the guarantee period passes, your fee is calculated automatically and paid out via Stripe. You can track all pending and completed payouts in your dashboard.' },
        ],
        bg: 'base-200',
    },
    {
        type: 'cta',
        heading: 'Ready to Scale Your Placements?',
        subtitle: 'Join 3,200+ recruiters already earning more on Splits Network.',
        buttons: [
            { label: 'Join Free Today', href: '/sign-up', variant: 'primary', icon: 'fa-duotone fa-regular fa-rocket' },
            { label: 'Contact Sales', href: 'mailto:recruiters@splits.network', variant: 'outline' },
        ],
        contactEmail: 'recruiters@splits.network',
        bg: 'primary',
    },
];

export const portalForRecruiters = {
    slug: 'for-recruiters',
    app: 'portal' as const,
    title: 'For Recruiters | Splits Network',
    description:
        'Join the split-fee recruiting marketplace. Access exclusive roles, earn higher commissions, and grow your recruiting business.',
    category: 'marketing',
    author: 'Splits Network',
    read_time: '4 min read',
    status: 'published' as const,
    published_at: '2026-01-10T00:00:00Z',
    blocks,
};
