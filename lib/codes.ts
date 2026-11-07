import { randomInt } from "node:crypto";

// No 0/O, 1/I/L: people read these off a scratched tag and type them in.
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CODE_LENGTH = 5;

export function newCode() {
  let s = "";
  for (let i = 0; i < CODE_LENGTH; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

export function normalizeCode(raw: string) {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "");
}
