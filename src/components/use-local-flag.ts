"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "es-local-flag";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The stored "1"/"0" as a yes/no; nothing stored yet means `fallback`. */
export function flagValue(raw: string | null, fallback: boolean): boolean {
  return raw === null ? fallback : raw === "1";
}

/** A yes/no setting kept in this browser. The server render always uses `fallback`. */
export function useLocalFlag(key: string, fallback: boolean): [boolean, (value: boolean) => void] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const value = flagValue(raw, fallback);
  const set = useCallback(
    (next: boolean) => {
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  return [value, set];
}
