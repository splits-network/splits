import type { ContentPage, HeaderNavConfig, FooterNavConfig, ContentNavigation } from '@splits-network/shared-types';

const API_BASE =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

const APP_NAME = 'candidate';

interface ContentResponse {
    data: ContentPage;
}

interface ContentListResponse {
    data: ContentPage[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export async function getContentPage(slug: string): Promise<ContentPage | null> {
    try {
        const res = await fetch(
            `${API_BASE}/api/v2/pages/by-slug/${encodeURIComponent(slug)}?app=${APP_NAME}`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;
        const json: ContentResponse = await res.json();
        return json.data;
    } catch {
        return null;
    }
}

export async function getContentPages(
    category?: string,
    limit = 50
): Promise<ContentPage[]> {
    try {
        const params = new URLSearchParams({
            app: APP_NAME,
            status: 'published',
            limit: String(limit),
        });
        if (category) params.set('category', category);

        const res = await fetch(`${API_BASE}/api/v2/pages?${params}`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return [];
        const json: ContentListResponse = await res.json();
        return json.data;
    } catch {
        return [];
    }
}

export async function getHeaderNav(): Promise<HeaderNavConfig | null> {
    try {
        const res = await fetch(
            `${API_BASE}/api/v2/navigation?app=${APP_NAME}&location=header`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;
        const json: { data: ContentNavigation } = await res.json();
        return json.data.config as HeaderNavConfig;
    } catch {
        return null;
    }
}

export async function getFooterNav(): Promise<FooterNavConfig | null> {
    try {
        const res = await fetch(
            `${API_BASE}/api/v2/navigation?app=${APP_NAME}&location=footer`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;
        const json: { data: ContentNavigation } = await res.json();
        return json.data.config as FooterNavConfig;
    } catch {
        return null;
    }
}
