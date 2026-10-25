import { Accueil } from "@/components/pages/Accueil";
import { metaPage } from "@/lib/partage";

export const metadata = metaPage({ chemin: "/en/", autre: "/", langue: "en" });

export default function HomeEn() {
  return <Accueil l="en" />;
}
