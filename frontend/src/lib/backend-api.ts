const DEFAULT_API_BASE_URL = "http://localhost:8080";

export function getBackendApiUrl(path: string): URL {
  return new URL(path, process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL);
}
