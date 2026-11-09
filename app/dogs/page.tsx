import { PublicShell } from "@/components/PublicShell";
import { DogBrowser } from "@/components/DogBrowser";
import { getLang, t } from "@/lib/i18n";
import { publicDogs } from "@/lib/data";

export const metadata = { title: "Meet our dogs" };

export default async function BrowseDogs() {
  const lang = await getLang();
  const s = t(lang);
  const dogs = await publicDogs();

  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }} title={s.browseDogs}>
      <DogBrowser dogs={dogs} s={s} />
    </PublicShell>
  );
}
