import { PublicShell } from "@/components/PublicShell";
import { getLang } from "@/lib/i18n";
import { config, lineUrl } from "@/lib/config";

export const metadata = { title: "Privacy" };

// Thai needs a native speaker's check, like the rest of lib/i18n.ts.
const copy = {
  en: {
    title: "Privacy",
    sections: [
      [
        "What we keep",
        [
          "When you send a report or ask about adoption: what you wrote, the photo, where you were, and your LINE, Facebook or phone if you gave it.",
          "When you share your location on a dog's page: where you were and when.",
          "One cookie remembers your language. Volunteers who sign in get a second one that keeps them signed in.",
        ],
      ],
      [
        "Who sees it",
        [
          "Only Pai Dogs volunteers. Dog pages show the area a dog lives in and its caretaker's LINE, never a GPS point or the details you send us.",
        ],
      ],
      ["Deleting what you sent", ["Message us with roughly when you sent it, and we'll delete it."]],
    ],
    contact: "Message us on LINE",
  },
  th: {
    title: "ความเป็นส่วนตัว",
    sections: [
      [
        "ข้อมูลที่เราเก็บ",
        [
          "เมื่อคุณส่งรายงานหรือสอบถามเรื่องรับเลี้ยง: ข้อความที่คุณเขียน รูปภาพ ตำแหน่งที่คุณอยู่ และ LINE, Facebook หรือเบอร์โทรถ้าคุณให้ไว้",
          "เมื่อคุณแชร์ตำแหน่งในหน้าของหมา: ตำแหน่งที่คุณอยู่และเวลา",
          "คุกกี้หนึ่งตัวจำภาษาที่คุณเลือก อาสาสมัครที่เข้าสู่ระบบจะมีอีกตัวเพื่อให้อยู่ในระบบ",
        ],
      ],
      [
        "ใครเห็นข้อมูล",
        ["เฉพาะอาสาสมัคร Pai Dogs เท่านั้น หน้าของหมาแสดงย่านที่หมาอยู่และ LINE ของผู้ดูแล ไม่แสดงพิกัด GPS หรือข้อมูลที่คุณส่งมา"],
      ],
      ["การลบข้อมูลที่คุณส่ง", ["ส่งข้อความหาเราพร้อมบอกเวลาคร่าว ๆ ที่คุณส่ง แล้วเราจะลบให้"]],
    ],
    contact: "ส่งข้อความทาง LINE",
  },
} as const;

export default async function Privacy() {
  const lang = await getLang();
  const c = copy[lang];
  return (
    <PublicShell lang={lang} back={{ href: "/", label: lang === "th" ? "กลับ" : "Back" }} title={c.title}>
      {c.sections.map(([heading, lines]) => (
        <section key={heading} className="mt-7 first:mt-0">
          <h2 className="text-section">{heading}</h2>
          {lines.map((l) => (
            <p key={l} className="mt-2 text-body text-label-2">
              {l}
            </p>
          ))}
        </section>
      ))}
      {config.contactLine && (
        <a href={lineUrl(config.contactLine)} className="btn-outline mt-8">
          {c.contact}
        </a>
      )}
    </PublicShell>
  );
}
