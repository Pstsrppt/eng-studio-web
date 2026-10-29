"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

/** A labelled password input with a show / hide button. `aside` sits at the end of the label row (e.g. a link). */
export function PasswordField({ id, name = id, label, autoComplete, minLength, value, onChange, hint, aside }: {
  id: string;
  name?: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  value?: string;
  onChange?: (v: string) => void;
  hint?: string;
  aside?: React.ReactNode;
}) {
  const [shown, setShown] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-(--ac-ink)">{label}</label>
        {aside}
      </div>
      <div className="relative">
        <input id={id} name={name} type={shown ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete}
          className="input w-full pr-12" aria-describedby={hintId} spellCheck={false} autoCapitalize="none"
          {...(onChange ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : {})} />
        <button type="button" onClick={() => setShown((s) => !s)} aria-controls={id} aria-pressed={shown}
          aria-label={shown ? `ซ่อน${label}` : `แสดง${label}`}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-(--ac-muted) hover:text-(--ac-navy)">
          {shown ? <EyeOffIcon className="size-5" aria-hidden /> : <EyeIcon className="size-5" aria-hidden />}
        </button>
      </div>
      {hint && <p id={hintId} className="text-xs text-(--ac-muted)">{hint}</p>}
    </div>
  );
}
