import { useSyncExternalStore } from 'react';

/** Below Tailwind's `md` breakpoint the app shows one pane at a time. */
const MOBILE_QUERY = '(width < 48rem)';

const mediaQuery = typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY) : null;

function subscribe(onChange: () => void) {
  mediaQuery?.addEventListener('change', onChange);
  return () => mediaQuery?.removeEventListener('change', onChange);
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => mediaQuery?.matches ?? false,
    () => false,
  );
}
