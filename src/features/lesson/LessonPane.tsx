import { memo, useState } from 'react';
import { CheckCircle2, ChevronRight, FileText, Info, Lightbulb, Sparkles } from 'lucide-react';
import type { ContentBlock, Lesson } from '@/course/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JavaCodeBlock } from '@/features/editor/java/JavaCodeBlock';
import { InlineCode, Markup } from './Markup';

interface LessonPaneProps {
  lesson: Lesson;
  isSolved: boolean;
  onLoadSolution: (code: string) => void;
}

/** Question, solution and hints for one lesson. Render with `key={lesson.id}` to reset per lesson. */
export const LessonPane = memo(function LessonPane({ lesson, isSolved, onLoadSolution }: LessonPaneProps) {
  return (
    <Tabs defaultValue="question" className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-lg border bg-card">
      <div className="shrink-0 overflow-x-auto border-b px-1 md:px-2">
        <TabsList variant="line" className="h-10">
          <TabsTrigger value="question" className="px-3 text-xs">
            <FileText /> Question
          </TabsTrigger>
          <TabsTrigger value="solution" className="px-3 text-xs">
            <Lightbulb /> Solution
          </TabsTrigger>
          <TabsTrigger value="hints" className="px-3 text-xs">
            <Sparkles /> Hints ({lesson.hints.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        <TabsContent value="question" className="space-y-4 text-[14.5px] leading-relaxed text-prose">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
            {isSolved && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3.5" /> Solved
              </span>
            )}
          </div>

          {lesson.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}

          <section className="pt-3">
            <h2 className="mb-2 text-base font-bold text-foreground">Challenge</h2>
            <p className="mb-3">
              <Markup text={lesson.challenge.intro} />
            </p>
            <ul className="list-disc space-y-2.5 pl-5">
              {lesson.challenge.methods.map((method) => (
                <li key={method.signature}>
                  <InlineCode className="font-medium">{method.signature}</InlineCode>: <Markup text={method.description} />
                </li>
              ))}
            </ul>
            {lesson.challenge.notes?.map((note, i) => (
              <p key={i} className="mt-3 text-xs text-muted-foreground">
                <Markup text={note} />
              </p>
            ))}
          </section>

          <section className="pt-3">
            <h2 className="mb-2 text-base font-bold text-foreground">Time and Space Complexity</h2>
            <Complexity lesson={lesson} />
            {lesson.complexity.note && (
              <p className="mt-3 text-[13.5px] text-muted-foreground">
                <Markup text={lesson.complexity.note} />
              </p>
            )}
          </section>
        </TabsContent>

        <TabsContent value="solution" className="space-y-4 text-[14.5px] leading-relaxed text-prose">
          <h2 className="text-lg font-bold text-foreground">Reference solution</h2>
          <JavaCodeBlock
            code={lesson.solutionCode}
            caption="Main.java"
            onLoadIntoEditor={() => onLoadSolution(lesson.solutionCode)}
          />
          <div>
            <h3 className="mb-1.5 text-sm font-bold text-foreground">Explanation</h3>
            <p>
              <Markup text={lesson.solutionExplanation} />
            </p>
          </div>
          <div className="rounded-lg border bg-elevated p-3.5 text-sm">
            <div className="mb-1 font-semibold text-foreground">Complexity</div>
            <Complexity lesson={lesson} />
          </div>
        </TabsContent>

        <TabsContent value="hints" className="text-sm text-prose">
          <Hints hints={lesson.hints} />
        </TabsContent>
      </div>
    </Tabs>
  );
});

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p>
          <Markup text={block.text} />
        </p>
      );
    case 'heading':
      return <h3 className="pt-2 text-base font-bold text-foreground">{block.text}</h3>;
    case 'code':
      return <JavaCodeBlock code={block.code} caption={block.caption} />;
    case 'list':
      return (
        <ul className="list-disc space-y-1.5 pl-5">
          {block.items.map((item, i) => (
            <li key={i}>
              <Markup text={item} />
            </li>
          ))}
        </ul>
      );
    case 'note':
      return (
        <aside className="flex gap-2.5 rounded-lg border bg-elevated px-3.5 py-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-brand" />
          <div className="space-y-0.5">
            {block.title && <div className="font-semibold text-foreground">{block.title}</div>}
            <div>
              <Markup text={block.text} />
            </div>
          </div>
        </aside>
      );
  }
}

function Complexity({ lesson }: { lesson: Lesson }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      <li>
        <strong className="text-foreground">Time:</strong> <Markup text={lesson.complexity.time} />
      </li>
      <li>
        <strong className="text-foreground">Space:</strong> <Markup text={lesson.complexity.space} />
      </li>
    </ul>
  );
}

function Hints({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-foreground">Hints</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Reveal one at a time when you’re stuck, before looking at the solution.
        </p>
      </div>
      <div className="space-y-2.5 pt-2">
        {hints.map((hint, i) =>
          i < revealed ? (
            <div key={i} className="rounded-lg border bg-elevated p-3.5">
              <div className="mb-1 text-xs font-semibold tracking-wider text-brand uppercase">Hint {i + 1}</div>
              <p className="leading-relaxed">
                <Markup text={hint} />
              </p>
            </div>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => setRevealed(i + 1)}
              className="flex w-full items-center justify-between rounded-lg border bg-elevated px-3.5 py-3 text-left text-xs font-medium transition-colors hover:bg-accent hover:text-foreground"
            >
              <span>Reveal hint {i + 1}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ),
        )}
      </div>
    </div>
  );
}
