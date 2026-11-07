import { DogForm } from "@/components/DogForm";
import { createDog } from "../../../actions";
import { normalizeCode } from "@/lib/codes";

export default async function NewDog({ searchParams }: PageProps<"/admin/dogs/new">) {
  const { tag } = await searchParams;
  const code = typeof tag === "string" ? normalizeCode(tag) : undefined;
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">New dog</h1>
      {code && (
        <p className="mb-4 text-stone-600">
          Will be linked to tag <span className="font-mono font-semibold">{code}</span>
        </p>
      )}
      <DogForm action={createDog} tag={code} submit="Save dog" />
    </div>
  );
}
