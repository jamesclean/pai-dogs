import { redirect } from "next/navigation";
import { checkPassword, startSession } from "@/lib/auth";
import { config } from "@/lib/config";
import { allow } from "@/lib/ratelimit";
import { Paw } from "@/components/Icons";
import { BackButton } from "@/components/PublicShell";

async function login(formData: FormData) {
  "use server";
  // Small delay blunts password guessing.
  await new Promise((r) => setTimeout(r, 500));
  if (!(await allow("login", 10, 900))) redirect("/admin/login?error=2");
  if (!checkPassword(String(formData.get("password") ?? ""))) redirect("/admin/login?error=1");
  await startSession();
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
}

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error, next } = await searchParams;
  return (
    <>
      <header className="mx-auto w-full max-w-xl px-4 pt-[max(env(safe-area-inset-top),12px)]">
        <BackButton href="/" label="Back" />
      </header>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <span className="tile h-[72px] w-[72px] rounded-[22px] bg-brand text-white shadow-[0_10px_28px_-4px_rgba(255,79,0,0.3)]">
            <Paw className="h-[38px] w-[38px]" />
          </span>
          <h1 className="mt-6 text-title">{config.programName}</h1>
          <p className="mt-1.5 text-subhead text-label-2">Admin sign in</p>
        </div>
        <form action={login} className="mt-10">
          <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
          <input
            name="password"
            type="password"
            placeholder="Password"
            aria-label="Password"
            className="field h-[50px]"
            autoFocus
            required
          />
          {error && (
            <p className="mt-2 text-footnote text-bad">
              {error === "2" ? "Too many tries. Try again later." : "Wrong password. Try again."}
            </p>
          )}
          <button className="btn-primary mt-3 w-full">Sign in</button>
        </form>
      </main>
    </>
  );
}
