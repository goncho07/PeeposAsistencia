/**
 * Common API response types matching Laravel Controller base class.
 * All API responses follow this structure.
 */

/**
 * Standard API response wrapper.
 * Used by success(), created() methods in Laravel Controller.
 */
export interface ApiResponse<T> {
    message: string;
    data: T;
}

/**
 * Error response structure.
 * Used by error() method in Laravel Controller.
 */
export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]> | unknown;
}

/**
 * Paginated response structure.
 * Used by Laravel's paginate() method.
 */
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

/**
 * Query parameters for list endpoints.
 */
export interface ListParams {
    search?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

/**
 * Expand parameter for including related data.
 * Example: ?expand=parents,classroom
 */
export type ExpandParam<T extends string> = T | T[];

/**
 * Helper to build query string from params object.
 */
export function buildQueryParams<T extends object>(params: T): URLSearchParams {
    const searchParams = new URLSearchParams();

    (Object.entries(params) as [string, unknown][]).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;

        if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
        } else {
            searchParams.append(key, String(value));
        }
    });

    return searchParams;
}
