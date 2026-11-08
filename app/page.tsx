import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { Chat, Chevron, Megaphone, Paw, Phone, Qr } from "@/components/Icons";
import { getLang, t, fill } from "@/lib/i18n";
import { activeDogCount } from "@/lib/data";
import { config, lineUrl } from "@/lib/config";

export default async function Home() {
  const lang = await getLang();
  const s = t(lang);
  const n = await activeDogCount();

  const tasks = [
    { href: "/dogs", Icon: Paw, title: s.browseDogs, sub: fill(s.browseSub, { n }) },
    { href: "/lookup", Icon: Qr, title: s.lookUp, sub: s.lookUpSub },
  ];

  return (
    <PublicShell lang={lang} adminLabel={s.adminSignIn}>
      <section className="relative h-[300px] overflow-hidden rounded-[28px] bg-map shadow-card">
        <HeroMap />
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-linear-to-t from-surface from-45% to-transparent" />
        <span className="chip absolute top-4 left-4">
          <Paw className="h-4 w-4" />
          {n === 1 ? s.oneDog : fill(s.dogsCount, { n })}
        </span>
        <h1 className="absolute inset-x-5 bottom-5 text-title text-balance">{s.tagline}</h1>
      </section>

      <nav className="mt-3 grid grid-cols-2 gap-2.5">
        <Link
          href="/report"
          className="col-span-2 flex items-center gap-3.5 rounded-[24px] bg-brand-soft p-4 transition active:scale-[0.98]"
        >
          <span className="tile h-10 w-10 shrink-0 rounded-[12px] bg-surface-raised text-brand">
            <Megaphone className="h-[22px] w-[22px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-section">{s.reportDog}</span>
            <span className="mt-0.5 block text-footnote text-label-2">{s.reportDogSub}</span>
          </span>
          <Chevron className="h-4 w-4 shrink-0 text-label-3" />
        </Link>
        {tasks.map(({ href, Icon, title, sub }) => (
          <Link
            key={href}
            href={href}
            className="card flex min-h-[150px] flex-col justify-between rounded-[24px] p-4 transition active:scale-[0.98]"
          >
            <span className="tile h-10 w-10 rounded-[12px] border border-sep bg-surface-raised">
              <Icon className="h-[22px] w-[22px]" />
            </span>
            <span>
              <span className="block text-section">{title}</span>
              <span className="mt-0.5 block text-footnote text-label-2">{sub}</span>
            </span>
          </Link>
        ))}
      </nav>

      {(config.contactLine || config.contactPhone) && (
        <section className="mt-8">
          <h2 className="text-section">{s.contact}</h2>
          <div className="mt-1">
            {config.contactLine && (
              <div className="row">
                <span className="tile h-10 w-10 rounded-[12px] bg-line text-white">
                  <Chat className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-callout">LINE</p>
                  <p className="text-footnote text-label-2">{config.contactLine}</p>
                </div>
                <a href={lineUrl(config.contactLine)} className="btn-outline btn-sm">
                  {s.messageUs}
                </a>
              </div>
            )}
            {config.contactPhone && (
              <div className="row">
                <span className="tile h-10 w-10 rounded-[12px] bg-fill">
                  <Phone className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-callout">{config.contactPhone}</p>
                  <p className="text-footnote text-label-2">{s.phone}</p>
                </div>
                <a href={`tel:${config.contactPhone}`} className="btn-outline btn-sm">
                  {s.callUs}
                </a>
              </div>
            )}
          </div>
        </section>
      )}
    </PublicShell>
  );
}

// Decorative street map with dog pins. Not real positions: GPS stays with volunteers.
function HeroMap() {
  const pins = [
    [70, 96],
    [128, 150],
    [196, 118],
    [248, 176],
    [300, 92],
    [160, 226],
    [92, 200],
    [226, 62],
  ];
  return (
    <svg viewBox="0 0 358 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d="M-20 266C60 238 120 284 190 266S300 220 380 238" className="stroke-link" strokeOpacity="0.14" strokeWidth="16" fill="none" />
      <g className="stroke-map-street" strokeWidth="5" fill="none" strokeLinecap="round">
        {[34, 92, 150, 206, 262, 318].map((x, i) => (
          <path key={x} d={`M${x} -10L${x + 12 - i} 310`} />
        ))}
        {[28, 84, 140, 196, 252].map((y) => (
          <path key={y} d={`M-10 ${y}L370 ${y + 12}`} />
        ))}
      </g>
      <path d="M-20 70C80 60 150 110 220 100S320 40 380 50" className="stroke-map-street" strokeWidth="11" fill="none" strokeLinecap="round" />
      {pins.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6" className="fill-brand stroke-surface-raised" strokeWidth="3" />
      ))}
    </svg>
  );
}
