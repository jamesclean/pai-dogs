import { redirect } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { Search, Bubble, Phone, Chevron } from "@/components/Icons";
import { getLang, t } from "@/lib/i18n";
import { activeDogCount } from "@/lib/data";
import { config, lineUrl } from "@/lib/config";
import { normalizeCode } from "@/lib/codes";

async function lookup(formData: FormData) {
  "use server";
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (code) redirect(`/d/${code}`);
}

export default async function Home() {
  const lang = await getLang();
  const s = t(lang);
  const n = await activeDogCount();
  return (
    <PublicShell lang={lang}>
      <section className="pt-10 pb-8">
        <h1 className="large-title text-balance">{s.tagline}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-label-2">{s.homeIntro}</p>
      </section>

      <p className="flex items-baseline gap-3">
        <span className="text-[64px] leading-none font-semibold tracking-[-0.04em] text-brand">{n}</span>
        <span className="text-[17px] text-label-2">{s.dogsInProgram}</span>
      </p>

      <section className="mt-12">
        <p className="mb-3 text-[17px] leading-snug">{s.homeScan}</p>
        <form action={lookup} className="flex gap-2">
          <label className="field flex items-center gap-2 py-0">
            <Search className="h-[18px] w-[18px] shrink-0 text-label-2" />
            <input
              name="code"
              placeholder={s.codePlaceholder}
              autoCapitalize="characters"
              autoComplete="off"
              className="cell-input h-[50px] font-mono uppercase tracking-[0.2em] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
            />
          </label>
          <button className="btn-brand shrink-0">{s.go}</button>
        </form>
      </section>

      {(config.contactLine || config.contactPhone) && (
        <section className="mt-9">
          <h2 className="section-header">{s.contactProgram}</h2>
          <div className="inset-group">
            {config.contactLine && (
              <a href={lineUrl(config.contactLine)} className="cell cell-icon active:bg-fill">
                <span className="icon-tile bg-[#06C755]">
                  <Bubble className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">LINE</span>
                <span className="text-label-2">{config.contactLine}</span>
                <Chevron className="h-4 w-4 text-label-3" />
              </a>
            )}
            {config.contactPhone && (
              <a href={`tel:${config.contactPhone}`} className="cell cell-icon active:bg-fill">
                <span className="icon-tile bg-ok">
                  <Phone className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">{config.contactPhone}</span>
                <Chevron className="h-4 w-4 text-label-3" />
              </a>
            )}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
