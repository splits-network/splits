import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface BaseClientConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}

/**
 * Base HTTP client for service-to-service communication
 */
export class BaseClient {
    protected client: AxiosInstance;

    constructor(config: BaseClientConfig) {
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 10000,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
        });
    }

    protected async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get(path, config);
        return response.data;
    }

    protected async post<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post(path, data, config);
        return response.data;
    }

    protected async put<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put(path, data, config);
        return response.data;
    }

    protected async patch<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch(path, data, config);
        return response.data;
    }

    protected async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete(path, config);
        return response.data;
    }
}
