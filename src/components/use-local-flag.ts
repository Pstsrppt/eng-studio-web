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

/** A yes/no setting kept in this browser. The server render always uses `fallback`. */
export function useLocalFlag(key: string, fallback: boolean): [boolean, (value: boolean) => void] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const value = raw === null ? fallback : raw === "1";
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
