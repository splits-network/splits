import { StandardListParams, StandardListResponse } from "@splits-network/shared-types";

export interface DemoApiClient {
    get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<{ data: T }>;
    post<T = any>(endpoint: string, data?: any): Promise<{ data: T }>;
    patch<T = any>(endpoint: string, data?: any): Promise<{ data: T }>;
    delete<T = any>(endpoint: string): Promise<{ data: T }>;
}

/**
 * Demo API client that returns mock data from localStorage
 * Mirrors the real API client interface for seamless switching
 */
export class DemoApiClientImpl implements DemoApiClient {
    private getStorageKey(resource: string): string {
        return `splits-demo-${resource}`;
    }

    private generateId(): string {
        return `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private parseEndpoint(endpoint: string) {
        const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
        const parts = cleanEndpoint.split('/');
        return {
            resource: parts[0],
            id: parts[1] || null,
            action: parts[2] || null
        };
    }

    private getPaginatedData<T>(
        data: T[],
        params: StandardListParams = {}
    ): StandardListResponse<T> {
        let filteredData = [...data];

        // Apply search filter
        if (params.search && typeof params.search === 'string') {
            const searchLower = params.search.toLowerCase();
            filteredData = filteredData.filter((item: any) => {
                // Search across common text fields
                const searchableFields = ['name', 'title', 'email', 'status', 'location'];
                return searchableFields.some(field =>
                    item[field] && String(item[field]).toLowerCase().includes(searchLower)
                );
            });
        }

        // Apply filters
        if (params.filters && typeof params.filters === 'object') {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    filteredData = filteredData.filter((item: any) => {
                        if (Array.isArray(value)) {
                            return value.includes(item[key]);
                        }
                        return item[key] === value;
                    });
                }
            });
        }

        // Apply sorting
        if (params.sort_by) {
            const sortOrder = params.sort_order === 'desc' ? -1 : 1;
            filteredData.sort((a: any, b: any) => {
                const aVal = a[params.sort_by!];
                const bVal = b[params.sort_by!];

                if (aVal < bVal) return -1 * sortOrder;
                if (aVal > bVal) return 1 * sortOrder;
                return 0;
            });
        }

        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            pagination: {
                total: filteredData.length,
                page,
                limit,
                total_pages: Math.ceil(filteredData.length / limit)
            }
        };
    }

    private getStoredData<T>(resource: string): T[] {
        try {
            const stored = localStorage.getItem(this.getStorageKey(resource));
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private setStoredData<T>(resource: string, data: T[]): void {
        localStorage.setItem(this.getStorageKey(resource), JSON.stringify(data));
    }

    async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<{ data: T }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const { resource, id, action } = this.parseEndpoint(endpoint);
        const storedData = this.getStoredData(resource);

        if (id) {
            // Get single item
            const item = storedData.find((item: any) => item.id === id);
            if (!item) {
                throw new Error(`${resource} not found`);
            }
            return { data: item as T };
        } else {
            // List items with pagination
            const params = options?.params as StandardListParams || {};
            const result = this.getPaginatedData(storedData, params);
            return { data: result as T };
        }
    }

    async post<T = any>(endpoint: string, data: any = {}): Promise<{ data: T }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

        const { resource } = this.parseEndpoint(endpoint);
        const storedData = this.getStoredData(resource);

        const newItem = {
            ...data,
            id: this.generateId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        storedData.push(newItem);
        this.setStoredData(resource, storedData);

        return { data: newItem as T };
    }

    async patch<T = any>(endpoint: string, data: any = {}): Promise<{ data: T }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));

        const { resource, id } = this.parseEndpoint(endpoint);
        const storedData = this.getStoredData(resource);

        const itemIndex = storedData.findIndex((item: any) => item.id === id);
        if (itemIndex === -1) {
            throw new Error(`${resource} not found`);
        }

        const updatedItem = {
            ...storedData[itemIndex],
            ...data,
            updated_at: new Date().toISOString(),
        };

        storedData[itemIndex] = updatedItem;
        this.setStoredData(resource, storedData);

        return { data: updatedItem as T };
    }

    async delete<T = any>(endpoint: string): Promise<{ data: T }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const { resource, id } = this.parseEndpoint(endpoint);
        const storedData = this.getStoredData(resource);

        const itemIndex = storedData.findIndex((item: any) => item.id === id);
        if (itemIndex === -1) {
            throw new Error(`${resource} not found`);
        }

        const deletedItem = storedData[itemIndex];
        storedData.splice(itemIndex, 1);
        this.setStoredData(resource, storedData);

        return { data: { message: 'Deleted successfully', item: deletedItem } as T };
    }
}

// Singleton instance
export const demoApiClient = new DemoApiClientImpl();