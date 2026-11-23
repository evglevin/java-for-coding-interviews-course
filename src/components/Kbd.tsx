import type { ReactNode } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** The platform's command key. Prerendered pages say "Ctrl" until hydration. */
export const MOD_KEY = isMac ? '⌘' : 'Ctrl';

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border-strong bg-elevated px-1 py-px font-mono text-[10.5px] text-foreground">
      {children}
    </kbd>
  );
}
