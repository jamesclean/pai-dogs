import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { Chat, Paw, Phone } from "@/components/Icons";
import { getLang, t, fill } from "@/lib/i18n";
import { totalDogCount } from "@/lib/data";
import { config, lineUrl } from "@/lib/config";

export default async function Home() {
  const lang = await getLang();
  const s = t(lang);
  const n = await totalDogCount();

  const secondary = [
    { href: "/report", image: "/home/megaphone.webp", title: s.reportDog },
    { href: "/lookup", image: "/home/collar.webp", title: s.lookUp, sub: s.lookUpSub, badge: s.comingSoon },
  ];

  return (
    <PublicShell lang={lang} adminLabel={s.logInToAdmin}>
      <nav>
        <Link
          href="/dogs"
          className="card tappable relative flex flex-col rounded-[28px] p-5 transition active:scale-[0.98]"
        >
          <span className="chip absolute top-4 right-4">
            <Paw className="h-4 w-4" />
            {n === 1 ? s.oneDog : fill(s.dogsCount, { n })}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/dog.webp" alt="" width={567} height={640} className="mx-auto h-[210px] w-auto" />
          <h1 className="mt-3 text-title">{s.browseDogs}</h1>
          <p className="mt-1 text-subhead text-balance text-label-2">{s.tagline}</p>
        </Link>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {secondary.map(({ href, image, title, sub, badge }) => (
            <Link
              key={href}
              href={href}
              className="card tappable relative flex flex-col rounded-[24px] p-4 transition active:scale-[0.98]"
            >
              {badge && <span className="chip absolute top-4 right-4">{badge}</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" width={360} height={360} className="h-[84px] w-auto self-start" />
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
