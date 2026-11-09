"use client";
import { useState } from "react";
import { UpDown } from "./Icons";
import type { Dict } from "@/lib/i18n";

export function ContactField({ s, required = false }: { s: Dict; required?: boolean }) {
  const [type, setType] = useState("line");
  const options = [
    ["line", "LINE"],
    ["facebook", "Facebook"],
    ["phone", s.phone],
    ["other", s.c_other],
  ];

  return (
    <div>
      <span className="field-label">{s.yourContact}</span>
      <div className="flex gap-2">
        <div className="relative w-[132px] shrink-0">
          <select
            name="contactType"
            aria-label={s.yourContact}
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="field h-[50px] cursor-pointer appearance-none pr-9"
          >
            {options.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <UpDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-label-3" />
        </div>
        <input
          name="contact"
          type={type === "phone" ? "tel" : "text"}
          required={required}
          maxLength={180}
          aria-label={s.yourContact}
          autoCapitalize="off"
          autoCorrect="off"
          className="field h-[50px] min-w-0 flex-1"
        />
      </div>
      <span className="field-help">{s.contactHelp}</span>
    </div>
  );
}
