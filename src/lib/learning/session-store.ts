// Where a Smart Flashcard session is up to, kept in this browser so a reload or a closed tab resumes
// at the same card. Grades themselves are saved in the database as they happen; this only remembers
// the order, the position and an answer still being sent (so it is re-sent with the same event id).
import type { Grade } from "./srs";
import type { LearnMode } from "./queue";

export const SESSION_VERSION = 1;
const PREFIX = "learn-session";
export const sessionKey = (userKey: string) => `${PREFIX}:v${SESSION_VERSION}:${userKey}`;

export type SavedSession = {
  v: typeof SESSION_VERSION;
  id: string;
  day: string;
  mode: LearnMode;
  deck?: string;
  /** Cards in order; a word answered Again is added once more at the end. */
  queue: string[];
  newIds: string[];
  pos: number;
  /** Last grade per word, and how many of each grade were given. */
  results: Record<string, { grade: Grade; dueOn?: string; intervalDays?: number }>;
  counts: Record<Grade, number>;
  pending?: { itemId: string; grade: Grade; eventId: string; ms?: number };
  xpStart: number;
  xpNow: number;
  guest: boolean;
};

/** Reads a saved session; anything malformed or from an older version is ignored, never trusted. */
export function readSession(userKey: string): SavedSession | null {
  try {
    const raw = localStorage.getItem(sessionKey(userKey));
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedSession;
    const valid = s && s.v === SESSION_VERSION && typeof s.id === "string" && typeof s.day === "string"
      && Array.isArray(s.queue) && s.queue.every((x) => typeof x === "string")
      && Number.isInteger(s.pos) && s.pos >= 0 && s.pos <= s.queue.length
      && s.results && typeof s.results === "object" && s.counts && typeof s.counts === "object";
    if (!valid) {
      localStorage.removeItem(sessionKey(userKey));
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

/** Saves; returns false when storage is full or blocked (the session then lives only in this page). */
export function writeSession(userKey: string, s: SavedSession) {
  try {
    localStorage.setItem(sessionKey(userKey), JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(userKey: string) {
  try {
    localStorage.removeItem(sessionKey(userKey));
  } catch {}
}

/** True while there are cards left to answer. */
export const inProgress = (s: SavedSession | null): s is SavedSession => !!s && s.pos < s.queue.length;
