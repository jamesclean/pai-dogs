import { redirect } from "next/navigation";
import { PublicShell, Paw } from "@/components/PublicShell";
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
      <section className="rounded-3xl bg-brand p-6 text-white">
        <Paw className="mb-3 h-10 w-10" />
        <h1 className="text-2xl font-bold leading-tight">{s.tagline}</h1>
        <p className="mt-3 text-white/90">{s.homeIntro}</p>
        <p className="mt-5 text-4xl font-bold">
          {n} <span className="text-base font-medium">{s.dogsInProgram}</span>
        </p>
      </section>

      <section className="card mt-5">
        <p className="font-medium">{s.homeScan}</p>
        <form action={lookup} className="mt-3 flex gap-2">
          <input
            name="code"
            placeholder={s.typeCode}
            autoCapitalize="characters"
            autoComplete="off"
            className="input font-mono uppercase tracking-widest"
          />
          <button className="btn-brand">{s.go}</button>
        </form>
      </section>

      {(config.contactLine || config.contactPhone) && (
        <section className="card mt-5">
          <h2 className="font-semibold">{s.contactProgram}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {config.contactLine && (
              <a className="btn-ghost" href={lineUrl(config.contactLine)}>
                LINE: {config.contactLine}
              </a>
            )}
            {config.contactPhone && (
              <a className="btn-ghost" href={`tel:${config.contactPhone}`}>
                {config.contactPhone}
              </a>
            )}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
