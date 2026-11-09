import { PublicShell } from "@/components/PublicShell";
import { ReportForm } from "@/components/ReportForm";
import { getLang, t } from "@/lib/i18n";
import { vet } from "@/lib/config";
import { submitNewReport } from "./actions";

export const metadata = { title: "Report a dog sighting" };

export default async function ReportDog() {
  const lang = await getLang();
  const s = t(lang);
  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }} title={s.reportDog}>
      <ReportForm
        action={submitNewReport}
        s={s}
        notePlaceholder={s.looksLikePlaceholder}
        back={{ href: "/", label: s.backHome }}
        vet={vet}
      />
    </PublicShell>
  );
}
