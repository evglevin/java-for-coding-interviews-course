import { memo, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, ChevronDown, ChevronRight, Link as LinkIcon, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LESSONS, SECTIONS } from '@/course';
import type { Lesson } from '@/course/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CurriculumSidebarProps {
  currentLessonId: string;
  solvedIds: ReadonlySet<string>;
  collapsedSections: ReadonlySet<string>;
  onToggleSection(sectionId: string): void;
  onSelectLesson?(): void;
  onResetProgress(): void;
  /** Copies a link carrying the learner's progress; rejects if the clipboard refuses. */
  onSaveProgressLink(): Promise<void>;
  className?: string;
  style?: React.CSSProperties;
}

function matches(lesson: Lesson, sectionTitle: string, query: string) {
  return (
    lesson.title.toLowerCase().includes(query) || sectionTitle.toLowerCase().includes(query) || String(lesson.index + 1) === query
  );
}

export const CurriculumSidebar = memo(function CurriculumSidebar({
  currentLessonId,
  solvedIds,
  collapsedSections,
  onToggleSection,
  onSelectLesson,
  onResetProgress,
  onSaveProgressLink,
  className,
  style,
}: CurriculumSidebarProps) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();

  const visibleSections = useMemo(
    () =>
      SECTIONS.map((section) => {
        const lessons = section.lessonIds.map((id) => LESSONS.find((l) => l.id === id)!);
        const solved = lessons.filter((l) => solvedIds.has(l.id)).length;
        const shown = query ? lessons.filter((l) => matches(l, section.title, query)) : lessons;
        return { section, lessons: shown, solved, total: lessons.length };
      }).filter((s) => s.lessons.length > 0),
    [query, solvedIds],
  );

  const solvedCount = LESSONS.filter((l) => solvedIds.has(l.id)).length;
  const percent = Math.round((solvedCount / LESSONS.length) * 100);

  return (
    <aside className={cn('flex h-full flex-col overflow-hidden rounded-lg border bg-card select-none', className)} style={style}>
      <div className="shrink-0 border-b px-3.5 py-3">
        <div className="text-xs font-bold tracking-wider text-prose uppercase">Lessons</div>
        <div className="mt-0.5 mb-2 text-[11px] text-muted-foreground">
          {solvedCount} of {LESSONS.length} solved ({percent}%)
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
          <div className="h-full rounded-full bg-success transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
        <label className="relative mt-2.5 block">
          <span className="sr-only">Filter lessons</span>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter lessons…"
            className="w-full rounded-md border bg-code py-1.5 pr-2.5 pl-8 text-base text-foreground transition-colors outline-none focus:border-brand md:text-xs"
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Course lessons">
        {visibleSections.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No lessons match “{search}”.</p>
        ) : (
          <div className="space-y-3">
            {visibleSections.map(({ section, lessons, solved, total }) => {
              const complete = solved === total;
              const collapsed = !query && collapsedSections.has(section.id);
              return (
                <div key={section.id}>
                  <button
                    type="button"
                    aria-expanded={!collapsed}
                    disabled={!!query}
                    onClick={() => onToggleSection(section.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border bg-elevated px-2 py-2 text-left transition-colors enabled:hover:border-border-strong"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded font-mono text-[10.5px] font-bold',
                          complete ? 'bg-success-soft text-success' : 'bg-brand/15 text-brand',
                        )}
                      >
                        {section.number}
                      </span>
                      <span className="truncate text-[11px] font-bold tracking-wider text-foreground uppercase">
                        {section.title}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                          complete ? 'bg-success-soft text-success' : 'bg-code text-muted-foreground',
                        )}
                      >
                        {solved}/{total}
                      </span>
                      {collapsed ? (
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                      )}
                    </span>
                  </button>

                  {!collapsed && (
                    <ul className="mt-1 ml-3 space-y-0.5 border-l pl-2">
                      {lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <LessonLink
                            lesson={lesson}
                            current={lesson.id === currentLessonId}
                            solved={solvedIds.has(lesson.id)}
                            onSelect={onSelectLesson}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      <footer className="flex shrink-0 items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <ResetProgressButton onConfirm={onResetProgress} />
        <SaveLinkButton onSave={onSaveProgressLink} />
      </footer>
    </aside>
  );
});

function scrollIntoView(item: HTMLElement | null) {
  item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function LessonLink({
  lesson,
  current,
  solved,
  onSelect,
}: {
  lesson: Lesson;
  current: boolean;
  solved: boolean;
  onSelect?: () => void;
}) {
  return (
    <Link
      to="/lessons/$lessonId"
      params={{ lessonId: lesson.id }}
      ref={current ? scrollIntoView : undefined}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors md:py-1.5 md:text-[13px]',
        current
          ? 'font-semibold text-foreground ring-1 ring-brand/60 ring-inset'
          : 'text-prose hover:bg-accent hover:text-foreground',
        current && (solved ? 'bg-success/16' : 'bg-brand/14'),
        !current && solved && 'bg-success-soft',
      )}
    >
      <span
        className={cn(
          'w-5 shrink-0 text-right font-mono text-[11px]',
          solved ? 'text-success' : current ? 'text-brand' : 'text-muted-foreground',
        )}
      >
        {lesson.index + 1}
      </span>
      <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
      {solved && <Check className="size-3.5 shrink-0 stroke-[2.5] text-success" />}
    </Link>
  );
}

function ResetProgressButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[11.5px] transition-colors hover:bg-accent hover:text-danger"
        >
          <Trash2 className="size-3.5" /> Reset progress
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears every solved lesson and all the code you wrote in this browser. It can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Reset progress
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SaveLinkButton({ onSave }: { onSave: () => Promise<void> }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (next: 'copied' | 'failed') => {
    setStatus(next);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2500);
  };
  return (
    <button
      type="button"
      onClick={() =>
        onSave().then(
          () => show('copied'),
          () => show('failed'),
        )
      }
      title="Copy a link that moves your solved lessons and code to another device"
      className={cn(
        'flex items-center gap-1.5 rounded px-1.5 py-1 text-[11.5px] transition-colors hover:bg-accent',
        status === 'copied' ? 'text-success' : status === 'failed' ? 'text-danger' : 'hover:text-foreground',
      )}
    >
      {status === 'copied' ? <Check className="size-3.5" /> : <LinkIcon className="size-3.5" />}
      <span aria-live="polite">
        {status === 'copied' ? 'Link copied' : status === 'failed' ? 'Couldn’t copy' : 'Save to link'}
      </span>
    </button>
  );
}
