/**
 * Central configuration for the EcoSphere application.
 * Exposes environment variables and provides sensible fallbacks.
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/';

// Normalized base URL without a trailing slash (useful for constructing endpoint paths)
export const BASE_API_URL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
