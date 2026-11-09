"use client";
import { useState } from "react";

const LENGTH = 5;

// Tag codes never use 0, O, 1, I or L.
function clean(value: string) {
  return value
    .toUpperCase()
    .replace(/[^2-9A-HJKMNP-Z]/g, "")
    .slice(0, LENGTH);
}

// Five separate boxes over one real input, so paste, delete and the phone's
// keyboard all work as normal.
export function CodeEntry({
  action,
  label,
  button,
}: {
  action: (form: FormData) => Promise<void>;
  label: string;
  button: string;
}) {
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <form action={action} className="mt-6">
      <label htmlFor="code" className="field-label">
        {label}
      </label>
      <div className="relative flex gap-2">
        {Array.from({ length: LENGTH }, (_, i) => {
          const active = focused && i === Math.min(code.length, LENGTH - 1);
          return (
            <div
              key={i}
              className={`flex h-14 flex-1 items-center justify-center rounded-[14px] border bg-surface-raised font-mono text-[22px] font-medium transition-colors ${
                active ? "border-inverse" : "border-sep"
              }`}
            >
              {code[i] ?? (active && <span className="h-6 w-px animate-pulse bg-label" />)}
            </div>
          );
        })}
        <input
          id="code"
          name="code"
          value={code}
          onChange={(e) => setCode(clean(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="absolute inset-0 h-full w-full text-base opacity-0"
        />
      </div>
      <button className="btn-primary mt-3 w-full" disabled={code.length < LENGTH}>
        {button}
      </button>
    </form>
  );
}
