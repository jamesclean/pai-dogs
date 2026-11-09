import { signOut } from "@/app/admin/actions";
import { BackButton } from "./PublicShell";
import { MeetDogs } from "./Icons";
import { HoverLabel } from "./HoverLabel";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button aria-label="Go back to meet our dogs" className="circle-btn group relative z-10 hover:z-40 focus-visible:z-40">
        <MeetDogs className="h-5 w-5" />
        <HoverLabel className="top-full right-0 mt-2">Go back to meet our dogs</HoverLabel>
      </button>
    </form>
  );
}

// Title on the left, one action on the right; or a back button row.
export function AdminHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pt-2 pb-4">
      <h1 className="text-title">{title}</h1>
      {right}
    </div>
  );
}

export function AdminNavRow({ back, right }: { back: { href: string; label: string }; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pt-1 pb-2">
      <BackButton {...back} />
      {right}
    </div>
  );
}
