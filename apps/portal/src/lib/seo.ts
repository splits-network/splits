export const PORTAL_BASE_URL = "https://splits.network";

export function buildCanonical(path: string) {
    return {
        alternates: {
            canonical: `${PORTAL_BASE_URL}${path}`,
        },
    };
}
