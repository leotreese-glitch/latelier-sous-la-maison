import type { Metadata } from "next";
import { PageExplorer, TEXTES_EXPLORER } from "@/components/pages/PageExplorer";
import { chemin } from "@/lib/i18n";
import { metaPage } from "@/lib/partage";

export const metadata: Metadata = metaPage({
  chemin: chemin("explorer", "fr"),
  autre: chemin("explorer", "en"),
  titre: TEXTES_EXPLORER.fr.titre,
  description: TEXTES_EXPLORER.fr.description,
});

export default function Page() {
  return <PageExplorer l="fr" />;
}
