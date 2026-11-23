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
import type { IncomingProgress } from './progressLink';

interface ImportProgressDialogProps {
  incoming: IncomingProgress | null;
  currentSolvedCount: number;
  /** `load` is true when the learner chose to replace this browser's progress. */
  onClose(load: boolean): void;
}

const ERRORS = {
  invalid: {
    title: 'Couldn’t read this progress link',
    body: 'The link may have been cut off when it was copied. Your progress in this browser is unchanged.',
  },
  saveFailed: {
    title: 'Couldn’t save the progress from this link',
    body: 'This browser’s storage is full or blocked. Your progress in this browser is unchanged.',
  },
  savePartial: {
    title: 'Only part of the progress was saved',
    body: 'Storage filled up while saving, so the code from the link was saved but its solved lessons were not. Free up space and open the link again.',
  },
} as const;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/**
 * Shown when the page opens from a progress link. Any way of closing it other than
 * "Load progress" keeps the progress already in this browser.
 */
export function ImportProgressDialog({ incoming, currentSolvedCount, onClose }: ImportProgressDialogProps) {
  return (
    <Dialog open={incoming !== null} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[480px]" showCloseButton={false}>
        {incoming && incoming.status !== 'valid' ? (
          <>
            <DialogHeader>
              <DialogTitle>{ERRORS[incoming.status].title}</DialogTitle>
              <DialogDescription>{ERRORS[incoming.status].body}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button autoFocus>OK</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : incoming ? (
          <>
            <DialogHeader>
              <DialogTitle>Replace your progress?</DialogTitle>
              <DialogDescription>
                This link has {plural(incoming.progress.solved.length, 'solved lesson')} and code for{' '}
                {plural(Object.keys(incoming.progress.tabs).length, 'lesson')}. Loading it replaces the progress saved in this
                browser
                {currentSolvedCount > 0 ? ` (${plural(currentSolvedCount, 'solved lesson')})` : ''}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {/* The safe choice has focus, so a stray Enter doesn't replace progress. */}
              <DialogClose asChild>
                <Button variant="ghost" autoFocus>
                  Keep current progress
                </Button>
              </DialogClose>
              <Button onClick={() => onClose(true)}>Load progress</Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
