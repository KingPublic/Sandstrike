const INVALID_BASE_PATH = /[?#\\]/u;

export function normalizeBasePath(raw?: string): string {
  const candidate = raw?.trim() ?? "";

  if (candidate === "" || /^\/+$/u.test(candidate)) {
    return "/";
  }

  if (INVALID_BASE_PATH.test(candidate)) {
    throw new Error(`Invalid base path: ${candidate}`);
  }

  const segments = candidate.split("/").filter((segment) => segment.length > 0);

  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error(`Invalid base path: ${candidate}`);
  }

  return `/${segments.join("/")}/`;
}
