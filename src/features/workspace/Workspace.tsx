import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { ClientOnly, useHydrated, useNavigate } from '@tanstack/react-router';
import { BookOpen, Code2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LESSONS, SECTIONS, getSection } from '@/course';
import type { Lesson } from '@/course/types';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Confetti } from '@/components/Confetti';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { CompileDiagnostic, RunMode, RunResult } from '@/runtime/types';
import { CurriculumSidebar } from '@/features/curriculum/CurriculumSidebar';
import type { CodeEditorHandle } from '@/features/editor/CodeEditor';
import { useSolutionTabs } from '@/features/editor/useSolutionTabs';
import { LessonPane } from '@/features/lesson/LessonPane';
import { WelcomeDialog } from '@/features/onboarding/WelcomeDialog';
import {
  markWelcomeSeen,
  setSectionCollapsed,
  setSidebarOpen,
  setTheme,
  usePreferences,
} from '@/features/preferences/preferences';
import { ImportProgressDialog } from '@/features/progress/ImportProgressDialog';
import {
  areAllLessonsSolved,
  clearProgress,
  getSolvedIds,
  loadProgress,
  markSolved,
  replaceProgress,
  useSolvedIds,
} from '@/features/progress/progress';
import { copyProgressLink, decodeProgress, takeProgressFromUrl, type IncomingProgress } from '@/features/progress/progressLink';
import { javaRuntime, useRuntimeStatus } from '@/features/runner/runtime';
import { TopBar } from './TopBar';

// CodeMirror is the heaviest part of the page; it loads after the lesson text is interactive.
const CodePane = lazy(() => import('./CodePane'));

const LESSON_IDS = LESSONS.map((l) => l.id);

type MobileView = 'lesson' | 'code';
type Diagnostics = { documentKey: string; items: CompileDiagnostic[] } | null;

/** The whole course screen for one lesson: curriculum, lesson text, editor, and console. */
export function Workspace({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate();
  const preferences = usePreferences();
  const solvedIds = useSolvedIds();
  const isMobile = useIsMobile();
  const hydrated = useHydrated();
  const runtimeStatus = useRuntimeStatus();
  const running = runtimeStatus.state === 'running';

  const section = getSection(lesson.sectionId);
  const previous = LESSONS[lesson.index - 1] ?? null;
  const next = LESSONS[lesson.index + 1] ?? null;

  const tabs = useSolutionTabs(lesson);
  const editor = useRef<CodeEditorHandle | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>(null);
  const [mobileView, setMobileView] = useState<MobileView>('lesson');
  const [editorRequested, setEditorRequested] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [incoming, setIncoming] = useState<IncomingProgress | null>(null);
  const [confettiRun, setConfettiRun] = useState(0);

  // A new lesson starts with a clean console.
  const [shownLessonId, setShownLessonId] = useState(lesson.id);
  if (shownLessonId !== lesson.id) {
    setShownLessonId(lesson.id);
    setResult(null);
    setDiagnostics(null);
  }
  const currentLessonId = useRef(lesson.id);
  currentLessonId.current = lesson.id;
  const latestTabs = useRef(tabs);
  latestTabs.current = tabs;

  useEffect(() => {
    setSectionCollapsed(lesson.sectionId, false);
  }, [lesson.id, lesson.sectionId]);

  useEffect(() => {
    if (hydrated && !isMobile) setEditorRequested(true);
  }, [hydrated, isMobile]);

  // Desktop has the editor alongside the lesson, so warm up after the first interaction.
  useEffect(() => {
    if (!hydrated || isMobile) return;
    const warmup = () => javaRuntime.warmup();
    window.addEventListener('pointerdown', warmup, { once: true, passive: true });
    window.addEventListener('keydown', warmup, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', warmup);
      window.removeEventListener('keydown', warmup);
    };
  }, [hydrated, isMobile]);

  // Progress links carry the progress in the URL fragment; pasting one for the open lesson only fires hashchange.
  useEffect(() => {
    const take = () => {
      const data = takeProgressFromUrl();
      if (data !== null) void decodeProgress(data).then(setIncoming);
    };
    take();
    window.addEventListener('hashchange', take);
    return () => window.removeEventListener('hashchange', take);
  }, []);

  const execute = useCallback(
    async (mode: RunMode) => {
      if (javaRuntime.getStatus().state === 'running') return;
      setConsoleOpen(true);
      const { activeTab, documentKey } = latestTabs.current;
      const runLesson = lesson;
      const response =
        mode === 'run'
          ? await javaRuntime.execute({ mode, source: activeTab.code, expectedOutput: runLesson.expectedOutput })
          : await javaRuntime.execute({ mode, source: activeTab.code, tests: runLesson.testCases });
      if (response.mode === 'submit' && response.allPassed) {
        const wasComplete = areAllLessonsSolved(getSolvedIds(), LESSON_IDS);
        markSolved(runLesson.id);
        if (!wasComplete && areAllLessonsSolved(getSolvedIds(), LESSON_IDS)) {
          setConfettiRun((n) => n + 1);
        }
      }
      // The learner may have moved to another lesson while the code ran.
      if (currentLessonId.current !== runLesson.id) return;
      setResult(response);
      setDiagnostics(response.failure?.kind === 'compile' ? { documentKey, items: response.failure.diagnostics } : null);
    },
    [lesson],
  );
  const run = useCallback(() => void execute('run'), [execute]);
  const submit = useCallback(() => void execute('submit'), [execute]);

  const changeCode = tabs.change;
  const loadCode = useCallback(
    (code: string) => {
      if (editor.current) editor.current.replaceCode(code);
      else changeCode(code);
    },
    [changeCode],
  );
  const changeMobileView = useCallback(
    (view: MobileView) => {
      if (view === 'code') {
        setEditorRequested(true);
        if (isMobile) javaRuntime.warmup();
      }
      setMobileView(view);
    },
    [isMobile],
  );
  const loadSolution = useCallback(
    (code: string) => {
      loadCode(code);
      changeMobileView('code');
    },
    [changeMobileView, loadCode],
  );

  const goToNext = useCallback(() => {
    if (!next) return;
    setMobileView('lesson');
    void navigate({ to: '/lessons/$lessonId', params: { lessonId: next.id } });
  }, [navigate, next]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setDrawerOpen((open) => !open);
    else setSidebarOpen(!preferences.sidebarOpen);
  }, [isMobile, preferences.sidebarOpen]);

  const toggleSection = useCallback(
    (sectionId: string) => setSectionCollapsed(sectionId, !preferences.collapsedSections.has(sectionId)),
    [preferences.collapsedSections],
  );

  const resetProgress = useCallback(() => {
    clearProgress();
    setResult(null);
    setDiagnostics(null);
  }, []);

  const saveProgressLink = useCallback(() => copyProgressLink(loadProgress(), lesson.id), [lesson.id]);

  const closeImport = useCallback(
    (load: boolean) => {
      if (!load || incoming?.status !== 'valid') return setIncoming(null);
      const outcome = replaceProgress(incoming.progress);
      if (outcome !== 'saved') return setIncoming({ status: outcome === 'partial' ? 'savePartial' : 'saveFailed' });
      // Someone moving their progress over has used the course before.
      markWelcomeSeen();
      setResult(null);
      setDiagnostics(null);
      setIncoming(null);
    },
    [incoming],
  );

  const sidebar = (
    <CurriculumSidebar
      currentLessonId={lesson.id}
      solvedIds={solvedIds}
      collapsedSections={preferences.collapsedSections}
      onToggleSection={toggleSection}
      onSelectLesson={isMobile ? () => (setDrawerOpen(false), setMobileView('lesson')) : undefined}
      onResetProgress={resetProgress}
      onSaveProgressLink={saveProgressLink}
    />
  );

  const lessonPane = (
    <LessonPane key={lesson.id} lesson={lesson} isSolved={solvedIds.has(lesson.id)} onLoadSolution={loadSolution} />
  );

  const codePane = editorRequested ? (
    <Suspense fallback={<CodePaneFallback />}>
      <CodePane
        tabs={tabs}
        editor={editor}
        diagnostics={diagnostics}
        result={result}
        running={running}
        runtimeStatus={runtimeStatus}
        theme={preferences.theme}
        fontSize={preferences.fontSize}
        consoleOpen={consoleOpen}
        onConsoleOpenChange={setConsoleOpen}
        expanded={editorExpanded}
        canExpand={!isMobile}
        hasNextLesson={next !== null}
        onToggleExpand={() => setEditorExpanded((e) => !e)}
        onReset={() => loadCode(lesson.starterCode)}
        onRun={run}
        onSubmit={submit}
        onNextLesson={goToNext}
      />
    </Suspense>
  ) : (
    <CodePaneFallback />
  );

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <TopBar
        lesson={lesson}
        section={section}
        previous={previous}
        next={next}
        solvedCount={LESSONS.filter((l) => solvedIds.has(l.id)).length}
        totalLessons={LESSONS.length}
        sidebarOpen={preferences.sidebarOpen}
        drawerOpen={drawerOpen}
        theme={preferences.theme}
        onToggleSidebar={toggleSidebar}
        onToggleTheme={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
      />

      <MobilePaneSwitch view={mobileView} onChange={changeMobileView} />
      <main className="flex min-h-0 flex-1 overflow-hidden p-1.5 md:p-2">
        <ResizablePanelGroup orientation="horizontal" data-mobile-pane={mobileView} disabled={isMobile}>
          {preferences.sidebarOpen && (
            <>
              <ResizablePanel
                id="sidebar"
                defaultSize={268}
                minSize={210}
                maxSize={400}
                groupResizeBehavior="preserve-pixel-size"
              >
                {sidebar}
              </ResizablePanel>
              <PaneGutter />
            </>
          )}
          {(!editorExpanded || isMobile) && (
            <>
              <ResizablePanel id="lesson" defaultSize="44%" minSize="26%">
                {lessonPane}
              </ResizablePanel>
              <PaneGutter />
            </>
          )}
          <ResizablePanel id="code" minSize="30%">
            <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">{codePane}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      {isMobile && (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side="left"
            className="w-[min(320px,calc(100vw-48px))] gap-0 border-none bg-transparent p-1.5"
            showCloseButton={false}
            aria-describedby={undefined}
          >
            <SheetTitle className="sr-only">Lessons</SheetTitle>
            {sidebar}
          </SheetContent>
        </Sheet>
      )}

      <Confetti trigger={confettiRun} />
      <ImportProgressDialog incoming={incoming} currentSolvedCount={solvedIds.size} onClose={closeImport} />
      <ClientOnly>
        <WelcomeDialog
          open={!preferences.welcomeSeen && incoming === null}
          totalLessons={LESSONS.length}
          totalSections={SECTIONS.length}
          onClose={markWelcomeSeen}
        />
      </ClientOnly>
    </div>
  );
}

/** A gap between panes that also works as the resize handle. */
function PaneGutter() {
  return (
    <ResizableHandle className="group w-2.5 bg-transparent">
      <div className="h-10 w-1 rounded-full bg-border-strong transition-colors group-hover:bg-brand group-data-[separator=active]:bg-brand" />
    </ResizableHandle>
  );
}

function MobilePaneSwitch({ view, onChange }: { view: MobileView; onChange: (view: MobileView) => void }) {
  const options = [
    { id: 'lesson', label: 'Lesson', Icon: BookOpen },
    { id: 'code', label: 'Code', Icon: Code2 },
  ] as const;
  return (
    <div className="shrink-0 px-1.5 pt-1.5 md:hidden">
      <div role="group" aria-label="Pane" className="grid grid-cols-2 gap-1 rounded-lg border bg-card p-1">
        {options.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-controls={id}
            aria-pressed={view === id}
            onClick={() => onChange(id)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[13px] font-medium transition-colors',
              view === id ? 'bg-elevated text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CodePaneFallback() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Loading editor…
    </div>
  );
}
