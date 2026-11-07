import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, endSession } from "@/lib/auth";
import { Paw } from "@/components/PublicShell";
import { AdminNav } from "@/components/AdminNav";

async function logout() {
  "use server";
  await endSession();
  redirect("/");
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <>
      <header className="glass sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto grid h-[52px] max-w-3xl grid-cols-[1fr_auto_1fr] items-center px-4">
          <Link href="/" aria-label="Public site">
            <Paw className="h-[22px] w-[22px] text-brand" />
          </Link>
          <AdminNav />
          <form action={logout} className="justify-self-end">
            <button className="text-[17px] text-brand">Log out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16">{children}</main>
    </>
  );
}
