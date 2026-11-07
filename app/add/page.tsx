import { PublicShell } from "@/components/PublicShell";
import { getLang, t } from "@/lib/i18n";
import { AddDogForm } from "./AddDogForm";

export const metadata = { title: "Add a new dog" };

export default async function AddDog() {
  const lang = await getLang();
  const s = t(lang);
  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }}>
      <h1 className="text-title">{s.addDog}</h1>
      <p className="mt-1 text-subhead text-label-2">{s.addDogSub}</p>
      <AddDogForm s={s} />
    </PublicShell>
  );
}
