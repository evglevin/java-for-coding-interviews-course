import { memo, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Moon, PanelLeft, PanelLeftClose, Pause, Play, RotateCcw, Sun, Timer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GithubIcon } from '@/components/GithubIcon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Lesson, Section } from '@/course/types';
import type { Theme } from '@/features/preferences/preferences';
import { cn } from '@/lib/utils';
import { REPO_URL, SITE_NAME } from '@/site';

interface TopBarProps {
  lesson: Lesson;
  section: Section;
  previous: Lesson | null;
  next: Lesson | null;
  solvedCount: number;
  totalLessons: number;
  sidebarOpen: boolean;
  drawerOpen: boolean;
  theme: Theme;
  onToggleSidebar(): void;
  onToggleTheme(): void;
}

function Hint({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function LessonArrow({ lesson, direction }: { lesson: Lesson | null; direction: 'previous' | 'next' }) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
  const label = direction === 'previous' ? 'Previous lesson' : 'Next lesson';
  if (!lesson) {
    return (
      <Button variant="ghost" size="icon-sm" disabled aria-label={label}>
        <Icon />
      </Button>
    );
  }
  return (
    <Hint label={`${label}: ${lesson.title}`}>
      <Button variant="ghost" size="icon-sm" asChild>
        <Link to="/lessons/$lessonId" params={{ lessonId: lesson.id }} aria-label={label}>
          <Icon />
        </Link>
      </Button>
    </Hint>
  );
}

export const TopBar = memo(function TopBar(props: TopBarProps) {
  const { lesson, section, sidebarOpen, drawerOpen, theme, solvedCount, totalLessons } = props;
  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b bg-topbar px-2 select-none md:px-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="hidden md:flex">
          <SidebarToggle open={sidebarOpen} solved={solvedCount} total={totalLessons} onClick={props.onToggleSidebar} />
        </div>
        <div className="flex md:hidden">
          <SidebarToggle open={drawerOpen} solved={solvedCount} total={totalLessons} onClick={props.onToggleSidebar} />
        </div>
        <span className="hidden truncate px-1 text-sm font-medium sm:inline">{SITE_NAME}</span>
        <div
          data-topbar-nav
          className={cn('flex min-w-0 items-center gap-1.5', sidebarOpen && 'md:hidden', drawerOpen && 'max-md:hidden')}
        >
          <div className="flex shrink-0 items-center">
            <LessonArrow lesson={props.previous} direction="previous" />
            <LessonArrow lesson={props.next} direction="next" />
          </div>
          <div className="ml-1 flex min-w-0 items-center gap-1.5 text-xs">
            <span className="truncate font-medium text-prose">{section.title}</span>
            <span className="shrink-0 text-muted-foreground">
              ({lesson.positionInSection} / {section.lessonIds.length})
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <InterviewTimer />
        <Hint label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          <Button variant="ghost" size="icon" onClick={props.onToggleTheme} aria-label="Toggle theme" className="text-prose">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </Hint>
        <Hint label="Source code on GitHub">
          <Button variant="ghost" size="icon" asChild className="hidden text-prose sm:inline-flex">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Source code on GitHub">
              <GithubIcon />
            </a>
          </Button>
        </Hint>
      </div>
    </header>
  );
});

/**
 * Opens and closes the lessons sidebar. While the sidebar (and its progress bar) is hidden,
 * the button also shows the course progress.
 */
function SidebarToggle({ open, solved, total, onClick }: { open: boolean; solved: number; total: number; onClick: () => void }) {
  if (open) {
    return (
      <Hint label="Hide lessons">
        <Button variant="ghost" size="icon-sm" onClick={onClick} aria-label="Hide lessons">
          <PanelLeftClose />
        </Button>
      </Hint>
    );
  }
  return (
    <Hint label={`Show lessons (${solved} of ${total} solved)`}>
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        aria-label={`Show lessons, ${solved}/${total} solved`}
        className="h-7 shrink-0 gap-1.5 bg-elevated pr-2 pl-1.5 text-muted-foreground hover:text-foreground"
      >
        <PanelLeft className="size-4" />
        <span className="h-3.5 w-px shrink-0 bg-border-strong" aria-hidden="true" />
        <ProgressRing fraction={total ? solved / total : 0} />
        <span className="font-mono text-xs leading-none text-foreground tabular-nums">
          {solved}/{total}
        </span>
      </Button>
    </Hint>
  );
}

function ProgressRing({ fraction }: { fraction: number }) {
  const radius = 7.5;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className="size-4 shrink-0 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r={radius} fill="none" stroke="currentColor" strokeWidth="2.2" className="text-border-strong" />
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        className="text-success transition-all duration-300"
      />
    </svg>
  );
}

function formatSeconds(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** A stopwatch for practicing under interview time pressure. */
function InterviewTimer() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!open) {
    return (
      <Hint label="Start an interview timer">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Start an interview timer"
          className="text-prose"
          onClick={() => {
            setOpen(true);
            setRunning(true);
          }}
        >
          <Timer />
        </Button>
      </Hint>
    );
  }
  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-elevated px-1 py-0.5 text-xs">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? 'Pause timer' : 'Resume timer'}
      >
        {running ? <Pause className="text-amber-400" /> : <Play className="text-success" />}
      </Button>
      <span className="min-w-[42px] text-center font-mono font-medium" aria-live="off">
        {formatSeconds(seconds)}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Reset timer"
        onClick={() => {
          setRunning(false);
          setSeconds(0);
        }}
      >
        <RotateCcw />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Hide timer"
        onClick={() => {
          setRunning(false);
          setSeconds(0);
          setOpen(false);
        }}
      >
        <X />
      </Button>
    </div>
  );
}
