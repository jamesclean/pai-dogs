import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DogProfile } from "@/components/DogProfile";
import { getDog, dogTags } from "@/lib/data";

async function load(rawId: string) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? getDog(id) : null;
}

export async function generateMetadata({ params }: PageProps<"/dogs/[id]">): Promise<Metadata> {
  const dog = await load((await params).id);
  return { title: dog?.name ?? "Dog", robots: { index: false } };
}

export default async function DogPage({ params }: PageProps<"/dogs/[id]">) {
  const dog = await load((await params).id);
  if (!dog) notFound();
  const tag = (await dogTags(dog.id)).find((x) => !x.retired);
  return <DogProfile dog={dog} tagCode={tag?.code} />;
}
