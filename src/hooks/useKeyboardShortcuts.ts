import { useEffect } from 'react';

interface ShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
          // Don't trigger if user is typing in an input/textarea
          const target = event.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            continue;
          }

          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Global keyboard shortcuts hook
export function useGlobalShortcuts(onSearchOpen?: () => void) {
  const shortcuts: ShortcutHandler[] = onSearchOpen ? [
    {
      key: 'k',
      metaKey: true,
      handler: onSearchOpen,
      description: 'Open search',
    },
  ] : [];

  useKeyboardShortcuts(shortcuts);
}
