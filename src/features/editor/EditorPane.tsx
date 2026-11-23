import { useState } from 'react';
import { AlertCircle, Loader2, Maximize2, Minimize2, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FONT_SIZE_MAX, FONT_SIZE_MIN, type Theme } from '@/features/preferences/preferences';
import type { SolutionTab } from '@/features/progress/progress';
import type { CompileDiagnostic, RuntimeStatus } from '@/runtime/types';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';
import { MAX_TABS } from './useSolutionTabs';

interface EditorPaneProps {
  tabs: SolutionTab[];
  activeTab: SolutionTab;
  documentKey: string;
  diagnostics: { documentKey: string; items: CompileDiagnostic[] } | null;
  theme: Theme;
  fontSize: number;
  runtimeStatus: RuntimeStatus;
  expanded: boolean;
  /** False on phones, where the editor already fills the screen. */
  canExpand: boolean;
  handleRef: React.RefObject<CodeEditorHandle | null>;
  onSelectTab(id: string): void;
  onAddTab(): void;
  onCloseTab(id: string): void;
  onChange(code: string): void;
  onReset(): void;
  onRun(): void;
  onSubmit(): void;
  onFontSize(size: number): void;
  onToggleExpand(): void;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" onClick={onClick} aria-label={label} className="text-muted-foreground">
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Shown only while the compiler loads, or when it can't. */
function RuntimeIndicator({ status }: { status: RuntimeStatus }) {
  if (status.state === 'loading') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin text-amber-400" /> Loading Java compiler…
      </span>
    );
  }
  if (status.state === 'error' || status.state === 'unsupported') {
    return (
      <span className="flex min-w-0 items-center gap-1.5 text-xs text-danger" title={status.message}>
        <AlertCircle className="size-3.5 shrink-0" />
        <span className="truncate">{status.state === 'unsupported' ? 'Browser not supported' : 'Compiler failed to load'}</span>
      </span>
    );
  }
  return null;
}

export function EditorPane(props: EditorPaneProps) {
  const { tabs, activeTab, fontSize, expanded, canExpand, runtimeStatus } = props;
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const showStatus =
    runtimeStatus.state === 'loading' || runtimeStatus.state === 'error' || runtimeStatus.state === 'unsupported';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-card px-2 py-1.5 md:px-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 text-xs font-semibold text-foreground">Java 21</span>
          {showStatus && (
            <>
              <span className="h-3.5 w-px shrink-0 bg-border" />
              <RuntimeIndicator status={runtimeStatus} />
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="mr-1 flex items-center rounded border px-0.5">
            <IconButton label="Decrease font size" onClick={() => props.onFontSize(Math.max(FONT_SIZE_MIN, fontSize - 1))}>
              <Minus />
            </IconButton>
            <span className="min-w-6 text-center font-mono text-[11px] text-prose">{fontSize}</span>
            <IconButton label="Increase font size" onClick={() => props.onFontSize(Math.min(FONT_SIZE_MAX, fontSize + 1))}>
              <Plus />
            </IconButton>
          </div>
          <IconButton label="Reset to the starter code" onClick={props.onReset}>
            <RotateCcw />
          </IconButton>
          {canExpand && (
            <IconButton label={expanded ? 'Restore split view' : 'Maximize editor'} onClick={props.onToggleExpand}>
              {expanded ? <Minimize2 /> : <Maximize2 />}
            </IconButton>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-card px-2 py-1">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto" role="tablist" aria-label="Solutions">
          {tabs.map((tab) => {
            const active = tab.id === activeTab.id;
            return (
              <div
                key={tab.id}
                className={cn(
                  'group flex shrink-0 items-center rounded-md text-xs font-medium transition-colors',
                  active ? 'bg-elevated text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-prose',
                )}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => props.onSelectTab(tab.id)}
                  className={cn('py-1 pl-2.5', tabs.length > 1 ? 'pr-1' : 'pr-2.5')}
                >
                  {tab.name}
                </button>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => props.onCloseTab(tab.id)}
                    className="mr-1 rounded p-0.5 opacity-60 hover:bg-accent hover:opacity-100"
                    aria-label={`Close ${tab.name}`}
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
          {tabs.length < MAX_TABS && (
            <IconButton label="New solution tab" onClick={props.onAddTab}>
              <Plus />
            </IconButton>
          )}
        </div>
        <div className="hidden shrink-0 pr-2 font-mono text-[11px] text-muted-foreground sm:block">
          Ln {cursor.line}, Col {cursor.column}
        </div>
      </div>

      <CodeEditor
        documentKey={props.documentKey}
        initialCode={activeTab.code}
        theme={props.theme}
        fontSize={fontSize}
        diagnostics={props.diagnostics}
        onChange={props.onChange}
        onRun={props.onRun}
        onSubmit={props.onSubmit}
        onCursorChange={setCursor}
        handleRef={props.handleRef}
      />
    </div>
  );
}
