import type { ContentPage, ContentPageType, ContentTag, HeaderNavConfig, FooterNavConfig, ContentNavigation } from '@splits-network/shared-types';

const API_BASE =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

const APP_NAME = 'corporate';

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
            `${API_BASE}/api/v3/pages/views/by-slug/${encodeURIComponent(slug)}?app=${APP_NAME}`,
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
    page_type?: string,
    limit = 50
): Promise<ContentPage[]> {
    try {
        const params = new URLSearchParams({
            app: APP_NAME,
            status: 'published',
            limit: String(limit),
        });
        if (page_type) params.set('page_type', page_type);

        const res = await fetch(`${API_BASE}/api/v3/pages?${params}`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return [];
        const json: ContentListResponse = await res.json();
        return json.data;
    } catch {
        return [];
    }
}

export interface ContentPageWithTags extends ContentPage {
    tags: ContentTag[];
}

interface TypedListingResponse {
    data: ContentPageWithTags[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export async function getContentPagesByType(
    type: ContentPageType,
    options?: { tag?: string; page?: number; limit?: number }
): Promise<TypedListingResponse> {
    try {
        const params = new URLSearchParams({
            page_type: type,
            app: APP_NAME,
        });
        if (options?.tag) params.set('tag', options.tag);
        if (options?.page) params.set('page', String(options.page));
        if (options?.limit) params.set('limit', String(options.limit));

        const res = await fetch(
            `${API_BASE}/api/v3/public/pages/typed-listing?${params}`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
        return await res.json();
    } catch {
        return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }
}

export async function getContentTags(): Promise<ContentTag[]> {
    try {
        const res = await fetch(
            `${API_BASE}/api/v3/public/content-tags?limit=100`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

export async function getHeaderNav(): Promise<HeaderNavConfig | null> {
    try {
        const res = await fetch(
            `${API_BASE}/api/v3/navigation?app=${APP_NAME}&location=header`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;
        const json: { data: ContentNavigation[] } = await res.json();
        if (!json.data?.length) return null;
        return json.data[0].config as HeaderNavConfig;
    } catch {
        return null;
    }
}

export async function getFooterNav(): Promise<FooterNavConfig | null> {
    try {
        const res = await fetch(
            `${API_BASE}/api/v3/navigation?app=${APP_NAME}&location=footer`,
            { next: { revalidate: 300 } }
        );
        if (!res.ok) return null;
        const json: { data: ContentNavigation[] } = await res.json();
        if (!json.data?.length) return null;
        return json.data[0].config as FooterNavConfig;
    } catch {
        return null;
    }
}
