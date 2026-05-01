const DEBUG_STORAGE_KEY = 'personachess_debug_logging';

function readBrowserDebugFlag(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function readProcessDebugFlag(): boolean {
  if (typeof process === 'undefined') {
    return false;
  }

  return process.env.PERSONACHESS_DEBUG === '1';
}

export function isDebugLoggingEnabled(): boolean {
  return readBrowserDebugFlag() || readProcessDebugFlag();
}

export function setDebugLoggingEnabled(enabled: boolean): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  try {
    if (enabled) {
      window.localStorage.setItem(DEBUG_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(DEBUG_STORAGE_KEY);
    }
  } catch {
    // Ignore localStorage failures and keep the app running.
  }
}

export function createDebugLogger(scope: string) {
  return {
    debug: (...args: unknown[]) => {
      if (isDebugLoggingEnabled()) {
        console.log(`[${scope}]`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      console.error(`[${scope}]`, ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(`[${scope}]`, ...args);
    },
  };
}

export function isDevelopmentBuild(): boolean {
  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined') {
    return Boolean(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  }

  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}

