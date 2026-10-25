import type { Metadata } from "next";
import { PageLicence, TEXTES_LICENCE } from "@/components/pages/PageLicence";
import { chemin } from "@/lib/i18n";
import { metaPage } from "@/lib/partage";

export const metadata: Metadata = metaPage({
  chemin: chemin("licence", "fr"),
  autre: chemin("licence", "en"),
  titre: TEXTES_LICENCE.fr.titre,
  description: TEXTES_LICENCE.fr.description,
});

export default function Page() {
  return <PageLicence l="fr" />;
}
