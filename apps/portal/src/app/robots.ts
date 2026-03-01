import type { MetadataRoute } from 'next';

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
                    '/accept-invitation',
                    '/accept-invitation/*',
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
                    '/accept-invitation',
                    '/accept-invitation/*',
                ],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: ['/blog', '/press', '/updates', '/documentation'],
                disallow: ['/portal', '/sign-in', '/sign-up'],
            },
            {
                userAgent: 'GPTBot',
                allow: ['/blog', '/press', '/updates', '/documentation'],
                disallow: ['/portal', '/sign-in', '/sign-up'],
            },
            {
                userAgent: 'CCBot',
                allow: ['/blog', '/press', '/updates', '/documentation'],
                disallow: ['/portal', '/sign-in', '/sign-up'],
            },
            {
                userAgent: 'anthropic-ai',
                allow: ['/blog', '/press', '/updates', '/documentation'],
                disallow: ['/portal', '/sign-in', '/sign-up'],
            },
            {
                userAgent: 'Claude-Web',
                allow: ['/blog', '/press', '/updates', '/documentation'],
                disallow: ['/portal', '/sign-in', '/sign-up'],
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
                    '/accept-invitation',
                    '/accept-invitation/*',
                ],
            },
        ],
        sitemap: [
            'https://splits.network/sitemap.xml',
            'https://employment-networks.com/sitemap.xml',
            'https://applicant.network/sitemap.xml',
        ],
    };
}
