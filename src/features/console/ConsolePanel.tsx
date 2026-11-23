import { memo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Loader2,
  Play,
  Send,
  Square,
  Terminal,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RunResult, SubmitOutcome, TestResult } from '@/runtime/types';
import { Kbd, MOD_KEY } from '@/components/Kbd';
import { describeFailure, shortException } from './describe';

type ConsoleTab = 'output' | 'tests';

interface ConsoleBodyProps {
  result: RunResult | null;
  running: boolean;
  hasNextLesson: boolean;
  onSubmit: () => void;
  onNextLesson: () => void;
}

/** The Output and Test Cases tabs. */
export const ConsoleBody = memo(function ConsoleBody({
  result,
  running,
  hasNextLesson,
  onSubmit,
  onNextLesson,
}: ConsoleBodyProps) {
  const [tab, setTab] = useState<ConsoleTab>('output');
  const [shownResult, setShownResult] = useState(result);

  // A new result opens the tab that matters for it (adjusted during render, so the stale tab never paints).
  if (result !== shownResult) {
    setShownResult(result);
    if (result) setTab(result.mode === 'submit' && !isEarlyFailure(result) ? 'tests' : 'output');
  }

  const tests = result?.mode === 'submit' ? result.tests : [];
  const passed = tests.filter((t) => t.status === 'passed').length;

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as ConsoleTab)} className="flex h-full min-h-0 flex-col gap-0 bg-card">
      <div className="flex shrink-0 items-center justify-between border-b px-2">
        <TabsList variant="line" className="h-9">
          <TabsTrigger value="output" className="px-2.5 text-xs">
            <Terminal /> Output
          </TabsTrigger>
          <TabsTrigger value="tests" className="px-2.5 text-xs">
            <FlaskConical /> Test Cases
            {tests.length > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 font-mono text-[10px] font-semibold',
                  passed === tests.length ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
                )}
              >
                {passed}/{tests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        {result && (
          <span className="pr-2 font-mono text-[11px] text-muted-foreground" title="Compile time, then run time">
            {result.compileMs} ms + {result.runMs} ms
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3.5 text-sm">
        {running && !result ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-brand" /> Compiling and running…
          </div>
        ) : !result ? (
          <EmptyState />
        ) : (
          <>
            <TabsContent value="output">
              <OutputView result={result} onSubmit={onSubmit} />
            </TabsContent>
            <TabsContent value="tests">
              {result.mode === 'submit' ? (
                <TestsView result={result} hasNextLesson={hasNextLesson} onNextLesson={onNextLesson} />
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  <strong className="text-prose">Submit</strong> runs your code against every test case.
                </p>
              )}
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
});

/** The program never got to the tests, so there is nothing to show per test. */
function isEarlyFailure(result: RunResult): boolean {
  const kind = result.failure?.kind;
  return kind === 'compile' || kind === 'mismatch' || kind === 'internal';
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
      <p>
        <strong className="text-prose">Run</strong>
        <span className="hidden md:inline">
          {' '}
          (<Kbd>{MOD_KEY} + Enter</Kbd>)
        </span>{' '}
        compiles your code and compares its output with the expected output,
      </p>
      <p>
        or <strong className="text-prose">Submit</strong>
        <span className="hidden md:inline">
          {' '}
          (<Kbd>{MOD_KEY} + Shift + Enter</Kbd>)
        </span>{' '}
        to run all test cases.
      </p>
    </div>
  );
}

function Pre({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <pre className={cn('overflow-x-auto rounded-md border bg-code p-2.5 font-mono text-xs leading-relaxed', className)}>
      {children}
    </pre>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase', className)}>
      {children}
    </div>
  );
}

function FailureBanner({ result }: { result: RunResult }) {
  if (!result.failure) return null;
  const { title, body } = describeFailure(result.failure);
  return (
    <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft p-3 text-xs">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 font-semibold text-danger">{title}</div>
        <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-foreground/90">{body}</pre>
      </div>
    </div>
  );
}

function OutputView({ result, onSubmit }: { result: RunResult; onSubmit: () => void }) {
  return (
    <div className="space-y-3">
      {result.failure ? (
        <FailureBanner result={result} />
      ) : result.mode === 'run' ? (
        <div
          className={cn(
            'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-semibold',
            result.outputMatches
              ? 'border-success/30 bg-success-soft text-success'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-500',
          )}
        >
          <span className="flex items-center gap-1.5">
            {result.outputMatches ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {result.outputMatches ? 'Output matches the expected output.' : 'Output differs from the expected output.'}
          </span>
          {result.outputMatches && (
            <Button size="xs" variant="success" onClick={onSubmit}>
              Submit now
            </Button>
          )}
        </div>
      ) : null}

      {!isEarlyFailure(result) && (result.mode === 'run' || result.stdout) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label>Your output</Label>
            <Pre className="min-h-[68px] text-foreground">{result.stdout.trimEnd() || '(no output)'}</Pre>
          </div>
          {result.mode === 'run' && (
            <div>
              <Label>Expected output</Label>
              <Pre className="min-h-[68px] text-prose">{result.expectedOutput}</Pre>
            </div>
          )}
        </div>
      )}
      {result.stderr && (
        <div>
          <Label className="text-danger">Standard error</Label>
          <Pre className="text-danger">{result.stderr.trimEnd()}</Pre>
        </div>
      )}
    </div>
  );
}

const STATUS_DOT: Record<TestResult['status'], string> = {
  passed: 'bg-success',
  failed: 'bg-danger',
  error: 'bg-danger',
  notRun: 'bg-border-strong',
};

function TestsView({
  result,
  hasNextLesson,
  onNextLesson,
}: {
  result: SubmitOutcome;
  hasNextLesson: boolean;
  onNextLesson: () => void;
}) {
  const { tests } = result;
  const firstProblem = tests.findIndex((t) => t.status !== 'passed');
  const [selected, setSelected] = useState(Math.max(0, firstProblem));
  const [shownResult, setShownResult] = useState(result);
  if (result !== shownResult) {
    setShownResult(result);
    setSelected(Math.max(0, firstProblem));
  }
  const test = tests[selected];
  const passed = tests.filter((t) => t.status === 'passed').length;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5',
          result.allPassed ? 'border-success/35 bg-success-soft' : 'border-danger/35 bg-danger-soft',
        )}
      >
        <div className="flex items-center gap-2">
          {result.allPassed ? <CheckCircle2 className="size-5 text-success" /> : <XCircle className="size-5 text-danger" />}
          <div>
            <div className={cn('text-sm font-bold', result.allPassed ? 'text-success' : 'text-danger')}>
              {result.allPassed ? 'Accepted' : result.failure ? describeFailure(result.failure).title : 'Wrong answer'}
            </div>
            <div className="text-xs text-muted-foreground">
              {passed} / {tests.length} test cases passed
            </div>
          </div>
        </div>
        {result.allPassed && hasNextLesson && (
          <Button size="sm" variant="success" onClick={onNextLesson}>
            Next lesson <ArrowRight />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tests.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setSelected(i)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              i === selected ? 'border-brand/60 bg-elevated text-foreground' : 'text-muted-foreground hover:bg-accent',
            )}
          >
            <span className={cn('size-2 rounded-full', STATUS_DOT[t.status])} />
            Case {i + 1}
          </button>
        ))}
      </div>

      {test && <TestDetail test={test} />}
      {result.stdout && (
        <div>
          <Label>Printed outside the tests</Label>
          <Pre>{result.stdout.trimEnd()}</Pre>
        </div>
      )}
    </div>
  );
}

function TestDetail({ test }: { test: TestResult }) {
  return (
    <div className="space-y-2.5 text-xs">
      <div className="font-semibold text-foreground">{test.name}</div>
      {test.status === 'notRun' && <p className="text-muted-foreground">Not run: the program stopped before this test.</p>}
      {test.message && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-amber-600 dark:text-amber-300">
          {test.message}
        </div>
      )}
      <div>
        <Label className="normal-case">Call</Label>
        <Pre>{test.call}</Pre>
      </div>
      {(test.actual !== undefined || test.expected !== undefined) && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <Label className="normal-case">Your result</Label>
            <Pre className={test.status === 'passed' ? 'text-success' : 'text-danger'}>{test.actual ?? '—'}</Pre>
          </div>
          <div>
            <Label className="normal-case">Expected</Label>
            <Pre className="text-prose">{test.expected ?? '—'}</Pre>
          </div>
        </div>
      )}
      {test.exception && (
        <div>
          <Label className="text-danger normal-case">Exception</Label>
          <Pre className="border-danger/30 whitespace-pre-wrap text-danger">{shortException(test.exception)}</Pre>
        </div>
      )}
      {test.stdout && (
        <div>
          <Label className="normal-case">Printed during this test</Label>
          <Pre>{test.stdout.trimEnd()}</Pre>
        </div>
      )}
    </div>
  );
}

interface ActionBarProps {
  consoleOpen: boolean;
  running: boolean;
  onToggleConsole: () => void;
  onRun: () => void;
  onSubmit: () => void;
  onStop: () => void;
}

/** Console toggle plus Run / Submit / Stop. */
export const ActionBar = memo(function ActionBar({
  consoleOpen,
  running,
  onToggleConsole,
  onRun,
  onSubmit,
  onStop,
}: ActionBarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-t bg-card px-2 md:px-3.5">
      <Button variant="ghost" size="sm" onClick={onToggleConsole} className="text-xs text-prose">
        Console {consoleOpen ? <ChevronDown /> : <ChevronUp />}
      </Button>
      <div className="flex items-center gap-2">
        {running ? (
          <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-500" onClick={onStop}>
            <Square className="fill-current" /> Stop
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={onRun} title={`Run (${MOD_KEY} + Enter)`}>
              <Play /> Run
            </Button>
            <Button size="sm" variant="success" onClick={onSubmit} title={`Run all tests (${MOD_KEY} + Shift + Enter)`}>
              <Send /> Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
});
