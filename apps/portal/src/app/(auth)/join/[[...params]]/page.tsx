import JoinPlatformClient from "./JoinPlatformClient";

interface PageProps {
    params: Promise<{ params?: string[] }>;
    searchParams: Promise<{ code?: string; token?: string }>;
}

export default async function JoinPlatformPage({
    params,
    searchParams,
}: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // Get token from URL path or query params
    const pathToken = resolvedParams.params?.[0];
    const queryToken = resolvedSearchParams.token;
    const queryCode = resolvedSearchParams.code;

    // Determine which lookup method to use
    const token = pathToken || queryToken;
    const code = queryCode;

    // Component handles all states: landing page, invitation display, errors
    // No auth required to view - only when user clicks "Accept & Continue"
    return <JoinPlatformClient token={token} code={code} />;
}
