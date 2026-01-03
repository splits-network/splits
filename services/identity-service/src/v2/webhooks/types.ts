/**
 * V2 Webhooks Types - Identity Service
 * Types for webhook handling
 */

export interface ClerkWebhookEvent {
    type: string;
    data: {
        id: string;
        email_addresses?: Array<{
            id: string;
            email_address: string;
        }>;
        primary_email_address_id?: string;
        first_name?: string | null;
        last_name?: string | null;
    };
}

export interface WebhookHeaders {
    'svix-id': string;
    'svix-timestamp': string;
    'svix-signature': string;
}

export interface ClerkUserData {
    clerkUserId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
}