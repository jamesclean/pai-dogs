// Runs before the production build on Vercel, so a new table exists before the
// code that needs it goes live. A failed migration fails the deploy, leaving the
// current version running. Does nothing on previews or locally.
import { execSync } from "node:child_process";

if (process.env.VERCEL_ENV === "production") {
  execSync("npx drizzle-kit migrate", { stdio: "inherit" });
}
