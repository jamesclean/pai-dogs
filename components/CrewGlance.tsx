import Link from "next/link";
import { countDistinct } from "drizzle-orm";
import { db, dogs, tags } from "@/db";
import { Chevron, Paw, Syringe, Tag } from "@/components/Icons";
import { rabiesCurrent } from "@/lib/dates";

// The rest of the platform in three rows, each opening its full list.
export async function CrewGlance() {
  const [all, [batches]] = await Promise.all([
    db.select({ status: dogs.status, rabies: dogs.rabiesVaccinatedOn }).from(dogs),
    db.select({ n: countDistinct(tags.batch) }).from(tags),
  ]);
  const missing = all.filter((d) => d.status === "missing").length;
  // Same rule as the Rabies due list: living dogs without a shot in the last year.
  const rabiesDue = all.filter((d) => d.status !== "deceased" && !rabiesCurrent(d.rabies)).length;

  const rows = [
    { href: "/admin", Icon: Paw, label: "Dogs", sub: missing ? `${missing} missing` : "", n: all.length },
    { href: "/admin?due=rabies", Icon: Syringe, label: "Rabies due", sub: "", n: rabiesDue },
    { href: "/admin/tags", Icon: Tag, label: "Tag batches", sub: "", n: batches.n },
  ];

  return (
    <section>
      <h2 className="text-section">At a glance</h2>
      <div className="card-rows mt-2">
        {rows.map(({ href, Icon, label, sub, n }) => (
          <Link key={href} href={href} className="row">
            <Icon className="h-[22px] w-[22px] shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-callout">{label}</span>
              {sub && <span className="block text-footnote text-label-2">{sub}</span>}
            </span>
            <span className="text-subhead text-label-2">{n}</span>
            <Chevron className="h-4 w-4 shrink-0 text-label-3" />
          </Link>
        ))}
      </div>
    </section>
  );
}
