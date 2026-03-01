import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api', '/api/*'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api', '/api/*'],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
            },
            {
                userAgent: 'GPTBot',
                allow: '/',
            },
            {
                userAgent: 'CCBot',
                allow: '/',
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
            },
            {
                userAgent: 'Claude-Web',
                allow: '/',
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api', '/api/*'],
            },
        ],
        sitemap: [
            'https://employment-networks.com/sitemap.xml',
            'https://splits.network/sitemap.xml',
            'https://applicant.network/sitemap.xml',
        ],
    };
}
