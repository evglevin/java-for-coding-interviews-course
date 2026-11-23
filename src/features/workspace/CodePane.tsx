import { useEffect } from 'react';
import { usePanelRef } from 'react-resizable-panels';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import type { CompileDiagnostic, RunResult, RuntimeStatus } from '@/runtime/types';
import { ActionBar, ConsoleBody } from '@/features/console/ConsolePanel';
import type { CodeEditorHandle } from '@/features/editor/CodeEditor';
import { EditorPane } from '@/features/editor/EditorPane';
import type { useSolutionTabs } from '@/features/editor/useSolutionTabs';
import { setFontSize, type Theme } from '@/features/preferences/preferences';
import { javaRuntime } from '@/features/runner/runtime';

/** Share of the code pane the console takes when it opens. */
const CONSOLE_OPEN_SIZE = '42%';

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
  const consolePanel = usePanelRef();

  // The console opens on Run/Submit and on its toggle; dragging it shut closes it too.
  useEffect(() => {
    const panel = consolePanel.current;
    if (!panel) return;
    if (consoleOpen && panel.isCollapsed()) panel.resize(CONSOLE_OPEN_SIZE);
    if (!consoleOpen && !panel.isCollapsed()) panel.collapse();
  }, [consoleOpen, consolePanel]);

  return (
    <>
      <ResizablePanelGroup orientation="vertical" className="min-h-0 flex-1">
        <ResizablePanel id="editor" minSize={120}>
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
        </ResizablePanel>
        {consoleOpen && <ResizableHandle />}
        <ResizablePanel
          id="console"
          panelRef={consolePanel}
          collapsible
          collapsedSize={0}
          defaultSize={0}
          minSize={130}
          maxSize="70"
          onResize={(size) => {
            const open = size.inPixels > 0;
            if (open !== consoleOpen) onConsoleOpenChange(open);
          }}
        >
          <ConsoleBody
            result={props.result}
            running={props.running}
            hasNextLesson={props.hasNextLesson}
            onSubmit={props.onSubmit}
            onNextLesson={props.onNextLesson}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
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
