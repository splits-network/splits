import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api',
                '/api/*',
            ],
        },
        sitemap: 'https://employment-networks.com/sitemap.xml',
    };
}
