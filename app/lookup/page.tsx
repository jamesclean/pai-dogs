import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { Qr } from "@/components/Icons";
import { getLang, t } from "@/lib/i18n";
import { normalizeCode } from "@/lib/codes";

export const metadata = { title: "Look up a dog" };

async function lookup(formData: FormData) {
  "use server";
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (code) redirect(`/d/${code}`);
}

export default async function LookUp() {
  const lang = await getLang();
  const s = t(lang);
  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }} title={s.lookUp}>
      <div className="card flex items-center gap-3.5 px-4 py-3.5">
        <span className="tile h-11 w-11 rounded-[14px] border border-sep bg-surface-raised">
          <Qr className="h-[22px] w-[22px]" />
        </span>
        <div>
          <p className="text-callout">{s.scanTag}</p>
          <p className="text-footnote text-label-2">{s.useCamera}</p>
        </div>
      </div>
      <form action={lookup} className="mt-6">
        <label htmlFor="code" className="field-label">
          {s.orType}
        </label>
        <div className="flex gap-2">
          <input
            id="code"
            name="code"
            placeholder={s.codePlaceholder}
            autoCapitalize="characters"
            autoComplete="off"
            className="field h-12 font-mono tracking-[0.2em] uppercase placeholder:tracking-[0.2em]"
          />
          <button className="btn-primary">{s.findDog}</button>
        </div>
      </form>
    </PublicShell>
  );
}
