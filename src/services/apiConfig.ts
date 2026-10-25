export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const STORAGE_KEY_API_URL = 'pm_studio_api_base_url';
const STORAGE_KEY_SANDBOX = 'pm_studio_sandbox_mode';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_BASE_URL;
  return localStorage.getItem(STORAGE_KEY_API_URL) || DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const cleanUrl = url.trim().replace(/\/+$/, '');
  localStorage.setItem(STORAGE_KEY_API_URL, cleanUrl);
}

export function isSandboxMode(): boolean {
  if (typeof window === 'undefined') return false;
  const val = localStorage.getItem(STORAGE_KEY_SANDBOX);
  // Default to true if not explicitly set so initial users have a functioning live sandbox immediately if backend is offline,
  // but allow instant toggling to live backend!
  return val === null ? true : val === 'true';
}

export function setSandboxMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SANDBOX, enabled ? 'true' : 'false');
}

export function getFullApiEndpoint(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
