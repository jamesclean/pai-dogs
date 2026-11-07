import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { getLang, t } from "@/lib/i18n";

export default async function NotFound() {
  const lang = await getLang();
  const s = t(lang);
  return (
    <PublicShell lang={lang}>
      <div className="card text-center">
        <p className="text-stone-700">{s.unknownCode}</p>
        <Link href="/" className="btn-brand mt-4">
          {s.typeCode}
        </Link>
      </div>
    </PublicShell>
  );
}
