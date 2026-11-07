import { Paw } from "./PublicShell";

export function DogPhoto({ photoId, alt, className = "" }: { photoId: number | null; alt: string; className?: string }) {
  if (!photoId)
    return (
      <div className={`flex items-center justify-center bg-brand-soft text-brand ${className}`}>
        <Paw className="h-1/3 w-1/3 opacity-80" />
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/photos/${photoId}`} alt={alt} className={`object-cover ${className}`} />;
}
