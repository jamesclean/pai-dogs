import { BackButton } from "./PublicShell";

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
