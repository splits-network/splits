import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://applicant.network';

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
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
