/** A find/replace panel in the app's own style, replacing CodeMirror's default one. */

import type { EditorState } from '@codemirror/state';
import { runScopeHandlers, type EditorView, type Panel, type ViewUpdate } from '@codemirror/view';
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  replaceAll,
  replaceNext,
  search,
  SearchQuery,
  selectMatches,
  setSearchQuery,
} from '@codemirror/search';

/** Lucide icon bodies (24×24, stroked). */
const ICONS = {
  caseSensitive:
    '<path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"/><path d="M22 9v7"/><path d="M3.304 13h6.392"/><circle cx="18.5" cy="12.5" r="3.5"/>',
  wholeWord:
    '<circle cx="7" cy="12" r="3"/><path d="M10 9v6"/><circle cx="17" cy="12" r="3"/><path d="M14 7v8"/><path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"/>',
  regex:
    '<path d="M17 3v10"/><path d="m12.67 5.5 8.66 5"/><path d="m12.67 10.5 8.66-5"/><path d="M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  selectAll: '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>',
  replace:
    '<path d="M14 4a1 1 0 0 1 1-1"/><path d="M15 10a1 1 0 0 1-1-1"/><path d="M21 4a1 1 0 0 0-1-1"/><path d="M21 9a1 1 0 0 1-1 1"/><path d="m3 7 3 3 3-3"/><path d="M6 10V5a2 2 0 0 1 2-2h2"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  replaceAll:
    '<path d="M14 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1"/><path d="M14 4a1 1 0 0 1 1-1"/><path d="M15 10a1 1 0 0 1-1-1"/><path d="M19 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1"/><path d="M21 4a1 1 0 0 0-1-1"/><path d="M21 9a1 1 0 0 1-1 1"/><path d="m3 7 3 3 3-3"/><path d="M6 10V5a2 2 0 0 1 2-2h2"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
} as const;

/** Counting stops here so a one-character query in a huge document stays cheap. */
const MAX_COUNTED_MATCHES = 999;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

function iconButton(label: string, icon: keyof typeof ICONS, className: string, onClick: () => void) {
  const button = el('button', { type: 'button', class: className, 'aria-label': label, title: label });
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[icon]}</svg>`;
  // Keep focus in the text field so typing and Enter keep working after a click.
  button.addEventListener('mousedown', (event) => event.preventDefault());
  button.addEventListener('click', onClick);
  return button;
}

function countMatches(state: EditorState, query: SearchQuery): { total: number; current: number } {
  if (!query.search || !query.valid) return { total: 0, current: 0 };
  const { from, to } = state.selection.main;
  const cursor = query.getCursor(state);
  let total = 0;
  let current = 0;
  for (let next = cursor.next(); !next.done; next = cursor.next()) {
    total++;
    if (next.value.from === from && next.value.to === to) current = total;
    if (total >= MAX_COUNTED_MATCHES) break;
  }
  return { total, current };
}

class SearchPanel implements Panel {
  dom: HTMLElement;
  top = true;
  private query: SearchQuery;
  private searchField: HTMLInputElement;
  private replaceField: HTMLInputElement;
  private toggles: { caseSensitive: HTMLButtonElement; wholeWord: HTMLButtonElement; regexp: HTMLButtonElement };
  private count: HTMLElement;
  private replaceRow: HTMLElement | null = null;
  private expandButton: HTMLButtonElement | null = null;
  private view: EditorView;

  constructor(view: EditorView) {
    this.view = view;
    this.query = getSearchQuery(view.state);
    const commit = () => this.commit();

    this.searchField = el('input', {
      class: 'cm-search-input',
      name: 'search',
      placeholder: 'Find',
      'aria-label': 'Find',
      autocomplete: 'off',
      spellcheck: 'false',
      // openSearchPanel focuses this field when the panel is already open.
      'main-field': 'true',
    });
    this.searchField.value = this.query.search;
    this.searchField.addEventListener('input', commit);

    this.replaceField = el('input', {
      class: 'cm-search-input',
      name: 'replace',
      placeholder: 'Replace',
      'aria-label': 'Replace',
      autocomplete: 'off',
      spellcheck: 'false',
    });
    this.replaceField.value = this.query.replace;
    this.replaceField.addEventListener('input', commit);

    const toggle = (label: string, icon: keyof typeof ICONS) => {
      const button = iconButton(label, icon, 'cm-search-toggle', () => {
        button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
        this.commit();
      });
      return button;
    };
    this.toggles = {
      caseSensitive: toggle('Match case', 'caseSensitive'),
      wholeWord: toggle('Match whole word', 'wholeWord'),
      regexp: toggle('Use regular expression', 'regex'),
    };

    this.count = el('span', { class: 'cm-search-count', 'aria-live': 'polite' });

    const findRow = el('div', { class: 'cm-search-row' }, [
      el('div', { class: 'cm-search-field' }, [
        this.searchField,
        el('div', { class: 'cm-search-toggles' }, [this.toggles.caseSensitive, this.toggles.wholeWord, this.toggles.regexp]),
      ]),
      el('div', { class: 'cm-search-actions' }, [
        iconButton('Previous match (Shift+Enter)', 'arrowUp', 'cm-search-button', () => findPrevious(view)),
        iconButton('Next match (Enter)', 'arrowDown', 'cm-search-button', () => findNext(view)),
        iconButton('Select all matches', 'selectAll', 'cm-search-button', () => selectMatches(view)),
        this.count,
        iconButton('Close (Escape)', 'close', 'cm-search-button cm-search-close', () => closeSearchPanel(view)),
      ]),
    ]);

    const children: HTMLElement[] = [findRow];
    if (!view.state.readOnly) {
      // Replace stays collapsed behind a chevron until asked for, like VS Code.
      this.expandButton = iconButton('Toggle replace', 'chevronRight', 'cm-search-button cm-search-expand', () => {
        const visible = this.expandButton?.getAttribute('aria-expanded') !== 'true';
        this.setReplaceVisible(visible);
        (visible ? this.replaceField : this.searchField).focus();
      });
      this.replaceRow = el('div', { class: 'cm-search-row' }, [
        el('div', { class: 'cm-search-field' }, [this.replaceField]),
        el('div', { class: 'cm-search-actions' }, [
          iconButton('Replace (Enter)', 'replace', 'cm-search-button', () => replaceNext(view)),
          iconButton('Replace all', 'replaceAll', 'cm-search-button', () => replaceAll(view)),
        ]),
      ]);
      children.unshift(this.expandButton);
      children.push(this.replaceRow);
    }

    this.dom = el('div', { class: 'cm-search', role: 'search' }, children);
    this.dom.addEventListener('keydown', (event) => this.keydown(event));
    this.setReplaceVisible(this.query.replace !== '');
    this.syncToggles();
    this.updateCount();
  }

  mount() {
    this.searchField.select();
  }

  update(update: ViewUpdate) {
    let queryChanged = false;
    for (const tr of update.transactions) {
      for (const effect of tr.effects) {
        if (effect.is(setSearchQuery) && !effect.value.eq(this.query)) {
          this.setQuery(effect.value);
          queryChanged = true;
        }
      }
    }
    if (queryChanged || update.docChanged || update.selectionSet) this.updateCount();
  }

  private setReplaceVisible(visible: boolean) {
    if (!this.replaceRow || !this.expandButton) return;
    this.replaceRow.hidden = !visible;
    this.expandButton.setAttribute('aria-expanded', String(visible));
  }

  private commit() {
    const query = new SearchQuery({
      search: this.searchField.value,
      replace: this.replaceField.value,
      caseSensitive: this.toggles.caseSensitive.getAttribute('aria-pressed') === 'true',
      wholeWord: this.toggles.wholeWord.getAttribute('aria-pressed') === 'true',
      regexp: this.toggles.regexp.getAttribute('aria-pressed') === 'true',
    });
    if (query.eq(this.query)) return;
    this.query = query;
    this.view.dispatch({ effects: setSearchQuery.of(query) });
  }

  private setQuery(query: SearchQuery) {
    this.query = query;
    this.searchField.value = query.search;
    this.replaceField.value = query.replace;
    this.syncToggles();
  }

  private syncToggles() {
    this.toggles.caseSensitive.setAttribute('aria-pressed', String(this.query.caseSensitive));
    this.toggles.wholeWord.setAttribute('aria-pressed', String(this.query.wholeWord));
    this.toggles.regexp.setAttribute('aria-pressed', String(this.query.regexp));
  }

  private updateCount() {
    const invalid = this.query.search !== '' && !this.query.valid;
    this.searchField.toggleAttribute('aria-invalid', invalid);
    if (!this.query.search) {
      this.count.textContent = '';
      this.count.removeAttribute('data-empty');
      return;
    }
    if (invalid) {
      this.count.textContent = 'Invalid';
      this.count.setAttribute('data-empty', '');
      return;
    }
    const { total, current } = countMatches(this.view.state, this.query);
    const totalLabel = total >= MAX_COUNTED_MATCHES ? `${MAX_COUNTED_MATCHES}+` : String(total);
    this.count.textContent = total === 0 ? 'No results' : current ? `${current} of ${totalLabel}` : `${totalLabel} found`;
    this.count.toggleAttribute('data-empty', total === 0);
  }

  private keydown(event: KeyboardEvent) {
    if (runScopeHandlers(this.view, event, 'search-panel')) {
      event.preventDefault();
    } else if (event.key === 'Enter' && event.target === this.searchField) {
      event.preventDefault();
      (event.shiftKey ? findPrevious : findNext)(this.view);
    } else if (event.key === 'Enter' && event.target === this.replaceField) {
      event.preventDefault();
      (event.metaKey || event.ctrlKey ? replaceAll : replaceNext)(this.view);
    }
  }
}

export function searchPanel() {
  return search({ top: true, createPanel: (view) => new SearchPanel(view) });
}
