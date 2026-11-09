import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { CollarArt } from "@/components/CollarArt";
import { MegaphoneArt } from "@/components/MegaphoneArt";
import { Chat, Paw, Phone } from "@/components/Icons";
import { getLang, t, fill } from "@/lib/i18n";
import { totalDogCount } from "@/lib/data";
import { config, lineUrl } from "@/lib/config";

// Side cards first, so the centre card sits on top of them.
const meetDogs = [
  { image: "/home/dog-left.webp", place: "fan-left top-2 left-[1.17%] h-36 w-[38.91%]", card: "border-[0.75px] shadow-card", size: "h-[90px] w-[90px]" },
  { image: "/home/dog-right.webp", place: "fan-right top-2 left-[59.85%] h-36 w-[38.91%]", card: "border-[0.75px] shadow-card", size: "h-[90px] w-[90px]" },
  { image: "/home/dog-centre.webp", place: "fan-centre top-0 left-[24.03%] h-40 w-[51.87%]", card: "border shadow-float", size: "h-[120px] w-[120px]" },
];

export default async function Home() {
  const lang = await getLang();
  const s = t(lang);
  const n = await totalDogCount();

  const secondary = [
    { href: "/report", art: <MegaphoneArt />, title: s.reportDog },
    { href: "/lookup", art: <CollarArt />, title: s.lookUp, sub: s.lookUpSub, badge: s.comingSoon },
  ];

  return (
    <PublicShell lang={lang} adminLabel={s.logInToAdmin}>
      <nav>
        <Link
          href="/dogs"
          className="card tappable relative flex flex-col rounded-[28px] p-5 transition active:scale-[0.98]"
        >
          <span className="chip absolute top-4 right-4 z-10">
            <Paw className="h-4 w-4" />
            {n === 1 ? s.oneDog : fill(s.dogsCount, { n })}
          </span>
          <div className="relative h-40">
            {meetDogs.map(({ image, place, card, size }) => (
              <span key={image} className={`fan-card absolute -m-10 box-content block p-10 ${place}`}>
                <span className={`flex h-full items-center justify-center rounded-[24px] border-sep bg-surface-raised ${card}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" width={360} height={360} className={size} />
                </span>
              </span>
            ))}
          </div>
          <h1 className="relative mt-3 text-title">{s.browseDogs}</h1>
          <p className="mt-1 text-subhead text-balance text-label-2">{s.tagline}</p>
        </Link>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {secondary.map(({ href, art, title, sub, badge }) => (
            <Link
              key={href}
              href={href}
              className="card tappable relative flex flex-col rounded-[24px] p-4 transition active:scale-[0.98]"
            >
              {badge && <span className="chip absolute top-4 right-4 z-10">{badge}</span>}
              {art}
              <span className="mt-3 block text-section">{title}</span>
              {sub && <span className="mt-0.5 block text-footnote text-label-2">{sub}</span>}
            </Link>
          ))}
        </div>
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
