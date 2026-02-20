import type { HeaderNavConfig } from '@splits-network/shared-types';

export const corporateHeaderNav = {
    app: 'corporate' as const,
    location: 'header' as const,
    config: {
        items: [
            { label: 'For Recruiters', href: '#for-recruiters' },
            { label: 'For Candidates', href: '#for-candidates' },
            { label: 'For Companies', href: '#for-companies' },
            { label: 'Contact', href: '/contact' },
        ],
    } satisfies HeaderNavConfig,
};
