import { Accueil } from "@/components/pages/Accueil";
import { chemin } from "@/lib/i18n";
import { metaPage } from "@/lib/partage";

export const metadata = metaPage({ chemin: "/", autre: chemin("accueil", "en") });

export default function PageAccueil() {
  return <Accueil l="fr" />;
}
