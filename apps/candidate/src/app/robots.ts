import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://applicant.network';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api',
                    '/api/*',
                    '/portal',
                    '/portal/*',
                    '/sign-in',
                    '/sign-up',
                    '/onboarding',
                    '/onboarding/*',
                ],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: [
                    '/api',
                    '/api/*',
                    '/portal',
                    '/portal/*',
                    '/sign-in',
                    '/sign-up',
                    '/onboarding',
                    '/onboarding/*',
                ],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: ['/jobs', '/marketplace', '/resources', '/about', '/how-it-works'],
                disallow: ['/portal', '/sign-in', '/sign-up', '/onboarding'],
            },
            {
                userAgent: 'GPTBot',
                allow: ['/jobs', '/marketplace', '/resources', '/about', '/how-it-works'],
                disallow: ['/portal', '/sign-in', '/sign-up', '/onboarding'],
            },
            {
                userAgent: 'CCBot',
                allow: ['/jobs', '/marketplace', '/resources', '/about', '/how-it-works'],
                disallow: ['/portal', '/sign-in', '/sign-up', '/onboarding'],
            },
            {
                userAgent: 'anthropic-ai',
                allow: ['/jobs', '/marketplace', '/resources', '/about', '/how-it-works'],
                disallow: ['/portal', '/sign-in', '/sign-up', '/onboarding'],
            },
            {
                userAgent: 'Claude-Web',
                allow: ['/jobs', '/marketplace', '/resources', '/about', '/how-it-works'],
                disallow: ['/portal', '/sign-in', '/sign-up', '/onboarding'],
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api',
                    '/api/*',
                    '/portal',
                    '/portal/*',
                    '/sign-in',
                    '/sign-up',
                    '/onboarding',
                    '/onboarding/*',
                ],
            },
        ],
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            'https://splits.network/sitemap.xml',
            'https://employment-networks.com/sitemap.xml',
        ],
    };
}
