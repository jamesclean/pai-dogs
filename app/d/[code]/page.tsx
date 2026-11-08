import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell";
import { DogProfile } from "@/components/DogProfile";
import { getLang, t } from "@/lib/i18n";
import { getTag } from "@/lib/data";
import { isAdmin } from "@/lib/auth";

export async function generateMetadata({ params }: PageProps<"/d/[code]">): Promise<Metadata> {
  const row = await getTag((await params).code);
  return { title: row?.dog?.name ?? "Tag", robots: { index: false } };
}

export default async function DogByTag({ params }: PageProps<"/d/[code]">) {
  const { code } = await params;
  const row = await getTag(code);
  if (!row) notFound();
  const { tag, dog } = row;

  if (!dog || tag.retired) {
    const lang = await getLang();
    const s = t(lang);
    const admin = await isAdmin();
    return (
      <PublicShell lang={lang}>
        <div className="pt-16 text-center">
          <p className="font-mono text-[40px] leading-[44px] font-medium tracking-[8px]">{tag.code}</p>
          <p className="mt-3 text-body text-label-2">{s.tagNotLinked}</p>
          {admin && (
            <Link href={`/admin/tags/${tag.code}`} className="btn-primary mt-8 w-full">
              Link this tag to a dog
            </Link>
          )}
        </div>
      </PublicShell>
    );
  }

  return <DogProfile dog={dog} tagCode={tag.code} scanned />;
}
