import Link from "next/link";
import { requireAdmin, endSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Paw } from "@/components/PublicShell";
import { config } from "@/lib/config";

async function logout() {
  "use server";
  await endSession();
  redirect("/");
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <>
      <header className="bg-stone-900 text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3 text-sm">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <Paw className="h-5 w-5 text-brand" /> {config.programName}
          </Link>
          <nav className="flex flex-1 gap-4">
            <Link href="/admin">Dogs</Link>
            <Link href="/admin/tags">Tags</Link>
          </nav>
          <form action={logout}>
            <button className="text-stone-400">Log out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
    </>
  );
}
