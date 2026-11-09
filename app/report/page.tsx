import { PublicShell } from "@/components/PublicShell";
import { ReportForm } from "@/components/ReportForm";
import { getLang, t } from "@/lib/i18n";
import { vet } from "@/lib/config";
import { publicDogs } from "@/lib/data";
import { groupOf } from "@/lib/dog-groups";
import { submitNewReport } from "./actions";

export const metadata = { title: "Report a dog sighting" };

export default async function ReportDog() {
  const lang = await getLang();
  const s = t(lang);
  const dogs = (await publicDogs())
    .filter((d) => groupOf(d) !== "memory")
    .map(({ id, name, area, photoId, status, homeStatus }) => ({ id, name, area, photoId, status, homeStatus }));
  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }} title={s.reportDog}>
      <ReportForm
        action={submitNewReport}
        s={s}
        back={{ href: "/", label: s.backHome }}
        vet={vet}
        dogs={dogs}
      />
    </PublicShell>
  );
}
