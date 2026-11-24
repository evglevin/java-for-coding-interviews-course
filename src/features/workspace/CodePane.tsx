import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { CompileDiagnostic, RunResult, RuntimeStatus } from '@/runtime/types';
import { ActionBar, ConsoleBody } from '@/features/console/ConsolePanel';
import type { CodeEditorHandle } from '@/features/editor/CodeEditor';
import { EditorPane } from '@/features/editor/EditorPane';
import type { useSolutionTabs } from '@/features/editor/useSolutionTabs';
import { setFontSize, type Theme } from '@/features/preferences/preferences';
import { javaRuntime } from '@/features/runner/runtime';
import { startDrag } from './resize';

const DEFAULT_CONSOLE_HEIGHT = 250;
const MIN_CONSOLE_HEIGHT = 130;
const MIN_EDITOR_HEIGHT = 120;

export interface CodePaneProps {
  tabs: ReturnType<typeof useSolutionTabs>;
  editor: React.RefObject<CodeEditorHandle | null>;
  diagnostics: { documentKey: string; items: CompileDiagnostic[] } | null;
  result: RunResult | null;
  running: boolean;
  runtimeStatus: RuntimeStatus;
  theme: Theme;
  fontSize: number;
  consoleOpen: boolean;
  onConsoleOpenChange(open: boolean): void;
  expanded: boolean;
  canExpand: boolean;
  hasNextLesson: boolean;
  onToggleExpand(): void;
  onReset(): void;
  onRun(): void;
  onSubmit(): void;
  onNextLesson(): void;
}

/** Editor above a resizable, collapsible console, with Run and Submit at the bottom. */
export default function CodePane(props: CodePaneProps) {
  const { tabs, consoleOpen, onConsoleOpenChange } = props;
  const [consoleHeight, setConsoleHeight] = useState(DEFAULT_CONSOLE_HEIGHT);
  const splitRef = useRef<HTMLDivElement | null>(null);

  const handleConsoleDrag = useCallback(
    (event: React.PointerEvent) => {
      const containerHeight = splitRef.current?.clientHeight ?? window.innerHeight;
      const maxHeight = Math.max(
        MIN_CONSOLE_HEIGHT,
        Math.min(Math.round(containerHeight * 0.7), containerHeight - MIN_EDITOR_HEIGHT),
      );
      const startY = event.clientY;
      const startHeight = Math.min(consoleHeight, maxHeight);
      startDrag(event, 'row-resize', (ev) => {
        setConsoleHeight(Math.min(maxHeight, Math.max(MIN_CONSOLE_HEIGHT, startHeight + startY - ev.clientY)));
      });
    },
    [consoleHeight],
  );

  return (
    <>
      <div ref={splitRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          <EditorPane
            tabs={tabs.tabs}
            activeTab={tabs.activeTab}
            documentKey={tabs.documentKey}
            diagnostics={props.diagnostics}
            theme={props.theme}
            fontSize={props.fontSize}
            runtimeStatus={props.runtimeStatus}
            expanded={props.expanded}
            canExpand={props.canExpand}
            handleRef={props.editor}
            onSelectTab={tabs.select}
            onAddTab={tabs.add}
            onCloseTab={tabs.close}
            onChange={tabs.change}
            onReset={props.onReset}
            onRun={props.onRun}
            onSubmit={props.onSubmit}
            onFontSize={setFontSize}
            onToggleExpand={props.onToggleExpand}
          />
        </div>
        {consoleOpen && (
          <div className="relative flex shrink-0 flex-col border-t bg-card" style={{ height: consoleHeight, maxHeight: '70%' }}>
            <div
              onPointerDown={handleConsoleDrag}
              className="absolute -top-1.5 right-0 left-0 z-10 h-3 cursor-row-resize touch-none transition-colors hover:bg-brand/40 md:-top-1 md:h-2"
              title="Drag to resize console"
            />
            <ConsoleBody
              result={props.result}
              running={props.running}
              hasNextLesson={props.hasNextLesson}
              onSubmit={props.onSubmit}
              onNextLesson={props.onNextLesson}
            />
          </div>
        )}
      </div>
      <ActionBar
        consoleOpen={consoleOpen}
        running={props.running}
        onToggleConsole={() => onConsoleOpenChange(!consoleOpen)}
        onRun={props.onRun}
        onSubmit={props.onSubmit}
        onStop={() => javaRuntime.stop()}
      />
    </>
  );
}
