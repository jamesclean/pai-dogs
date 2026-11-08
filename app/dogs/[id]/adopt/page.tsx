import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { submitAdoptionQuestion } from "@/app/report/actions";
import { getLang, t, fill } from "@/lib/i18n";
import { getDog } from "@/lib/data";
import { AdoptForm } from "./AdoptForm";

export const metadata = { title: "Ask about adoption", robots: { index: false } };

export default async function AdoptPage({ params }: PageProps<"/dogs/[id]/adopt">) {
  const id = Number((await params).id);
  const dog = Number.isInteger(id) && id > 0 ? await getDog(id) : null;
  if (dog?.homeStatus !== "ask_adoption" || dog.status === "deceased") notFound();
  const lang = await getLang();
  const s = t(lang);
  const href = `/dogs/${dog.id}`;
  return (
    <PublicShell lang={lang} back={{ href, label: dog.name }} title={s.askAdoption}>
      <div className="mb-5 flex items-center gap-3">
        <DogPhoto photoId={dog.photoId} alt="" className="h-12 w-12 rounded-[14px]" />
        <div className="min-w-0">
          <p className="text-callout">{dog.name}</p>
          {dog.area && <p className="truncate text-footnote text-label-2">{dog.area}</p>}
        </div>
      </div>
      <AdoptForm
        action={submitAdoptionQuestion.bind(null, dog.id)}
        s={s}
        back={{ href, label: fill(s.backTo, { name: dog.name }) }}
        photoId={dog.photoId}
      />
    </PublicShell>
  );
}
