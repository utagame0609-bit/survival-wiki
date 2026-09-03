export type AppTheme = 'current' | 'sfc';

const STORAGE_KEY = 'survival-wiki:theme';
const THEME_CHANGE_EVENT = 'survival-wiki:theme-change';

function isAppTheme(value: string | null): value is AppTheme {
  return value === 'current' || value === 'sfc';
}

export function getAppTheme(): AppTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isAppTheme(stored) ? stored : 'current';
  } catch {
    return 'current';
  }
}

function applyThemeAttribute(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
}

export function initializeAppTheme(): AppTheme {
  const theme = getAppTheme();
  applyThemeAttribute(theme);
  return theme;
}

export function setAppTheme(theme: AppTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable; keep the active theme for this session.
  }

  applyThemeAttribute(theme);
  window.dispatchEvent(new CustomEvent<AppTheme>(THEME_CHANGE_EVENT, { detail: theme }));
}

export function subscribeAppTheme(callback: (theme: AppTheme) => void) {
  const handler = (event: Event) => {
    callback((event as CustomEvent<AppTheme>).detail);
  };

  window.addEventListener(THEME_CHANGE_EVENT, handler);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
}
