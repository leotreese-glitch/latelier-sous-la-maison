import type { Metadata } from "next";
import { PageLicence, TEXTES_LICENCE } from "@/components/pages/PageLicence";
import { chemin } from "@/lib/i18n";
import { metaPage } from "@/lib/partage";

export const metadata: Metadata = metaPage({
  chemin: chemin("licence", "en"),
  autre: chemin("licence", "fr"),
  langue: "en",
  titre: TEXTES_LICENCE.en.titre,
  description: TEXTES_LICENCE.en.description,
});

export default function Page() {
  return <PageLicence l="en" />;
}
