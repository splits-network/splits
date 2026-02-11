export const CORPORATE_BASE_URL = "https://employment-networks.com";

export function buildCanonical(path: string) {
    return {
        alternates: {
            canonical: `${CORPORATE_BASE_URL}${path}`,
        },
    };
}
