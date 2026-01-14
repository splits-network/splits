import type { MetadataRoute } from 'next';

const baseUrl = 'https://applicant.network';

const routes = [
    '',
    '/public/about',
    '/public/contact',
    '/public/cookies',
    '/public/for-recruiters',
    '/public/help',
    '/public/how-it-works',
    '/public/jobs',
    '/public/marketplace',
    '/public/privacy',
    '/public/resources/career-guides',
    '/public/resources/career-guides/switch-careers',
    '/public/resources/career-guides/networking',
    '/public/resources/career-guides/remote-work',
    '/public/resources/career-guides/negotiating-offers',
    '/public/resources/career-guides/first-90-days',
    '/public/resources/career-guides/personal-branding',
    '/public/resources/industry-trends',
    '/public/resources/interview-prep',
    '/public/resources/resume-tips',
    '/public/resources/salary-insights',
    '/public/resources/success-stories',
    '/public/status',
    '/public/terms',
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
