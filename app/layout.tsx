import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { config } from "@/lib/config";
import { getLang } from "@/lib/i18n";
import "./globals.css";

const sans = Noto_Sans_Thai({
  variable: "--font-noto",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: config.programName, template: `%s · ${config.programName}` },
  description: "Community dogs of Pai, Thailand",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
