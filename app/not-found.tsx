import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { getLang, t } from "@/lib/i18n";

export default async function NotFound() {
  const lang = await getLang();
  const s = t(lang);
  return (
    <PublicShell lang={lang}>
      <div className="pt-20 text-center">
        <p className="text-[17px] text-label-2">{s.unknownCode}</p>
        <Link href="/" className="btn-tinted mt-6">
          {s.typeCode}
        </Link>
      </div>
    </PublicShell>
  );
}
