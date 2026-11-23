/**
 * Splits a program's standard output into the learner's text and the harness's framed
 * events (`\u001E` + JSON + `\u001F`, see harness.java.ts). Output arrives a character
 * at a time, so the reader is incremental: feed it chunks as they come.
 */

const FRAME_START = '\u001E';
const FRAME_END = '\u001F';
export const FRAME_END_CODE = 0x1f;

interface ExceptionFields {
  exception?: string;
  detail?: string;
  trace?: [string, number][];
}

export type ProgramEvent =
  | { e: 'start'; i: number }
  | ({
      e: 'result';
      i: number;
      passed: boolean;
      actual?: string;
      expected?: string;
      message?: string;
      stdout?: string;
    } & ExceptionFields)
  | ({ e: 'exception' } & ExceptionFields)
  | { e: 'done' };

/** Output kept for display; beyond this the program is still graded but its text is cut. */
const MAX_OUTPUT_CHARS = 100_000;

export class EventReader {
  private text = '';
  private truncated = false;
  private frame: string | null = null;
  readonly events: ProgramEvent[] = [];

  push(chunk: string): void {
    let rest = chunk;
    while (rest) {
      if (this.frame === null) {
        const start = rest.indexOf(FRAME_START);
        this.appendText(start < 0 ? rest : rest.slice(0, start));
        if (start < 0) return;
        this.frame = '';
        rest = rest.slice(start + 1);
      } else {
        const end = rest.indexOf(FRAME_END);
        if (end < 0) {
          this.frame += rest;
          return;
        }
        this.finishFrame(this.frame + rest.slice(0, end));
        this.frame = null;
        rest = rest.slice(end + 1);
      }
    }
  }

  /** The learner's output so far. */
  get stdout(): string {
    return this.truncated ? `${this.text}\n… (output truncated)` : this.text;
  }

  private appendText(s: string) {
    if (!s || this.truncated) return;
    if (this.text.length + s.length > MAX_OUTPUT_CHARS) {
      this.text += s.slice(0, MAX_OUTPUT_CHARS - this.text.length);
      this.truncated = true;
    } else {
      this.text += s;
    }
  }

  private finishFrame(json: string) {
    let event: ProgramEvent;
    try {
      event = JSON.parse(json) as ProgramEvent;
    } catch {
      return; // A frame cut off by a crash; whatever was printed around it still counts.
    }
    this.events.push(event);
  }
}
