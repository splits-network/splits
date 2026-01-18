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
            ],
        },
        sitemap: 'https://applicant.network/sitemap.xml',
    };
}
