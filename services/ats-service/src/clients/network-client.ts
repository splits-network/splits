/**
 * Network Service HTTP Client
 * 
 * Provides methods to interact with the Network Service for recruiter data.
 * This allows ATS Service to resolve Clerk user IDs to recruiter IDs internally,
 * keeping business logic out of the API Gateway.
 */

import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger({ serviceName: 'ats-service-network-client' });

export interface RecruiterProfile {
    id: string;
    user_id: string;
    status: string;
    // ... other fields
}

export class NetworkServiceClient {
    private baseURL: string;

    constructor(baseURL?: string) {
        this.baseURL = baseURL || process.env.NETWORK_SERVICE_URL || 'http://network-service:3003';
    }

    /**
     * Get recruiter profile by Clerk user ID
     * Returns null if user is not a recruiter or recruiter is inactive
     */
    async getRecruiterByClerkUserId(clerkUserId: string, correlationId?: string): Promise<RecruiterProfile | null> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-clerk-user-id': clerkUserId,
            };
            if (correlationId) {
                headers['x-correlation-id'] = correlationId;
            }

            const url = `${this.baseURL}/v2/recruiters?limit=1`;
            
            const response = await fetch(
                url,
                {
                    method: 'GET',
                    headers,
                    signal: AbortSignal.timeout(5000),
                }
            );

            console.log('[NetworkClient] Response status:', response.status);

            // 404 means user is not a recruiter - this is expected
            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json() as { data: { data: RecruiterProfile[] } };
            const recruiters = result.data?.data || result.data || [];
            
            if (recruiters.length === 0) {
                return null;
            }
            
            const recruiter = recruiters[0];
            
            // Return null if recruiter is inactive
            if (recruiter.status !== 'active') {
                return null;
            }

            return recruiter;
        } catch (error: any) {
            console.log('[NetworkClient] Error fetching recruiter:', error.message);
            logger.error({
                err: error,
                url: `/v2/recruiters`,
            }, 'Network service request failed');
            
            // Don't re-throw on 404
            if (error.message?.includes('404')) {
                return null;
            }
            
            throw error;
        }
    }

    /**
     * Get recruiter profile by recruiter ID
     */
    async getRecruiterById(recruiterId: string, correlationId?: string): Promise<RecruiterProfile | null> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (correlationId) {
                headers['x-correlation-id'] = correlationId;
            }

            const response = await fetch(
                `${this.baseURL}/recruiters/${recruiterId}`,
                {
                    method: 'GET',
                    headers,
                    signal: AbortSignal.timeout(5000),
                }
            );

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json() as { data: RecruiterProfile };
            return result.data;
        } catch (error: any) {
            logger.error({
                err: error,
                url: `/recruiters/${recruiterId}`,
            }, 'Network service request failed');
            
            if (error.message?.includes('404')) {
                return null;
            }
            
            throw error;
        }
    }

    /**
     * Create a resource via POST request
     */
    async post<T = any>(path: string, body: any, correlationId?: string): Promise<T> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (correlationId) {
                headers['x-correlation-id'] = correlationId;
            }

            const url = `${this.baseURL}${path}`;
            
            logger.debug({
                url,
                body,
                correlationId,
            }, 'Network service POST request');

            const response = await fetch(
                url,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(5000),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const result = await response.json() as T;
            
            logger.debug({
                url,
                correlationId,
                statusCode: response.status,
            }, 'Network service POST response');

            return result;
        } catch (error: any) {
            logger.error({
                err: error,
                url: `${this.baseURL}${path}`,
                body,
                correlationId,
            }, 'Network service POST request failed');
            
            throw error;
        }
    }
}

/**
 * Singleton instance
 */
let networkClient: NetworkServiceClient | null = null;

export function getNetworkClient(): NetworkServiceClient {
    if (!networkClient) {
        networkClient = new NetworkServiceClient();
    }
    return networkClient;
}
