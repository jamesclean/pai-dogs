import { DogForm } from "@/components/DogForm";
import { createDog } from "../../../actions";
import { normalizeCode } from "@/lib/codes";

export default async function NewDog({ searchParams }: PageProps<"/admin/dogs/new">) {
  const { tag } = await searchParams;
  const code = typeof tag === "string" ? normalizeCode(tag) : undefined;
  return (
    <div className="pt-8">
      <h1 className="large-title">New dog</h1>
      {code && (
        <p className="mt-2 text-[17px] text-label-2">
          Tag <span className="font-mono font-semibold tracking-wider text-label">{code}</span>
        </p>
      )}
      <DogForm action={createDog} tag={code} submit="Save dog" />
    </div>
  );
}
