import { redirect } from "next/navigation";
import Link from "next/link";
import { endSession } from "@/lib/auth";
import { AdminHeader } from "@/components/AdminHeader";
import { Chevron, Globe, Lock } from "@/components/Icons";

async function signOut() {
  "use server";
  await endSession();
  redirect("/");
}

export default function CrewPage() {
  return (
    <>
      <AdminHeader title="Crew" />
      <div className="card-rows">
        <Link href="/" className="row">
          <Globe className="h-[22px] w-[22px] shrink-0" />
          <span className="flex-1 text-callout">View public site</span>
          <Chevron className="h-4 w-4 shrink-0 text-label-3" />
        </Link>
        <form action={signOut}>
          <button className="row w-full text-left">
            <Lock className="h-[22px] w-[22px] shrink-0" />
            <span className="flex-1 text-callout">Sign out</span>
          </button>
        </form>
      </div>
    </>
  );
}
