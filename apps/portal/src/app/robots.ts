import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
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
        sitemap: 'https://splits.network/sitemap.xml',
    };
}
