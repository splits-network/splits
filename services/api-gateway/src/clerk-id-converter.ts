import { ServiceClient } from './clients';

/**
 * Clerk ID to UUID Converter
 * 
 * Converts Clerk user IDs (format: "user_XXXXXXXXXX") to internal UUIDs
 * by querying the identity service.
 * 
 * After authentication realignment, frontend sends Clerk IDs but backend
 * services expect internal UUIDs in their database columns.
 */

/**
 * Check if a string is a Clerk user ID
 */
export function isClerkUserId(value: any): boolean {
    return typeof value === 'string' && value.startsWith('user_');
}

/**
 * Convert a single Clerk user ID to internal UUID
 * Returns the original value if it's not a Clerk ID
 */
export async function convertClerkIdToUuid(
    identityService: ServiceClient,
    clerkUserId: string,
    correlationId?: string
): Promise<string> {
    if (!isClerkUserId(clerkUserId)) {
        return clerkUserId;
    }

    try {
        const response: any = await identityService.get(
            `/users/by-clerk-id/${clerkUserId}`,
            undefined,
            correlationId
        );
        return response.data.id;
    } catch (error) {
        throw new Error(`Failed to convert Clerk ID ${clerkUserId} to UUID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Convert Clerk user IDs in request body to internal UUIDs
 * 
 * This function recursively processes the request body and converts
 * any Clerk user IDs found in the specified fields to internal UUIDs.
 * 
 * @param body - The request body to process
 * @param fieldsToConvert - Array of field names that may contain Clerk user IDs
 * @param identityService - The identity service client for lookups
 * @param correlationId - Optional correlation ID for tracing
 * @returns The body with converted UUIDs
 */
export async function convertClerkIdsInBody(
    body: any,
    fieldsToConvert: string[],
    identityService: ServiceClient,
    correlationId?: string
): Promise<any> {
    if (!body || typeof body !== 'object') {
        return body;
    }

    const converted = { ...body };

    for (const field of fieldsToConvert) {
        if (field in converted && isClerkUserId(converted[field])) {
            converted[field] = await convertClerkIdToUuid(
                identityService,
                converted[field],
                correlationId
            );
        }
    }

    return converted;
}
