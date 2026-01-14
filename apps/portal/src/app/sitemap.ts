import type { MetadataRoute } from 'next';

const baseUrl = 'https://splits.network';

const routes = [
    '',
    '/public/about',
    '/public/blog',
    '/public/careers',
    '/public/features',
    '/public/how-it-works',
    '/public/integration-partners',
    '/public/partners',
    '/public/press',
    '/public/pricing',
    '/public/status',
    '/public/updates',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return routes.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
    }));
}
