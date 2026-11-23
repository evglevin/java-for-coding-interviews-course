import { BookOpen, Code2, HardDrive, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd, MOD_KEY } from '@/components/Kbd';
import { SITE_NAME } from '@/site';

interface WelcomeDialogProps {
  open: boolean;
  totalLessons: number;
  totalSections: number;
  /** Any way of closing counts as dismissal. */
  onClose(): void;
}

/** One-time introduction on the first visit. */
export function WelcomeDialog({ open, totalLessons, totalSections, onClose }: WelcomeDialogProps) {
  const points = [
    {
      icon: BookOpen,
      title: 'Read the lesson',
      body: `${totalLessons} short lessons in ${totalSections} sections cover the Java you need in interviews: sorting, collections, hash maps, heaps, and more.`,
    },
    {
      icon: Code2,
      title: 'Write code in the editor',
      body: 'A real Java compiler runs in your browser, so there’s nothing to install, and it works offline once loaded.',
    },
    {
      icon: Play,
      title: 'Run and submit',
      body: (
        <>
          <strong>Run</strong>
          <span className="hidden md:inline">
            {' '}
            (<Kbd>{MOD_KEY} + Enter</Kbd>)
          </span>{' '}
          compiles your code and compares its output with the expected output. <strong>Submit</strong>
          <span className="hidden md:inline">
            {' '}
            (<Kbd>{MOD_KEY} + Shift + Enter</Kbd>)
          </span>{' '}
          runs the tests and marks the lesson solved when they all pass.
        </>
      ),
    },
    {
      icon: HardDrive,
      title: 'Pick up where you left off',
      body: 'Your code and solved lessons are saved in this browser automatically.',
    },
  ];
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Welcome to {SITE_NAME}</DialogTitle>
          <DialogDescription>A hands-on course for writing clean, idiomatic Java under interview pressure.</DialogDescription>
        </DialogHeader>
        <ul className="space-y-4">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-elevated text-brand">
                <Icon className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-prose">{body}</div>
              </div>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <DialogClose asChild>
            <Button autoFocus>Get started</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
