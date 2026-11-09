import { signOut } from "@/app/admin/actions";
import { BackButton } from "./PublicShell";
import { Logout } from "./Icons";
import { HoverLabel } from "./HoverLabel";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button aria-label="Log out of admin" className="circle-btn group relative hover:z-40 focus-visible:z-40">
        <Logout className="h-5 w-5" />
        <HoverLabel className="top-full right-0 mt-2">Log out of admin</HoverLabel>
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
