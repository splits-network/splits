export const CANDIDATE_BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network";

export function buildCanonical(path: string) {
    return {
        alternates: {
            canonical: `${CANDIDATE_BASE_URL}${path}`,
        },
    };
}
