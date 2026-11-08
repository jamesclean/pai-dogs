import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";
import { inboxCount } from "@/lib/data";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-36 print:max-w-none print:p-0">
        {children}
      </main>
      <AdminNav inbox={await inboxCount()} />
    </>
  );
}
