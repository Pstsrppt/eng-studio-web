// Diagrams for words a photo can't show well: how often, when, why, where. Drawn with HTML/SVG
// by components/word-diagram.tsx, so every label here is plain text that can be checked and edited.

/** A point on a 0–100 scale (how often, how likely, how much). `limit`: the most that is OK (too). `target`: the goal (almost). */
export type ScaleDiagram = { type: "scale"; unit: "freq" | "chance" | "degree"; value: number; limit?: number; target?: number };

/** Positions are 0–100 from past to future. `now` defaults to 65; null hides it. */
export type TimelineDiagram = {
  type: "timeline";
  now?: number | null;
  dots?: { at: number; label: string; done?: boolean; ask?: boolean; miss?: boolean; strong?: boolean }[];
  span?: { from: number; to: number; label: string; open?: boolean; wait?: boolean; late?: boolean };
};

/** Two ideas and how they connect: cause → effect, "but still", "only if", at the same time, one replaced by another. */
export type FlowDiagram = { type: "flow"; link: "add" | "correct" | "swap" | "cause" | "contrast" | "condition" | "same-time"; a: string; b: string };

/** Bars to compare amounts. `hi` marks the bar the word is about; `extra` stacks an added part on top. */
export type BarsDiagram = {
  type: "bars";
  bars: { label: string; value: number; hi?: boolean; extra?: number }[];
  line?: { value: number; label: string };
  trend?: "up" | "down";
};

/** Where things are relative to each other. */
export type PlaceDiagram = { type: "place"; rel: "between" | "through" | "within" | "without" | "near" | "everywhere" | "abroad" | "source"; a: string; b?: string };

export type CompareDiagram = { type: "compare"; rel: "same" | "differ"; a: string; b: string };

/** Steps in order; `hi` is the step the example talks about (-1 for the whole process). */
export type StepsDiagram = { type: "steps"; steps: string[]; hi: number };

/** V1–V2–V3 on a timeline with the example sentences. The forms come from the verb itself. */
export type VerbDiagram = { type: "verb" };

export type Diagram = ScaleDiagram | TimelineDiagram | FlowDiagram | BarsDiagram | PlaceDiagram | CompareDiagram | StepsDiagram | VerbDiagram;

/** What a verb diagram needs from the verb. */
export type VerbForms = { v1: string; v2: string; v3: string; ex2?: string; ex2Th?: string; ex3?: string; ex3Th?: string };
