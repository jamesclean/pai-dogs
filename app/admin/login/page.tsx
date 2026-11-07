import { redirect } from "next/navigation";
import { checkPassword, startSession } from "@/lib/auth";
import { Paw } from "@/components/PublicShell";
import { config } from "@/lib/config";

async function login(formData: FormData) {
  "use server";
  // Small delay blunts password guessing.
  await new Promise((r) => setTimeout(r, 500));
  if (!checkPassword(String(formData.get("password") ?? ""))) redirect("/admin/login?error=1");
  await startSession();
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
}

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error, next } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-brand text-white shadow-[0_10px_30px_rgba(255,79,0,0.35)]">
          <Paw className="h-11 w-11" />
        </span>
        <h1 className="mt-6 text-[28px] font-bold tracking-tight">{config.programName}</h1>
        <p className="mt-1 text-[17px] text-label-2">Volunteer sign in</p>
      </div>
      <form action={login} className="mt-10 space-y-3">
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        <input name="password" type="password" placeholder="Password" className="field" autoFocus required />
        {error && <p className="px-1 text-[15px] text-bad">Wrong password</p>}
        <button className="btn-brand w-full">Sign in</button>
      </form>
    </main>
  );
}
