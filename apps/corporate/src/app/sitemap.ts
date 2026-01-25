import type { MetadataRoute } from 'next';

const baseUrl = 'https://employment-networks.com';

const routes = [
    '',
    '/cookie-policy',
    '/privacy-policy',
    '/status',
    '/terms-of-service',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return routes.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.6,
    }));
}
