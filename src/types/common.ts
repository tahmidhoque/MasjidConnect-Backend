/**
 * Common TypeScript utility types for the application
 */

/**
 * A safer alternative to 'any' when you need to allow unknown data
 * Still provides type safety while allowing for dynamic properties
 */
export type JSONValue = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

/**
 * Use this for type-safe dynamic objects where you can't know all properties at compile time
 * Safer than Record<string, any>
 */
export type DynamicObject = Record<string, JSONValue>;

/**
 * Safely types API response data, better than using 'any'
 */
export type ApiResponse<T = DynamicObject> = {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
};

/**
 * A typed version of Error with additional properties
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
}

/**
 * Type guard to check if an object is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error;
}

/**
 * Session type with commonly accessed properties
 */
export interface Session {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
  expires: string;
  masjidId?: string;
} 