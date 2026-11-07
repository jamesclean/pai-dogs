import { redirect } from "next/navigation";
import { checkPassword, startSession } from "@/lib/auth";
import { Paw } from "@/components/PublicShell";

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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4">
      <div className="card">
        <Paw className="h-10 w-10 text-brand" />
        <h1 className="mt-2 text-xl font-bold">Volunteer login</h1>
        <form action={login} className="mt-4 space-y-3">
          <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
          <input name="password" type="password" placeholder="Password" className="input" autoFocus required />
          {error && <p className="text-sm text-red-600">Wrong password</p>}
          <button className="btn-brand w-full">Log in</button>
        </form>
      </div>
    </main>
  );
}
