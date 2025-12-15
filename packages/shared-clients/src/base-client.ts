export interface BaseClientConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

/**
 * Base HTTP client for service-to-service communication using fetch
 */
export class BaseClient {
    protected baseURL: string;
    protected timeout: number;
    protected headers: Record<string, string>;

    constructor(config: BaseClientConfig) {
        this.baseURL = config.baseURL;
        this.timeout = config.timeout || 10000;
        this.headers = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
    }

    protected async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...options.headers,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' })) as { message?: string };
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return response.json() as Promise<T>;
        } catch (error: unknown) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    protected async get<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'GET' });
    }

    protected async post<T>(path: string, data?: any): Promise<T> {
        return this.request<T>(path, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    protected async put<T>(path: string, data?: any): Promise<T> {
        return this.request<T>(path, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    protected async patch<T>(path: string, data?: any): Promise<T> {
        return this.request<T>(path, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    protected async delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'DELETE' });
    }
}
