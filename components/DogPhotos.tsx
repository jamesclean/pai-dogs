"use client";
import { useRef, useState, useTransition } from "react";
import { Camera, Star } from "./Icons";
import { DeleteEntryButton } from "./DeleteEntryButton";
import { DogPhoto } from "./DogPhoto";
import { HoverLabel } from "./HoverLabel";
import { resizePhoto } from "./PhotoInput";
import { MAX_DOG_PHOTOS } from "@/lib/pai";

// Crew's photo manager on a dog's page. One photo is the profile photo.
export function DogPhotos({
  photoIds,
  profileId,
  addPhoto,
  setProfile,
  deletePhoto,
}: {
  photoIds: number[];
  profileId: number | null;
  addPhoto: (form: FormData) => Promise<void>;
  setProfile: (photoId: number) => Promise<void>;
  deletePhoto: (photoId: number) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);
  const room = MAX_DOG_PHOTOS - photoIds.length;

  function upload(files: File[]) {
    setFailed(false);
    start(async () => {
      try {
        for (const file of files.slice(0, room)) {
          const form = new FormData();
          form.set("photo", await resizePhoto(file));
          await addPhoto(form);
        }
      } catch {
        setFailed(true);
      }
      if (input.current) input.current.value = "";
    });
  }

  return (
    <section className="mt-7">
      <h2 className="text-section">Photos</h2>
      <div className="mt-2 grid grid-cols-2 gap-2.5 min-[360px]:grid-cols-3">
        {photoIds.map((id) => (
          <div key={id} className="relative">
            <DogPhoto photoId={id} alt="" className="aspect-square w-full rounded-[16px]" />
            <div className="absolute top-1.5 left-1.5">
              {id === profileId ? (
                <span
                  aria-label="Profile photo"
                  className="circle-btn group relative z-10 bg-surface-raised! text-brand! hover:z-40"
                >
                  <Star className="h-5 w-5 fill-current" />
                  <HoverLabel className="top-full left-0 mt-2">Profile photo</HoverLabel>
                </span>
              ) : (
                <form action={setProfile.bind(null, id)}>
                  <button aria-label="Make profile photo" className="circle-btn group relative z-10 hover:z-40 focus-visible:z-40">
                    <Star className="h-5 w-5" />
                    <HoverLabel className="top-full left-0 mt-2">Make profile photo</HoverLabel>
                  </button>
                </form>
              )}
            </div>
            <div className="absolute top-1.5 right-1.5">
              <DeleteEntryButton action={deletePhoto.bind(null, id)} />
            </div>
          </div>
        ))}
        {room > 0 && (
          <label className="tappable flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] bg-surface text-center">
            <Camera className="h-6 w-6" />
            <span className="text-footnote">{pending ? "Adding…" : "Add photos"}</span>
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple
              disabled={pending}
              className="sr-only"
              onChange={(e) => upload([...(e.target.files ?? [])])}
            />
          </label>
        )}
      </div>
      {failed && <p className="mt-2 text-footnote text-bad">Photo didn&apos;t upload. Try again.</p>}
    </section>
  );
}
