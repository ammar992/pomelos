import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "cookies");
}

export default async function CookiesPage({ params }: PageProps<"/[locale]/cookies">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <LegalPage doc="cookies" />;
}
