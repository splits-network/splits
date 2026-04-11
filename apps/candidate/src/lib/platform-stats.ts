const API_BASE =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export interface PlatformStats {
    active_jobs: number;
    total_recruiters: number;
    active_companies: number;
    cumulative_placements: number;
    as_of: string | null;
}

export async function getPlatformStats(): Promise<PlatformStats | null> {
    try {
        const res = await fetch(
            `${API_BASE}/api/v3/stats/views/platform-summary`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return null;
        const json: { data: PlatformStats } = await res.json();
        return json.data;
    } catch {
        return null;
    }
}
