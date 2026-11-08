import { Paw } from "./Icons";

export function DogPhoto({ photoId, alt, className = "" }: { photoId: number | null; alt: string; className?: string }) {
  if (!photoId)
    return (
      <div className={`flex items-center justify-center bg-fill text-label-3 ${className}`}>
        <Paw className="h-1/4 max-h-10 w-1/4 max-w-10" />
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/photos/${photoId}`} alt={alt} className={`object-cover ${className}`} />;
}
