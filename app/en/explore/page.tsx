import type { Metadata } from "next";
import { PageExplorer, TEXTES_EXPLORER } from "@/components/pages/PageExplorer";
import { chemin } from "@/lib/i18n";
import { metaPage } from "@/lib/partage";

export const metadata: Metadata = metaPage({
  chemin: chemin("explorer", "en"),
  autre: chemin("explorer", "fr"),
  langue: "en",
  titre: TEXTES_EXPLORER.en.titre,
  description: TEXTES_EXPLORER.en.description,
});

export default function Page() {
  return <PageExplorer l="en" />;
}
