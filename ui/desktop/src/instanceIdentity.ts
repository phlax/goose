import { app } from 'electron';

// ---------------------------------------------------------------------------
// Pure parsing helpers (exported for testing without importing electron)
// ---------------------------------------------------------------------------

// Restrict app_id to a safe subset. Wayland app_id is supposed to follow the
// Desktop Entry Specification (reverse-DNS-ish, lowercase, alnum + . _ -).
// We're permissive enough for common ad-hoc values like "goose-work".
const APP_ID_RE = /^[A-Za-z0-9._-]{1,64}$/;

/**
 * Parse and validate a raw GOOSE_APP_ID value.
 * Returns null when the value is absent, empty/whitespace, or contains
 * characters outside [A-Za-z0-9._-] / exceeds 64 chars. Never throws.
 */
export function parseAppId(raw: string | undefined): string | null {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return null;
  return APP_ID_RE.test(trimmed) ? trimmed : null;
}

// eslint-disable-next-line no-control-regex
const LABEL_STRIP = /[\u0000-\u001F\u007F]/g;

/**
 * Parse and sanitize a raw GOOSE_INSTANCE_LABEL value.
 * Returns null when the value is absent or empty/whitespace. Control
 * characters are stripped and the result is truncated to 64 chars.
 */
export function parseLabel(raw: string | undefined): string | null {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return null;
  const sanitized = trimmed.replace(LABEL_STRIP, '').slice(0, 64);
  return sanitized || null;
}

/**
 * Build the window title string to pass to BrowserWindow's `title:` option.
 * Returns undefined when no label is set, so callers can spread it
 * conditionally and the renderer-supplied document.title continues to win.
 */
export function formatWindowTitle(label: string | null): string | undefined {
  if (!label) return undefined;
  return `Goose — ${label}`;
}

// ---------------------------------------------------------------------------
// Module-level constants — read once at module evaluation. Later mutations to
// process.env have no effect.
// ---------------------------------------------------------------------------

export const instanceAppId: string | null = parseAppId(process.env.GOOSE_APP_ID);
export const instanceLabel: string | null = parseLabel(process.env.GOOSE_INSTANCE_LABEL);

// ---------------------------------------------------------------------------
// Electron-wiring helpers
// ---------------------------------------------------------------------------

/**
 * Apply the app-id override to Electron. Must be called BEFORE the first
 * BrowserWindow is created, ideally before app.whenReady().
 * Safe to call when instanceAppId is null — becomes a no-op.
 */
export function applyInstanceAppId(): void {
  if (!instanceAppId) return;
  // app.setName affects app.getName(), which Chromium uses to derive
  // the Wayland xdg_toplevel app_id on Ozone/Wayland.
  app.setName(instanceAppId);
  // Windows: distinct AppUserModelID so the taskbar treats each instance
  // as a separate app. Harmless on other platforms.
  try {
    app.setAppUserModelId(instanceAppId);
  } catch {
    // setAppUserModelId throws on non-Windows in some Electron versions; ignore.
  }
}

/**
 * Return the title that should be passed to BrowserWindow's `title:` option.
 * Returns undefined when no label is set, so callers can spread it
 * conditionally and the renderer-supplied document.title continues to win.
 */
export function instanceWindowTitle(): string | undefined {
  return formatWindowTitle(instanceLabel);
}
