import { Logger } from '@splits-network/shared-logging';

export class ServiceClient {
    constructor(
        private serviceName: string,
        private baseUrl: string,
        private logger: Logger
    ) { }

    private async request<T>(
        method: string,
        path: string,
        data?: any,
        params?: Record<string, any>,
        correlationId?: string,
        customHeaders?: Record<string, string>
    ): Promise<T> {
        const url = new URL(path, this.baseUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }

        this.logger.debug(
            { service: this.serviceName, method, url: url.toString(), correlationId },
            'Calling service'
        );

        const headers: Record<string, string> = {
            ...customHeaders,
        };

        // Only set Content-Type when there's a body
        if (data) {
            headers['Content-Type'] = 'application/json';
        }

        // Propagate correlation ID to downstream services
        if (correlationId) {
            headers['x-correlation-id'] = correlationId;
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (data) {
            // If data is a Buffer (raw body), don't stringify
            options.body = Buffer.isBuffer(data) ? data : JSON.stringify(data);
        }

        try {
            const response = await fetch(url.toString(), options);

            this.logger.debug(
                { service: this.serviceName, status: response.status, correlationId },
                'Service response received'
            );

            if (!response.ok) {
                const errorBody = await response.text().catch(() => 'Unable to read error body');

                // For client errors (4xx), log and attach error info to the error object
                // Gateway will handle passing these through to the client
                if (response.status >= 400 && response.status < 500) {
                    this.logger.warn(
                        {
                            service: this.serviceName,
                            status: response.status,
                            correlationId,
                            error: errorBody,
                        },
                        'Service returned client error'
                    );
                    // Create an error object with the status code and body attached
                    const error: any = new Error(`Service returned ${response.status}: ${errorBody}`);
                    error.statusCode = response.status;
                    error.body = errorBody;
                    // Try to parse error body as JSON for structured errors
                    try {
                        error.jsonBody = JSON.parse(errorBody);
                    } catch {
                        // If not JSON, keep as text in body
                    }
                    throw error;
                }

                // For server errors (5xx), log and throw
                this.logger.error(
                    {
                        service: this.serviceName,
                        status: response.status,
                        correlationId,
                        error: errorBody,
                    },
                    'Service call failed'
                );
                throw new Error(`Service call failed with status ${response.status}: ${errorBody}`);
            }

            // Handle 204 No Content - return empty object
            if (response.status === 204) {
                return {} as T;
            }

            // Check if response has content before parsing JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                // Log raw response text first
                const responseText = await response.text();
                console.log('[ServiceClient] Raw text from', this.serviceName + ':', responseText);

                // Parse the text as JSON
                const jsonData = JSON.parse(responseText) as T;
                console.log('[ServiceClient] Parsed JSON from', this.serviceName + ':', JSON.stringify(jsonData, null, 2));
                return jsonData;
            }

            // For non-JSON responses, return empty object
            console.log('[ServiceClient] Non-JSON response from', this.serviceName, '- returning empty object');
            return {} as T;
        } catch (error: any) {
            this.logger.error(
                {
                    service: this.serviceName,
                    error: error.message,
                    correlationId,
                },
                'Service call failed'
            );
            throw error;
        }
    }

    async get<T>(path: string, params?: Record<string, any>, correlationId?: string, customHeaders?: Record<string, string>): Promise<T> {
        return this.request<T>('GET', path, undefined, params, correlationId, customHeaders);
    }

    async post<T>(path: string, data?: any, correlationId?: string, customHeaders?: Record<string, string>): Promise<T> {
        return this.request<T>('POST', path, data, undefined, correlationId, customHeaders);
    }

    async patch<T>(path: string, data?: any, correlationId?: string, customHeaders?: Record<string, string>): Promise<T> {
        return this.request<T>('PATCH', path, data, undefined, correlationId, customHeaders);
    }

    async delete<T>(path: string, correlationId?: string, customHeaders?: Record<string, string>): Promise<T> {
        return this.request<T>('DELETE', path, undefined, undefined, correlationId, customHeaders);
    }
}

export class ServiceRegistry {
    private clients: Map<string, ServiceClient> = new Map();

    constructor(private logger: Logger) { }

    register(serviceName: string, baseUrl: string): void {
        const client = new ServiceClient(serviceName, baseUrl, this.logger);
        this.clients.set(serviceName, client);
        this.logger.info({ service: serviceName, url: baseUrl }, 'Service registered');
    }

    get(serviceName: string): ServiceClient {
        const client = this.clients.get(serviceName);
        if (!client) {
            throw new Error(`Service ${serviceName} not registered`);
        }
        return client;
    }
}
