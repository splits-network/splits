/**
 * Resolve the API gateway base URL for client-side fetches.
 *
 * In local dev the frontend (e.g. localhost:3100) runs on a different port
 * than the API gateway (localhost:3000).  NEXT_PUBLIC_API_URL gives us the
 * gateway origin so we can build absolute URLs.
 *
 * In production the ingress routes /api/* to the gateway, so a relative URL
 * would also work – but using the full URL is safe everywhere.
 */
export function getGatewayBaseUrl(): string {
    if (typeof window !== "undefined") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
            // Strip trailing slashes and any /api suffix to get the bare origin
            return apiUrl.replace(/\/+$/, "").replace(/\/api(?:\/v[0-9]+)?$/, "");
        }
    }
    return "";
}
