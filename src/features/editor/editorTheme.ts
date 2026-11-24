/** The editor's look: surfaces, gutters, selection, and the completion popup. Token colors come from CSS. */

import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import type { Theme } from '@/features/preferences/preferences';

const MONO_FONT = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace';

/** 16×16 stroke icons in the spirit of VS Code's codicons, used as CSS masks. */
const COMPLETION_ICON_SVGS: Record<string, string> = {
  method: '<path d="M8 1.6l5.6 3.1v6.6L8 14.4l-5.6-3.1V4.7z"/><path d="M2.6 4.8L8 7.9l5.4-3.1M8 7.9v6.3"/>',
  variable: '<path d="M4 3.5H2.5v9H4M12 3.5h1.5v9H12"/><path d="M5 10l1.6-4h4.4L9.4 10z"/>',
  namespace:
    '<path d="M5.5 2.5c-1.4 0-2 .6-2 2v1.6c0 1-.5 1.9-1.5 1.9 1 0 1.5.9 1.5 1.9v1.6c0 1.4.6 2 2 2M10.5 2.5c1.4 0 2 .6 2 2v1.6c0 1 .5 1.9 1.5 1.9-1 0-1.5.9-1.5 1.9v1.6c0 1.4-.6 2-2 2"/>',
  class: '<path d="M2.5 5.5h4v4h-4zM10.5 2.5h3v3h-3zM10.5 10.5h3v3h-3z"/><path d="M6.5 7.5h2.5M9 4v8M9 4h1.5M9 12h1.5"/>',
  keyword: '<path d="M2 4.5h7M11 4.5h3M2 8h3M7 8h7M2 11.5h12"/>',
  constant: '<rect x="2.5" y="3.5" width="11" height="9" rx="1"/><path d="M5.5 7h5M5.5 9.5h5"/>',
  property: '<path d="M10 2.5a3.5 3.5 0 1 1-1.3 6.8L4 14H2v-2l4.7-4.7A3.5 3.5 0 0 1 10 2.5z"/>',
};

function svgMask(inner: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function completionIconStyles(isDark: boolean) {
  const colors: Record<string, string> = isDark
    ? {
        method: '#b180d7',
        variable: '#75beff',
        namespace: '#c5c5c5',
        class: '#ee9d28',
        keyword: '#c5c5c5',
        constant: '#75beff',
        property: '#75beff',
      }
    : {
        method: '#652d90',
        variable: '#007acc',
        namespace: '#424242',
        class: '#d67e00',
        keyword: '#424242',
        constant: '#007acc',
        property: '#007acc',
      };
  const aliases: Record<string, string[]> = {
    method: ['method', 'function'],
    variable: ['variable'],
    namespace: ['namespace'],
    class: ['class', 'type'],
    keyword: ['keyword', 'text'],
    constant: ['constant', 'enum'],
    property: ['property'],
  };
  const styles: Record<string, Record<string, string>> = {};
  for (const [icon, types] of Object.entries(aliases)) {
    const selector = types.map((t) => `.cm-completionIcon-${t}`).join(', ');
    const mask = svgMask(COMPLETION_ICON_SVGS[icon]);
    styles[selector] = { backgroundColor: colors[icon], maskImage: mask, WebkitMaskImage: mask };
  }
  return styles;
}

export function editorTheme(theme: Theme, fontSize: number): Extension {
  const isDark = theme === 'dark';
  const completionRowHeight = Math.round(fontSize * 1.7);
  return EditorView.theme(
    {
      '&': {
        backgroundColor: isDark ? '#1e1e22' : '#ffffff',
        color: 'var(--java-fg)',
        fontSize: `${fontSize}px`,
      },
      '.cm-content': {
        caretColor: isDark ? '#e4e4e7' : '#18181b',
        padding: '10px 0 24px 0',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: isDark ? '#e4e4e7' : '#18181b',
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: isDark ? 'rgba(77, 142, 255, 0.30)' : 'rgba(7, 102, 255, 0.18)',
      },
      '.cm-gutters': {
        backgroundColor: isDark ? '#1e1e22' : '#fafafa',
        color: isDark ? '#92929e' : '#6b7280',
        borderRight: isDark ? '1px solid #2a2a30' : '1px solid #e5e7eb',
        paddingRight: '4px',
      },
      '.cm-activeLineGutter': {
        backgroundColor: isDark ? '#26262c' : '#f1f5f9',
        color: isDark ? '#c4c4cc' : '#334155',
      },
      '.cm-activeLine': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(7, 102, 255, 0.04)',
      },
      '.cm-foldPlaceholder': {
        backgroundColor: isDark ? '#2e2e36' : '#e5e7eb',
        border: 'none',
        color: isDark ? '#a1a1aa' : '#52525b',
        padding: '0 4px',
        borderRadius: '3px',
      },
      '.cm-matchingBracket': {
        backgroundColor: isDark ? 'rgba(77, 142, 255, 0.25)' : 'rgba(7, 102, 255, 0.18)',
        outline: isDark ? '1px solid rgba(77, 142, 255, 0.6)' : '1px solid rgba(7, 102, 255, 0.5)',
      },
      '.cm-searchMatch': {
        backgroundColor: isDark ? 'rgba(234, 179, 8, 0.22)' : 'rgba(234, 179, 8, 0.28)',
        borderRadius: '2px',
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: isDark ? 'rgba(249, 115, 22, 0.45)' : 'rgba(249, 115, 22, 0.35)',
        outline: isDark ? '1px solid rgba(251, 146, 60, 0.8)' : '1px solid rgba(234, 88, 12, 0.6)',
      },
      '.cm-tooltip': {
        backgroundColor: isDark ? '#25252b' : '#ffffff',
        border: isDark ? '1px solid #3c3c46' : '1px solid #d4d7de',
        borderRadius: '8px',
        boxShadow: isDark ? '0 10px 28px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(15, 23, 42, 0.14)',
        overflow: 'hidden',
        zIndex: '100',
      },
      // The completion popup inherits the `.cm-tooltip` surface, border, radius, and shadow.
      '.cm-tooltip.cm-tooltip-autocomplete > ul': {
        fontFamily: MONO_FONT,
        fontSize: `${fontSize}px`,
        maxHeight: `${completionRowHeight * 12 + 8}px`,
        minWidth: '260px',
        maxWidth: '520px',
        padding: '4px',
      },
      '.cm-tooltip-autocomplete ul li': {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        height: `${completionRowHeight}px`,
        lineHeight: `${completionRowHeight}px`,
        padding: '0 8px',
        borderRadius: '5px',
        color: isDark ? '#e4e4e7' : '#18181b',
      },
      '.cm-tooltip-autocomplete ul li:hover': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
      },
      '.cm-tooltip-autocomplete ul li[aria-selected], .cm-tooltip-autocomplete-disabled ul li[aria-selected]': {
        backgroundColor: isDark ? 'rgba(77, 142, 255, 0.24)' : 'rgba(7, 102, 255, 0.12)',
        color: isDark ? '#ffffff' : '#14161a',
      },
      '.cm-completionLabel': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      '.cm-completionMatchedText': {
        textDecoration: 'none',
        fontWeight: '700',
        color: isDark ? '#6da6ff' : '#0766ff',
      },
      // Like VS Code, only the focused row shows its detail.
      '.cm-completionDetail': {
        display: 'none',
        marginLeft: 'auto',
        paddingLeft: '16px',
        fontStyle: 'normal',
        fontSize: '0.9em',
        whiteSpace: 'nowrap',
        color: isDark ? '#a1a1aa' : '#6b7280',
      },
      'li[aria-selected] .cm-completionDetail': {
        display: 'inline',
      },
      '.cm-completionIcon': {
        flexShrink: '0',
        width: '16px',
        height: '16px',
        padding: '0',
        opacity: '1',
        boxSizing: 'border-box',
        backgroundColor: isDark ? '#c5c5c5' : '#424242',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: '16px 16px',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: '16px 16px',
      },
      '.cm-completionIcon::after': {
        content: 'none',
      },
      ...completionIconStyles(isDark),
      '.cm-tooltip-lint': {
        fontSize: '12px',
      },
      '.cm-tooltip.cm-completionInfo': {
        padding: '8px 10px',
        fontSize: '12px',
        lineHeight: '1.45',
        color: isDark ? '#c4c4cc' : '#374151',
        maxWidth: '300px',
      },
    },
    { dark: isDark },
  );
}
